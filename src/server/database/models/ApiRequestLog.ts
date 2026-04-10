export interface IApiRequestLog {
  id_log: number;
  tenant_id: number;
  user_id: number | null;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  request_body: object | null;
  response_body: object | null;
  ip_address: string | null;
  created_at: Date;
}
