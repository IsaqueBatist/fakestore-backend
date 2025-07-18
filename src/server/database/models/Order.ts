export interface IOrder {
    id_order: number
    user_id: number
    total: number,
    status: string
    created_at: Date
}