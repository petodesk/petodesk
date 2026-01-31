
export default interface Sales {
    id: string
    item_name: string
    quantity: number
    selling_price: number
    cost_price: number
    payment_method: string
    sold_by: string
    status: string
    created_at: string
    profiles?: {
        full_name: string
    }
    companies?: {
        name: string
    }
}
