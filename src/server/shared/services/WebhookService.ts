import crypto from "crypto";
import { Queue } from "bullmq";
import { Knex as KnexInstance } from "../../database/knex";
import { EtableNames } from "../../database/ETableNames";
import { RedisService } from "./RedisService";
import type { ITenant } from "../../database/models";

let webhookQueue: Queue | null = null;

const getQueue = (): Queue => {
  if (!webhookQueue) {
    webhookQueue = new Queue("webhooks", {
      connection: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      },
    });
  }
  return webhookQueue;
};

/**
 * Dispatch a webhook event to the BullMQ queue.
 * The actual HTTP delivery is handled by the separate webhook worker process.
 */
export const dispatchWebhook = async (
  tenantId: number,
  eventType: string,
  payload: object,
): Promise<void> => {
  // Look up tenant to check if webhook_url is configured
  let tenant = await RedisService.get<ITenant>(`tenant:id:${tenantId}`);
  if (!tenant) {
    const dbTenant = await KnexInstance(EtableNames.tenants)
      .where("id_tenant", tenantId)
      .first();

    if (dbTenant) {
      tenant = dbTenant as ITenant;
      await RedisService.set(`tenant:id:${tenantId}`, tenant, 300);
    }
  }

  if (!tenant?.webhook_url) return; // No webhook configured, skip

  await getQueue().add(
    eventType,
    {
      tenantId,
      eventType,
      payload,
      webhookUrl: tenant.webhook_url,
      webhookSecret: tenant.webhook_secret,
    },
    {
      attempts: 5,
      backoff: { type: "exponential", delay: 60000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  );
};

/**
 * Generate HMAC-SHA256 signature for webhook payload verification.
 */
export const generateWebhookSignature = (
  payload: string,
  secret: string,
): string => {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
};
