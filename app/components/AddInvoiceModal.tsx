'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { HiMinus, HiPlus } from 'react-icons/hi'

type ItemType = 'product' | 'service'

type Product = {
    id: string
    name: string
    product_prices: { selling_price: number }[]
    product_stock: { quantity: number }[]
}

type InvoiceItem = {
    item_type: ItemType
    product_id: string | null
    name: string
    quantity: number
    unit_price: number
    total: number
}

export function AddInvoiceModal({
    open,
    onClose,
    invoices,
}: {
    open: boolean
    onClose: () => void
    invoices?: any
}) {
    if (!open) return null

    const supabase = createClient()
    const isEdit = !!invoices

    /* ---------------- INVOICE FORM ---------------- */
    const [billTo, setBillTo] = useState(invoices?.bill_to ?? '')
    const [shipTo, setShipTo] = useState(invoices?.ship_to ?? '')
    const [dueDate, setDueDate] = useState(invoices?.due_date ?? '')
    const [taxRate, setTaxRate] = useState(invoices?.tax_rate ?? 0)

    const [bankName, setBankName] = useState(invoices?.invoice_payments?.[0]?.bank_name ?? '')
    const [accountName, setAccountName] = useState(invoices?.invoice_payments?.[0]?.account_name ?? '')
    const [accountNumber, setAccountNumber] = useState(invoices?.invoice_payments?.[0]?.account_number ?? '')

    const [creatorId, setCreatorId] = useState<string | null>(null)
    const [companyId, setCompanyId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    /* ---------------- ITEM LOGIC ---------------- */
    const [itemType, setItemType] = useState<ItemType>('product')
    const [products, setProducts] = useState<Product[]>([])
    const [selectedProductId, setSelectedProductId] = useState('')
    const [serviceName, setServiceName] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [unitPrice, setUnitPrice] = useState(0)
    const [items, setItems] = useState<InvoiceItem[]>([])
    const [productSearch, setProductSearch] = useState('')

    /* ---------------- INIT ---------------- */
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setCreatorId(user.id)

            const { data: profile } = await supabase
                .from('profiles')
                .select('company_id')
                .eq('id', user.id)
                .single()

            setCompanyId(profile?.company_id ?? null)

            const { data: productData } = await supabase
                .from('products')
                .select(`
          id,
          name,
          product_prices(selling_price),
          product_stock(quantity)
        `)

            setProducts(productData ?? [])
        }

        init()
    }, [])


    const generateInvoiceNumber = async () => {
        const { data, error } = await supabase
            .rpc('generate_invoice_number', {
                p_company_id: companyId,
            })

        if (error) throw error
        return data
    }
    

    useEffect(() => {
  if (!isEdit || !invoices?.invoice_items) return

  setItems(
    invoices.invoice_items.map((i: any) => ({
      item_type: i.item_type,
      product_id: i.product_id,
      name: i.item_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total: i.amount,
    }))
  )
}, [isEdit, invoices])






    /* ---------------- AUTO PRICE FOR PRODUCT ---------------- */
    useEffect(() => {
        if (itemType === 'product') {
            const p = products.find(p => p.id === selectedProductId)
            if (p) setUnitPrice(p.product_prices[0]?.selling_price ?? 0)
        }
    }, [selectedProductId, itemType])

    // add item//

    const addItem = () => {
        if (itemType === 'product' && !selectedProductId) return
        if (itemType === 'service' && !serviceName) return

        let name = serviceName
        let productId: string | null = null
        let maxStock = Infinity

        if (itemType === 'product') {
            const product = products.find(p => p.id === selectedProductId)
            if (!product) return

            const stockQty = product.product_stock[0]?.quantity ?? 0
            maxStock = stockQty

            name = product.name
            productId = product.id
        }

        setItems(prev => {
            const existing = prev.find(i => {
                if (itemType === 'product') {
                    return i.product_id === productId
                }
                return i.item_type === 'service' && i.name === name
            })

            if (existing) {
                const newQty = existing.quantity + quantity

                if (itemType === 'product' && newQty > maxStock) {
                    alert('Not enough stock')
                    return prev
                }

                return prev.map(i =>
                    i === existing
                        ? {
                            ...i,
                            quantity: newQty,
                            total: newQty * i.unit_price,
                        }
                        : i
                )
            }

            if (itemType === 'product' && quantity > maxStock) {
                alert('Not enough stock')
                return prev
            }

            return [
                ...prev,
                {
                    item_type: itemType,
                    product_id: productId,
                    name,
                    quantity,
                    unit_price: unitPrice,
                    total: quantity * unitPrice,
                },
            ]
        })

        // reset inputs
        setSelectedProductId('')
        setServiceName('')
        setQuantity(1)
        setUnitPrice(0)
    }


    /* ---------------- DERIVED ---------------- */
    const filteredProducts = useMemo(() => {
        const q = productSearch.toLowerCase()

        return products.filter(p => {
            const notInCart = !items.some(i => i.product_id === p.id)
            const matchesSearch = p.name.toLowerCase().includes(q)
            return notInCart && matchesSearch
        })
    }, [products, items, productSearch])

    /* ---------------- TOTALS ---------------- */
    const subtotal = items.reduce((s, i) => s + i.total, 0)
    const taxAmount = subtotal * (Number(taxRate) / 100 || 0)
    const grandTotal = subtotal + taxAmount

    /* ---------------- SAVE ---------------- */
    const handleSave = async () => {
        if (!billTo || !shipTo || !dueDate) {
            alert('Fill required fields')
            return
        }

        if (!creatorId || !companyId) return
        setLoading(true)

        try {
            if (isEdit) {
                /* ✏️ UPDATE INVOICE ONLY */
                await supabase
                    .from('invoices')
                    .update({
                        bill_to: billTo,
                        ship_to: shipTo,
                        due_date: dueDate,
                        tax_rate: taxRate,
                        tax_amount: taxAmount,
                        total: grandTotal,
                    })
                    .eq('id', invoices.id)

                /* ✏️ UPDATE PAYMENT INFO */
                await supabase
                    .from('invoice_payments')
                    .update({
                        bank_name: bankName,
                        account_name: accountName,
                        account_number: accountNumber,
                    })
                    .eq('invoice_id', invoices.id)

                onClose()
                return
            }

            /* ➕ CREATE MODE (unchanged) */
            const invoiceNumber = await generateInvoiceNumber()

            const { data: invoice } = await supabase
                .from('invoices')
                .insert({
                    invoice_number: invoiceNumber,
                    bill_to: billTo,
                    ship_to: shipTo,
                    due_date: dueDate,
                    tax_rate: taxRate,
                    tax_amount: taxAmount,
                    total: grandTotal,
                    created_by: creatorId,
                    company_id: companyId,
                })
                .select()
                .single()

            if (items.length) {
                await supabase.from('invoice_items').insert(
                    items.map(i => ({
                        invoice_id: invoice.id,
                        item_type: i.item_type,
                        product_id: i.product_id,
                        item_name: i.name,
                        quantity: i.quantity,
                        unit_price: i.unit_price,
                        amount: i.total,
                    }))
                )
            }

            for (const item of items) {
                if (item.item_type === 'product' && item.product_id) {
                    const product = products.find(p => p.id === item.product_id)
                    const currentQty = product?.product_stock[0]?.quantity ?? 0

                    await supabase
                        .from('product_stock')
                        .update({ quantity: currentQty - item.quantity })
                        .eq('product_id', item.product_id)
                }
            }

            await supabase.from('invoice_payments').insert({
                invoice_id: invoice.id,
                bank_name: bankName,
                account_name: accountName,
                account_number: accountNumber,
            })

            onClose()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    const updateQty = (index: number, delta: number) => {
        setItems(prev =>
            prev.map((item, i) => {
                if (i !== index) return item

                const newQty = item.quantity + delta
                if (newQty < 1) return item

                if (item.item_type === 'product') {
                    const product = products.find(p => p.id === item.product_id)
                    const stockQty = product?.product_stock[0]?.quantity ?? 0
                    if (newQty > stockQty) return item
                }

                return {
                    ...item,
                    quantity: newQty,
                    total: newQty * item.unit_price,
                }
            })
        )
    }





    const removeFromCart = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index))
    }

    /* ---------------- UI ---------------- */
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <div className="relative z-50 w-full max-w-4xl bg-white mt-25 rounded-xl max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b flex justify-between">
                    <h2 className="font-semibold">
                        {isEdit ? 'Edit Invoice' : 'Add Invoice'}
                    </h2>

                    <button onClick={onClose}>✕</button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">


                    <Input label="Bill To *" value={billTo} onChange={setBillTo} />
                    <Input label="Ship To *" value={shipTo} onChange={setShipTo} />
                    <Input label="Due Date *" type="date" value={dueDate} onChange={setDueDate} />
                    {
                        !isEdit && (
                            <>
                                <div className="md:col-span-2 flex gap-2">
                                    <button onClick={() => setItemType('product')} className={`px-4 py-2 rounded ${itemType === 'product' ? 'bg-blue-600 text-white' : 'border'}`}>Product</button>
                                    <button onClick={() => setItemType('service')} className={`px-4 py-2 rounded ${itemType === 'service' ? 'bg-blue-600 text-white' : 'border'}`}>Service</button>
                                </div>
                                {itemType === 'product' ? (
                                    <div className="flex flex-col gap-1 w-full">
                                        <h1>Select Product</h1>

                                        {/* Search input */}
                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            placeholder="Search product by name"
                                            className="rounded border p-2 text-sm outline-none"
                                        />

                                        {/* Result list */}
                                        {productSearch && (
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
                                                            setProductSearch('')
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

                                ) : (
                                    <Input label="Service Name *" value={serviceName} onChange={setServiceName} />
                                )}

                                <Input className='mt-2' label="Unit Price *" type="number" value={unitPrice} disabled={itemType === 'product'} onChange={(v: any) => setUnitPrice(Number(v))} />

                                <button onClick={addItem} className="md:col-span-2 bg-gray-900 text-white py-2 rounded">
                                    Add Item
                                </button>

                                <div className="md:col-span-2 space-y-2">
                                    {items.map((item, idx) => (
                                        <div className=" flex flex-col gap-5 rounded-lg border bg-gray-50 p-4 ">

                                            <div
                                                key={idx}
                                                className="flex flex-col gap-6 sm:flex-row justify-between text-sm">

                                                {/* PRODUCT INFO */}
                                                <div className='flex md:flex-col md:gap-4 justify-between'>
                                                    <div>
                                                        <p>{item.item_type === 'product' ? 'Product Name' : 'Service Name'}</p>
                                                        <p className="font-semibold mt-2">
                                                            {item.name}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        {item.item_type === 'product' ? 'Unit Price' : 'Service Fee'}
                                                        <p className="text-gray-500 mt-2">
                                                            ₦{item.unit_price}
                                                        </p>
                                                    </div>
                                                </div>
                                                {item.item_type === 'product' && (
                                                    <div className='flex md:flex-col md:gap-4 justify-between'>
                                                        <div>
                                                            <p>Product Quantity</p>
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => updateQty(idx, -1)}
                                                                    className="rounded border p-1 mt-2 cursor-pointer"
                                                                >
                                                                    <HiMinus />
                                                                </button>

                                                                <span className="w-4 text-center font-medium">
                                                                    {item.quantity}
                                                                </span>

                                                                <button
                                                                    onClick={() => updateQty(idx, 1)}
                                                                    className="rounded border p-1 mt-2 cursor-pointer"
                                                                >
                                                                    <HiPlus />
                                                                </button>
                                                            </div>
                                                        </div>


                                                    </div>
                                                )}


                                                {/* SUBTOTAL */}
                                                <div className='flex md:flex-col md:gap-4 justify-between'>
                                                    <div>


                                                        <p className="text-gray-500">Subtotal</p>
                                                        <p className="font-semibold text-green-600 mt-2">
                                                            ₦{item.total.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        {/* REMOVE */}
                                                        <button
                                                            onClick={() => removeFromCart(idx)}
                                                            className="text-red-500 text-sm cursor-pointer"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    ))}
                                </div>


                            </>
                        )
                    }

                    <Input label="Tax %" value={taxRate} onChange={setTaxRate} />
                    <Input label="Subtotal" value={subtotal} disabled />

                    <Input label="Bank Name" value={bankName} onChange={setBankName} />
                    <Input label="Account Name" value={accountName} onChange={setAccountName} />
                    <Input label="Account Number" value={accountNumber} onChange={setAccountNumber} />

                </div>
                <div className="flex flex-col items-end mr-20">
                    <h1>Subtotal = {subtotal}</h1>
                    <h1>Tax ({taxRate}%) = {taxAmount.toLocaleString()}</h1>
                    <h1>Total = {grandTotal}</h1>
                </div>

                <div className="px-6 py-4 border-t flex justify-end">
                    <button onClick={handleSave} disabled={loading} className="bg-blue-600 text-white px-8 py-2 rounded">
                     {loading ? 'Saving…' : isEdit ? 'Update' : 'Save'}

                    </button>
                </div>
            </div>
        </div>
    )
}

/* ---------------- UI HELPERS ---------------- */

function Input({ label, value, onChange, type = 'text', disabled = false }: any) {
    return (
        <div className='flex flex-col gap-2'>
            <label className="text-sm font-medium">{label}</label>
            <input
                type={type}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
            />
        </div>
    )
}


