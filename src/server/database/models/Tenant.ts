export interface ITenant {
  id_tenant: number;
  name: string;
  slug: string;
  api_key_hash: string;
  api_secret_hash: string;
  plan: string;
  webhook_url: string | null;
  webhook_secret: string | null;
  rate_limit: number;
  is_active: boolean;
  subscription_id: string | null;
  stripe_customer_id: string | null;
  billing_email: string | null;
  plan_expires_at: Date | null;
  trial_ends_at: Date | null;
  grace_period_days: number;
  created_at: Date;
  updated_at: Date;
}
