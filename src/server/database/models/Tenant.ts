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
  created_at: Date;
  updated_at: Date;
}
