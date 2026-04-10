export interface BillingWebhookPayload {
  event: string;
  subscription_id: string;
  plan: string;
  customer_email: string;
  customer_id: string;
  [key: string]: unknown;
}

export interface IBillingProvider {
  /** Verify webhook signature from the billing provider */
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean;

  /** Parse the raw webhook payload into a normalized format */
  parseWebhookPayload(rawBody: string | Buffer): BillingWebhookPayload;

  /** Create a checkout/subscription URL for the tenant */
  createSubscription(
    tenantId: number,
    plan: string,
    email: string,
  ): Promise<{ url: string; subscription_id: string }>;

  /** Cancel a subscription */
  cancelSubscription(subscriptionId: string): Promise<void>;

  /** Create a Stripe Customer Portal session for self-service billing */
  createPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<{ url: string }>;

  /** Retrieve a checkout session to verify payment (polling contingency) */
  retrieveCheckoutSession(sessionId: string): Promise<{
    subscription_id: string;
    customer_id: string;
    plan: string;
    status: string;
  }>;
}
