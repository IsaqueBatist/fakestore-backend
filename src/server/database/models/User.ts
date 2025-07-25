export interface IUser {
    id_user: number,
    name: string
    email: string,
    password_hash: string,
    role: string,
    created_at: Date
}