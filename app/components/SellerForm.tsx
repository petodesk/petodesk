'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { HiPlus, HiMinus } from 'react-icons/hi'
import { toast } from 'react-toastify'
import ClipLoader from 'react-spinners/ClipLoader'
import { useCompany } from '../context/CompanyContext'

/* ---------------- TYPES ---------------- */

type Product = {
  id: string
  name: string
  product_prices: { selling_price: number; cost_price: number }[]
  product_stock: { quantity: number; status: string }[]
}

type CartItem = {
  product: Product
  quantity: number
  discountPercent: number
}

/* ---------------- COMPONENT ---------------- */

export function AddSaleModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  const supabase = createClient()

  /* ---------------- STATE ---------------- */

  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])

  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [taxPercent, setTaxPercent] = useState(0)

  const [paymentMethod, setPaymentMethod] = useState('')
  const [sellerId, setSellerId] = useState<string | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const{company, profile, refresh,currency} = useCompany()

  /* ---------------- FETCH USER ---------------- */

  useEffect(() => {
   if(!profile || !company) {
    refresh()
   } else {
    setSellerId(profile.id)
    setCompanyId(company.id)
   }
  }, [profile, company])

  /* ---------------- FETCH PRODUCTS ---------------- */

  useEffect(() => {
    supabase
      .from('products')
      .select(`
        id,
        name,
        product_prices(selling_price, cost_price),
        product_stock(quantity, status)
      `)
      .eq('deleted', false)
      .then(({ data }) => {
        setProducts(
          (data ?? []).filter(
            p => p.product_stock[0]?.status !== 'out_of_stock'
          )
        )
      })
  }, [])

  /* ---------------- DERIVED ---------------- */
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => !cart.some(c => c.product.id === p.id))
      .filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  }, [products, cart, searchTerm])


  const selectedProduct = filteredProducts.find(
    p => p.id === selectedProductId
  )

  const stockQty = selectedProduct?.product_stock[0]?.quantity ?? 0
  const price = selectedProduct?.product_prices[0]?.selling_price ?? 0

  const gross = price * quantity
  const discountAmount = (gross * discountPercent) / 100
  const netAmount = gross - discountAmount
  const taxAmount = (netAmount * taxPercent) / 100
  const previewSubtotal = netAmount + taxAmount

  const totalAmount = cart.reduce((sum, item) => {
    const price = item.product.product_prices[0].selling_price
    const gross = price * item.quantity
    const discount = (gross * item.discountPercent) / 100
    const net = gross - discount
    const tax = (net * taxPercent) / 100
    return sum + net + tax
  }, 0)

  /* ---------------- CART ACTIONS ---------------- */

  const addToCart = () => {
    if (!selectedProduct) return

    if (quantity > stockQty) {
      toast.error('Requested quantity exceeds stock')
      return
    }

    setCart(prev => [
      ...prev,
      { product: selectedProduct, quantity, discountPercent },
    ])

    setSelectedProductId('')
    setQuantity(1)
  }

  const updateQty = (index: number, delta: number) => {
    setCart(prev =>
      prev.map((item, i) => {
        if (i !== index) return item
        const newQty = item.quantity + delta
        const stock = item.product.product_stock[0].quantity
        if (newQty < 1 || newQty > stock) return item
        return { ...item, quantity: newQty }
      })
    )
  }

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  /* ---------------- SAVE SALE ---------------- */

  const completeSale = async () => {
    if (!sellerId || !companyId || cart.length === 0) return
    setLoading(true)

    const { data: sale } = await supabase
      .from('sales')
      .insert({
        company_id: companyId,
        sold_by: sellerId,
        payment_method: paymentMethod,
        total_amount: totalAmount,
      })
      .select()
      .single()

    for (const item of cart) {
      const price = item.product.product_prices[0].selling_price
      const cost = item.product.product_prices[0].cost_price

      const gross = price * item.quantity
      const discount = (gross * item.discountPercent) / 100
      const net = gross - discount
      const tax = (net * taxPercent) / 100

      await supabase.from('sale_items').insert({
        sale_id: sale.id,
        product_id: item.product.id,
        item_name: item.product.name,
        quantity: item.quantity,
        selling_price: price,
        cost_price: cost,
        discount,
        discount_percent: discountPercent,
        tax_percent: taxPercent,
        tax_amount: tax,
        subtotal: net + tax,
      })

      await supabase
        .from('product_stock')
        .update({
          quantity:
            item.product.product_stock[0].quantity - item.quantity,
        })
        .eq('product_id', item.product.id)
    }

    await supabase.rpc('touch_company_activity', {
  p_company_id: companyId,
  p_user_id: sellerId,
  p_activity: 'completed a sale',
})
    setLoading(false)
    onClose()
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-poppins ">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-50 w-full max-w-5xl mt-30 pb-10 rounded-xl bg-white flex flex-col max-h-[90vh]">

        {/* HEADER (fixed) */}
        <div className="border-b px-6 py-4 font-semibold ">
          New Sale
        </div>

        {/* BODY (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* PRODUCT INPUT */}
          <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-20">
            <div className="flex flex-col gap-2 w-full">
              <h1>Select Product</h1>

              {/* Search input */}
              <input
                type="text"
                required
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search product by name"
                className="rounded border p-2 text-sm outline-none"
              />

              {/* Result list */}
              {searchTerm && (
                <div className="max-h-48 overflow-y-auto rounded-lg border bg-white shadow-sm">
                  {filteredProducts.length === 0 && (
                    <p className="p-3 text-sm text-gray-500">
                      No products found
                    </p>
                  )}

                  {filteredProducts.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(p.id)
                        setSearchTerm('')
                      }}
                      className="flex w-full justify-between px-4 py-2 text-left text-sm hover:bg-gray-100"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-gray-500">
                        Stock: {p.product_stock[0]?.quantity}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className='flex flex-col gap-2 w-full'>

              <h1>Discount(%)</h1>
              <input
                type="number"

                min={0}
                max={100}
                value={discountPercent}
                onChange={e => setDiscountPercent(+e.target.value)}
                className="rounded border p-2 text-gray-500"
                placeholder="Discount %"
              />
            </div>
            <div className='flex flex-col gap-2 w-full'>

              <h1>Tax type</h1>
              <input
                type="number"
                min={0}
                max={100}
                value={taxPercent}
                onChange={e => setTaxPercent(+e.target.value)}
                className="rounded border p-2"
                placeholder="Tax / VAT %"
              />
            </div>
            <div className='flex flex-col gap-2 w-full'>
              <h1>Payment Method</h1>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="rounded border p-2"
              >
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="pos">POS</option>
              </select>
            </div>

          </div>
          {/* SELECTED PRODUCT PREVIEW */}
          {selectedProduct && (
            <div className=" flex flex-col gap-5 rounded-lg border bg-gray-50 p-4 ">
              <h4 className="mb-2 font-semibold text-md text-gray-900 text-center">
                Selected Product
              </h4>

              <div className="flex flex-col gap-6 sm:flex-row justify-between text-sm">
                <div className='flex md:flex-col md:gap-4 justify-between'>
                  <div>
                    <p className="text-gray-800 "> Name</p>
                    <p className="font-medium mt-2">{selectedProduct.name}</p>
                  </div>

                  <div>
                    <p className="text-gray-800">Selling Price</p>
                    <p className="font-medium mt-2">{currency} {price}</p>
                  </div>
                </div>



                <div className='flex md:flex-col md:gap-4 justify-between'>
                  <div>
                    <p className="text-gray-800">Stock</p>
                    <p className="font-medium mt-2">{stockQty}</p>
                  </div>

                  <div>
                    <p className="text-gray-800">Quantity</p>
                    <p className="font-medium mt-2">{quantity}</p>
                  </div>
                </div>


                <div className='flex md:flex-col md:gap-4 justify-between'>
                  <div>
                    <p className="text-gray-800">Discount</p>
                    <p className="font-medium mt-2">{discountPercent}%</p>
                  </div>

                  <div>
                    <p className="text-gray-800">Subtotal</p>
                    <p className="font-semibold text-green-600 mt-2">
                      {currency} {previewSubtotal.toLocaleString()}
                    </p>
                  </div>
                </div>

              </div>

              <button
                onClick={addToCart}
                className=" flex btn-primary w-40 p-2 rounded-lg text-white items-center text-center justify-center"
              >
                Add to cart
              </button>
            </div>
          )}

          {/* CART */}

          <div className="rounded-lg border divide-y">
            {cart.map((item, i) => {
              const price =
                item.product.product_prices[0].selling_price

              const discount =
                (price * item.quantity * item.discountPercent) / 100

              const subtotal =
                price * item.quantity - discount

              return (
                <div className=" flex flex-col gap-5 rounded-lg border bg-gray-50 p-4 ">
                  <h4 className="mb-2 font-semibold text-md text-gray-700 text-center">
                    Added Product
                  </h4>
                  <div
                    key={i}
                    className="flex flex-col gap-6 sm:flex-row justify-between text-sm">

                    {/* PRODUCT INFO */}
                    <div className='flex md:flex-col md:gap-4 justify-between'>
                      <div>
                        <p>Product Name</p>
                        <p className="font-semibold mt-2">
                          {item.product.name}
                        </p>
                      </div>

                      <div>
                        Product price
                        <p className="text-gray-500 mt-2">
                          {currency} {price}
                        </p>
                      </div>
                    </div>

                    <div className='flex md:flex-col md:gap-4 justify-between'>
                      <div>
                        <p>Product Quantity</p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQty(i, -1)}
                            className="rounded border p-1 mt-2 cursor-pointer"
                          >
                            <HiMinus />
                          </button>

                          <span className="w-4 text-center font-medium">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => updateQty(i, 1)}
                            className="rounded border p-1 mt-2 cursor-pointer"
                          >
                            <HiPlus />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p>Dsicount</p>
                        <p className="text-gray-500 mt-2">
                          {item.discountPercent}%
                        </p>
                      </div>
                    </div>

                    {/* SUBTOTAL */}
                    <div className='flex md:flex-col md:gap-4 justify-between'>
                      <div>


                        <p className="text-gray-500">Subtotal</p>
                        <p className="font-semibold text-green-600 mt-2">
                        c{currency} {subtotal.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        {/* REMOVE */}
                        <button
                          onClick={() => removeFromCart(i)}
                          className="text-red-500 text-sm cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}

            {cart.length === 0 && (
              <p className="p-4 text-center text-sm text-gray-500">
                No products added to cart yet
              </p>
            )}
          </div>

        </div>



        {/* FOOTER */}
        <div className="border-t p-4 flex justify-between items-center">

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded bg-yellow-600 px-6 py-2 text-white cursor-pointer"
          >
            Cancel
          </button>
          <div className='flex gap-2'>
            <h1>Total=</h1>
            <span className="font-semibold">
              {currency} {totalAmount.toLocaleString()}
            </span>
          </div>
          <button
            onClick={completeSale}
            disabled={loading}
            className="rounded bg-green-600 px-6 py-2 text-white cursor-pointer"
          >
            {loading ? 
            <div>
              <ClipLoader size={20} color="#ffffff" />
              <span className="ml-2">Saving…</span>
            </div>
            : 'Sale'}
          </button>
        </div>
      </div>
    </div>
  )
}

