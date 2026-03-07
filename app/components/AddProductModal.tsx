'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../utils/supabase/client'

type Props = {
    open: boolean
    onClose: () => void
    product?: any
}


export type ProductFormData = {
    name: string
    category: string
    brand: string
    costPrice: string
    sellingPrice: string
    quantity: string
    unit: string
    image: string
    supplier_name: string
    supplier_location: string
    supplier_phone: string
    // 👇 variants
    hasVariant: boolean
    size?: string
    color?: string
    weight?: string
}
type VariantData = {
    size: string
    color: string
    weight: string
}





export function AddProductModal({ open, onClose, product }: Props) {
    if (!open) return null


    const supabase = createClient()
    const [isVariant, setIsVariant] = useState(false)


    const [variant, setVariant] = useState<VariantData>({
        size: '',
        color: '',
        weight: '',
    })
    const isEdit = !!product
    const [form, setForm] = useState<ProductFormData>({
        name: product?.name ?? '',
        category: product?.category ?? '',
        brand: product?.brand ?? '',
        costPrice: product?.product_prices?.[0]?.cost_price?.toString() ?? '',
        sellingPrice: product?.product_prices?.[0]?.selling_price?.toString() ?? '',
        quantity: product?.product_stock?.[0]?.quantity?.toString() ?? '',
        unit: product?.product_stock?.[0]?.unit_of_measure ?? '',
        image: product?.image_url ?? '',
        supplier_name: product?.suppliers?.[0]?.name ?? '',
        supplier_location: product?.suppliers?.[0]?.location ?? '',
        supplier_phone: product?.suppliers?.[0]?.phone ?? '',
        hasVariant: !!product?.product_variants?.length,
        size: product?.product_variants?.[0]?.size ?? '',
        color: product?.product_variants?.[0]?.color ?? '',
        weight: product?.product_variants?.[0]?.weight ?? ''
    })


    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)


    const [sellerId, setSellerId] = useState<string | null>(null)
    const [seller, setSeller] = useState('')
    const [userCompanyId, setUserCompanyId] = useState<string | null>(null)



    const update = (key: keyof ProductFormData, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }))
        setErrors(prev => ({ ...prev, [key]: '' }))
    }



    // 🔐 validation
    const validate = () => {
        const e: Record<string, string> = {}

        if (!form.name.trim()) e.name = 'Product name is required'
        if (!form.category) e.category = 'Category is required'
        if (!form.costPrice || Number(form.costPrice) <= 0)
            e.costPrice = 'Cost price must be greater than 0'
        if (!form.sellingPrice || Number(form.sellingPrice) <= 0)
            e.sellingPrice = 'Selling price must be greater than 0'
        if (Number(form.sellingPrice) < Number(form.costPrice))
            e.sellingPrice = 'Selling price cannot be lower than cost'
        if (!form.quantity || Number(form.quantity) < 0)
            e.quantity = 'Quantity must be 0 or more'
        if (!form.unit) e.unit = 'Unit is required'
        if (form.hasVariant) {
            if (!form.size) e.size = 'Size is required'
            if (!form.color) e.color = 'Color is required'
            if (!form.weight) e.weight = 'Weight is required'
        }
        if (!sellerId || !userCompanyId) {
            alert('User not authenticated')
            return
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }




    // ✅ Get logged-in user info
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setSellerId(user.id)
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('full_name, company_id')
                .eq('id', user.id)
                .single()

            if (error) {
                console.error(error)
                return
            }

            setSeller(profile.full_name)
            setUserCompanyId(profile.company_id)
        }

        getUser()
    }, [])


    const [existingSuppliers, setExistingSuppliers] = useState<any[]>([])
    const [isNewSupplier, setIsNewSupplier] = useState(false) // Toggle between select and manual input

    useEffect(() => {
        const fetchSuppliers = async () => {
            if (!userCompanyId) return

            const { data, error } = await supabase
                .from('suppliers_list')
                .select('id,name,location,phone')
                .eq('company_id', userCompanyId)
                .order('name', { ascending: true })

            if (!error && data) {
                const uniqueSuppliers = Array.from(
                    new Map(data.map(s => [s.name, s])).values()
                )

                setExistingSuppliers(uniqueSuppliers)
            }
        }

        fetchSuppliers()
    }, [userCompanyId])

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);

        try {
            const barcode = 'PRD-' + Date.now();

            // Call the SQL function
            if (!isEdit) {
                const { data, error } = await supabase.rpc('add_complete_product', {
                    p_name: form.name.trim(),
                    p_category: form.category,
                    p_brand: form.brand || null,
                    p_barcode: barcode,
                    p_added_by: sellerId,
                    p_company_id: userCompanyId,
                    p_cost_price: Number(form.costPrice),
                    p_selling_price: Number(form.sellingPrice),
                    p_quantity: Number(form.quantity),
                    p_unit: form.unit,
                    p_supplier_name: form.supplier_name,
                    p_supplier_location: form.supplier_location,
                    p_supplier_phone: form.supplier_phone,
                    p_has_variant: isVariant,
                    p_size: form.size || null,
                    p_color: form.color || null,
                    p_weight: form.weight || null,
                });

                if (error) throw error;


            }
            if (isEdit) {
                await supabase.from('products')
                    .update({
                        name: form.name,
                        category: form.category,
                        brand: form.brand,
                    })
                    .eq('id', product.id)

                await supabase.from('product_prices')
                    .update({
                        cost_price: Number(form.costPrice),
                        selling_price: Number(form.sellingPrice),
                    })
                    .eq('product_id', product.id)

                await supabase.from('product_stock')
                    .update({
                        quantity: Number(form.quantity),
                        unit_of_measure: form.unit,
                    })
                    .eq('product_id', product.id)

                if (form.hasVariant) {
                    await supabase.from('product_variants')
                        .upsert({
                            product_id: product.id,
                            size: form.size,
                            color: form.color,
                            weight: form.weight,
                        })
                } else {
                    await supabase.from('product_variants')
                        .delete()
                        .eq('product_id', product.id)
                }
            }


            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed  inset-0 z-50 flex items-center justify-center mt-25">

            {/* backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* modal */}
            <div className="relative z-50 w-full max-w-4xl rounded-xl pb-10 bg-white shadow-lg flex flex-col
                max-h-[90vh]">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-lg font-semibold">{isEdit ? "Edit Product" : "Add Product"}</h2>
                    <button className='cursor-pointer' onClick={onClose}>✕</button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:space-y-6">
                        <Field label="Product Name *" error={errors.name}>
                            <input
                                value={form.name}
                                onChange={e => update('name', e.target.value)}
                                className="input"
                            />
                        </Field>

                        <Field label="Category *" error={errors.category}>
                            <input
                                value={form.category}
                                onChange={e => update('category', e.target.value)}
                                className="input"
                            />
                        </Field>

                        <Field label="Brand">
                            <input
                                value={form.brand}
                                onChange={e => update('brand', e.target.value)}
                                className="input"
                            />
                        </Field>

                        <Field label="Cost Price *" error={errors.costPrice}>
                            <input
                                type="number"
                                value={form.costPrice}
                                onChange={e => update('costPrice', e.target.value.replace(/^0+(?=\d)/, ''))}
                                className="input"
                            />
                        </Field>

                        <Field label="Selling Price *" error={errors.sellingPrice}>
                            <input
                                type="number"
                                value={form.sellingPrice}
                                onChange={e => update('sellingPrice', e.target.value.replace(/^0+(?=\d)/, ''))}
                                className="input"
                            />
                        </Field>

                        <Field label="Quantity *" error={errors.quantity}>
                            <input
                                type="number"
                                value={form.quantity}
                                onChange={e => update('quantity', e.target.value.replace(/^0+(?=\d)/, ''))}
                                className="input"
                            />
                        </Field>

                        <Field label="Unit *" error={errors.unit}>
                            <select
                                value={form.unit}
                                onChange={e => update('unit', e.target.value)}
                                className="input"
                            >
                                <option value="">Select unit</option>
                                <option value="pcs">Pieces</option>
                                <option value="kg">Kilogram</option>
                                <option value="carton">Carton</option>
                            </select>
                        </Field>

                    </div>
                    {/* Variant toggle */}
                    <div className="mt-6 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">This product has variants</p>

                            <button
                                type="button"
                                onClick={() => {
                                    const newValue = !form.hasVariant;
                                    setForm(prev => ({ ...prev, hasVariant: newValue }));
                                    setIsVariant(newValue);
                                }}
                                className={`relative h-6 w-11 rounded-full transition ${form.hasVariant ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition ${form.hasVariant ? 'translate-x-5' : ''
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Variant inputs */}
                        {form.hasVariant && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Field label="Size *" error={errors.size}>
                                    <input
                                        value={form.size}
                                        onChange={e => update('size', e.target.value)}
                                        className="input"
                                    />
                                </Field>

                                <Field label="Color *" error={errors.color}>
                                    <input
                                        value={form.color}
                                        onChange={e => update('color', e.target.value)}
                                        className="input"
                                    />
                                </Field>

                                <Field label="Weight *" error={errors.weight}>
                                    <input
                                        value={form.weight}
                                        onChange={e => update('weight', e.target.value)}
                                        className="input"
                                    />
                                </Field>
                            </div>
                        )}
                    </div>

                    <div >
                        <Field label="Supplier *" error={errors.supplier}>
                            {!isNewSupplier ? (
                                <div className='flex items-center justify-center'>
                                    <select
                                        className="input"
                                        onChange={(e) => {
                                            if (e.target.value === "new") {
                                                setIsNewSupplier(true)
                                            } else {

                                                const s = existingSuppliers.find(x => x.id === e.target.value)
                                                if (!s) return

                                                update('supplier_name', s.name)
                                                update('supplier_location', s.location)
                                                update('supplier_phone', s.phone)
                                            }
                                        }}
                                    >
                                        <option value="">Select a supplier</option>
                                        {existingSuppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                        <option value="new" className="text-blue-600 font-bold">+ Add New Supplier</option>
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                        <Field label="Supplier Name *" error={errors.quantity}>
                                            <input
                                                type="text"
                                                value={form.supplier_name}
                                                onChange={e => update('supplier_name', e.target.value.replace(/^0+(?=\d)/, ''))}
                                                className="input"
                                            />
                                        </Field>
                                        <Field label="Supplier Location *" error={errors.quantity}>
                                            <input
                                                type="text"
                                                value={form.supplier_location}
                                                onChange={e => update('supplier_location', e.target.value.replace(/^0+(?=\d)/, ''))}
                                                className="input"
                                            />
                                        </Field>
                                        <Field label="Supplier Phone *" error={errors.quantity}>
                                            <input
                                                type="phone"
                                                value={form.supplier_phone}
                                                onChange={e => update('supplier_phone', e.target.value)}
                                                className="input"
                                            />
                                        </Field>
                                    </div>
                                    <button
                                        className="text-sm text-gray-500 underline cursor-pointer hover:text-blue-600"
                                        onClick={() => setIsNewSupplier(false)}
                                    >
                                        Back to list
                                    </button>
                                </div>

                            )}
                        </Field>




                    </div>
                </div>


                <div className="mt-4 flex justify-end gap-3">
                    <button onClick={onClose} className="rounded border px-5 py-2 text-sm">
                        Cancel
                    </button>
                    <button
                        disabled={loading}
                        onClick={handleSubmit}
                        className="rounded bg-blue-600 px-6 py-2 text-sm text-white disabled:opacity-60"
                    >
                        {loading
                            ? 'Saving...'
                            : isEdit
                                ? 'Update Product'
                                : 'Save Product'}
                    </button>
                </div>
            </div>
        </div>
    )
}

/* 🔹 Small helper */
function Field({
    label,
    error,
    children,
}: {
    label: string
    error?: string
    children: React.ReactNode
}) {
    return (
        <div >
            <label className="mb-1 text-sm font-medium text-start">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    )
}
