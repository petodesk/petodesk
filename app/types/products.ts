
export default interface Products {
    id: string
    name: string
    brand:string
    category:string
    deleted:boolean
    product_stock: {
        quantity: number
        status: string
        unit_of_measure:string
    }[]
    product_prices: { 
        selling_price: number
        cost_price:number }[]


    created_at: string
    profiles?: {
        full_name: string
    }
    companies?: {
        name: string
    }
}
