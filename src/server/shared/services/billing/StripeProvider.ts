import crypto from "crypto";
import Stripe from "stripe";
import { IBillingProvider, BillingWebhookPayload } from "./IBillingProvider";
import { ConfigurationError } from "../../../errors";

/**
 * Stripe billing provider implementation.
 *
 * Requires environment variables:
 * - STRIPE_SECRET_KEY: Stripe secret API key
 * - STRIPE_WEBHOOK_SECRET: Stripe webhook signing secret
 * - STRIPE_PRICE_BASIC: Stripe Price ID for basic plan
 * - STRIPE_PRICE_AGENCY: Stripe Price ID for agency plan
 * - DASHBOARD_URL: Frontend URL for redirect after checkout
 */
export class StripeProvider implements IBillingProvider {
  private webhookSecret: string;
  private stripe: InstanceType<typeof Stripe>;

  constructor() {
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new ConfigurationError(
        "STRIPE_SECRET_KEY environment variable is not configured",
      );
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  private getPriceId(plan: string): string {
    const priceMap: Record<string, string | undefined> = {
      basic: process.env.STRIPE_PRICE_BASIC,
      agency: process.env.STRIPE_PRICE_AGENCY,
    };

    const priceId = priceMap[plan];
    if (!priceId) {
      throw new ConfigurationError(
        `Stripe Price ID not configured for plan: ${plan}`,
      );
    }

    return priceId;
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
    const body =
      typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8");
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
      plan:
        data.metadata?.plan ||
        data.items?.data?.[0]?.price?.lookup_key ||
        "sandbox",
      customer_email:
        data.customer_email || data.customer_details?.email || "",
      customer_id: data.customer || "",
    };
  }

  async createSubscription(
    tenantId: number,
    plan: string,
    email: string,
  ): Promise<{ url: string; subscription_id: string }> {
    const priceId = this.getPriceId(plan);
    const dashboardUrl =
      process.env.DASHBOARD_URL || "http://localhost:5173";

    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { tenant_id: String(tenantId), plan },
      success_url: `${dashboardUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${dashboardUrl}/billing/cancel`,
    });

    return {
      url: session.url!,
      subscription_id: (session.subscription as string) || "",
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async createPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  async retrieveCheckoutSession(sessionId: string): Promise<{
    subscription_id: string;
    customer_id: string;
    plan: string;
    status: string;
  }> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    return {
      subscription_id: (session.subscription as string) || "",
      customer_id: (session.customer as string) || "",
      plan: session.metadata?.plan || "sandbox",
      status: session.status || "unknown",
    };
  }
}
