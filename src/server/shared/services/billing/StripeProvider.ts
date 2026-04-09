import crypto from "crypto";
import { IBillingProvider, BillingWebhookPayload } from "./IBillingProvider";

/**
 * Stripe billing provider implementation.
 *
 * Requires environment variables:
 * - STRIPE_SECRET_KEY: Stripe secret API key
 * - STRIPE_WEBHOOK_SECRET: Stripe webhook signing secret
 *
 * For full Stripe SDK integration, install the `stripe` npm package
 * and replace the HTTP calls with SDK methods.
 */
export class StripeProvider implements IBillingProvider {
  private webhookSecret: string;

  constructor() {
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  }

  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (!this.webhookSecret || !signature) return false;

    // Stripe signature format: t=timestamp,v1=hash
    const parts = signature.split(",");
    const timestampPart = parts.find((p) => p.startsWith("t="));
    const signaturePart = parts.find((p) => p.startsWith("v1="));

    if (!timestampPart || !signaturePart) return false;

    const timestamp = timestampPart.slice(2);
    const expectedSig = signaturePart.slice(3);

    const payload = `${timestamp}.${typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8")}`;
    const computed = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(expectedSig, "hex"),
    );
  }

  parseWebhookPayload(rawBody: string | Buffer): BillingWebhookPayload {
    const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8");
    const parsed = JSON.parse(body);
    const eventType = parsed.type as string;
    const data = parsed.data?.object || {};

    // Map Stripe event types to normalized billing events
    const eventMap: Record<string, string> = {
      "checkout.session.completed": "subscription.activated",
      "customer.subscription.updated": "subscription.updated",
      "customer.subscription.deleted": "subscription.cancelled",
      "invoice.payment_failed": "payment.failed",
    };

    return {
      event: eventMap[eventType] || eventType,
      subscription_id: data.subscription || data.id || "",
      plan: data.metadata?.plan || data.items?.data?.[0]?.price?.lookup_key || "sandbox",
      customer_email: data.customer_email || data.customer_details?.email || "",
    };
  }

  async createSubscription(
    tenantId: number,
    plan: string,
    email: string,
  ): Promise<{ url: string; subscription_id: string }> {
    // Placeholder: integrate with Stripe Checkout Sessions API
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const session = await stripe.checkout.sessions.create({...});
    throw new Error(
      `Stripe createSubscription not yet configured. tenantId=${tenantId}, plan=${plan}, email=${email}`,
    );
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    // Placeholder: integrate with Stripe Subscriptions API
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // await stripe.subscriptions.cancel(subscriptionId);
    throw new Error(
      `Stripe cancelSubscription not yet configured. subscriptionId=${subscriptionId}`,
    );
  }
}
