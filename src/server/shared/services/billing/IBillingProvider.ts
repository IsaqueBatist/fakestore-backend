export interface BillingWebhookPayload {
  event: string;
  subscription_id: string;
  plan: string;
  customer_email: string;
  [key: string]: unknown;
}

export interface IBillingProvider {
  /** Verify webhook signature from the billing provider */
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean;

  /** Parse the raw webhook payload into a normalized format */
  parseWebhookPayload(rawBody: string | Buffer): BillingWebhookPayload;

  /** Create a checkout/subscription URL for the tenant */
  createSubscription(tenantId: number, plan: string, email: string): Promise<{ url: string; subscription_id: string }>;

  /** Cancel a subscription */
  cancelSubscription(subscriptionId: string): Promise<void>;
}
