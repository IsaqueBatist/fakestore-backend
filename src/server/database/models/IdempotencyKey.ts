export interface IIdempotencyKey {
  id_key: number;
  tenant_id: number;
  idempotency_key: string;
  response_code: number;
  response_body: string;
  created_at: Date;
}
