export interface IOrder {
  id_order: number;
  tenant_id: number;
  user_id: number;
  total: number;
  status: string;
  created_at: Date;
}
