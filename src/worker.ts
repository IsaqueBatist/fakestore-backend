/**
 * Webhook Worker - Isolated BullMQ consumer process.
 *
 * This runs in a SEPARATE container from the Express API to prevent
 * HTTP delivery and HMAC computation from blocking the API event loop.
 *
 * Usage: node ./build/worker.js
 * Docker: command: ["node", "./build/worker.js"]
 */

import "dotenv/config";
import { Worker } from "bullmq";
import { knex } from "knex";
import { generateWebhookSignature } from "./server/shared/services/WebhookService";
import { logger } from "./server/shared/services/Logger";

// Standalone Knex instance for the worker (not shared with Express)
const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database:
      process.env.NODE_ENV === "production"
        ? process.env.DB_NAME_PRODUCTION
        : process.env.DB_NAME,
  },
  pool: { min: 1, max: 5 },
});

const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

interface WebhookJobData {
  tenantId: number;
  eventType: string;
  payload: object;
  webhookUrl: string;
  webhookSecret: string | null;
}

const worker = new Worker<WebhookJobData>(
  "webhooks",
  async (job) => {
    const { tenantId, eventType, payload, webhookUrl, webhookSecret } =
      job.data;

    const body = JSON.stringify({
      event: eventType,
      data: payload,
      timestamp: new Date().toISOString(),
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Event-Type": eventType,
    };

    // Sign payload if secret is configured
    if (webhookSecret) {
      headers["X-Webhook-Signature"] = generateWebhookSignature(
        body,
        webhookSecret,
      );
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    // Log to webhook_events audit table
    await db("webhook_events").insert({
      tenant_id: tenantId,
      event_type: eventType,
      payload: body,
      status: response.ok ? "delivered" : "failed",
      attempts: job.attemptsMade + 1,
      last_attempt_at: new Date(),
      response_code: response.status,
    });

    if (!response.ok) {
      throw new Error(
        `Webhook delivery failed: HTTP ${response.status} from ${webhookUrl}`,
      );
    }

    logger.info(
      { tenantId, eventType, status: response.status },
      "Webhook delivered",
    );
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

worker.on("completed", (job) => {
  logger.info({ jobId: job.id, event: job.name }, "Webhook job completed");
});

worker.on("failed", (job, err) => {
  logger.error(
    { jobId: job?.id, attempt: job?.attemptsMade, maxAttempts: job?.opts?.attempts, err },
    "Webhook job failed",
  );
});

logger.info("Webhook worker started, waiting for jobs...");
