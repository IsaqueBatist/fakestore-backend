export interface IProduct {
  id_product: number;
  tenant_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  rating: number;
  created_at: Date;
  specifications: Record<string, string | number | boolean> | null;
}
