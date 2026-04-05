export interface IWebhookEvent {
  id_event: number;
  tenant_id: number;
  event_type: string;
  payload: string;
  status: string;
  attempts: number;
  last_attempt_at: Date | null;
  response_code: number | null;
  created_at: Date;
}
