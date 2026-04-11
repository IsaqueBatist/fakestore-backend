export interface ICoupon {
  id_coupon: number;
  tenant_id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  // All values in CENTS — percentage: 1500 = 15.00%, fixed: 1000 = R$10.00
  discount_value_cents: number;
  min_order_cents: number;
  max_uses: number | null;
  current_uses: number;
  starts_at: Date | null;
  expires_at: Date | null;
  active: boolean;
  created_at: Date;
}
