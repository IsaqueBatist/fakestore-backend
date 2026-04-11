export interface IUser {
  id_user: number;
  tenant_id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
  password_reset_token: string | null;
  password_reset_expires: Date | null;
  deleted_at?: Date | null;
}
