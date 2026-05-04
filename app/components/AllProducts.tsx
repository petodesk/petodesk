'Use client'

import { useState } from "react";

import { AddProductModal } from "./AddProductModal";
import BarcodeLabel from "./BarcodeLabel";
import { createClient } from "../utils/supabase/client";
import { useCompany } from "../context/CompanyContext";



export default function AllProducts({ filteredProducts, open, onClose, fetchAllProduct, title }: { filteredProducts: any, open: boolean, onClose: () => void, fetchAllProduct: any, title: string }) {
    if (!open) return null;

    const { currency } = useCompany()
    const supabase = createClient()

    function ActionMenu({ product }: { product: any }) {
        const [open, setOpen] = useState(false)
        const [editOpen, setEditOpen] = useState(false)
        const [viewBarcode, setViewBarcode] = useState(false)


        const handleEdit = () => {
            setEditOpen(true)
        }


        const handleDelete = async () => {
            const confirmDelete = confirm('Delete this product permanently?')
            if (!confirmDelete) return
            await supabase.from('products').update({ deleted: true }).eq('id', product.id)

            fetchAllProduct()
        }

        const handleUndo = async () => {

            const confirmDelete = confirm('do you want to retrieve this product!! ?')
            if (!confirmDelete) return
            await supabase.from('products').update({ deleted: false }).eq('id', product.id)

            fetchAllProduct()
        }

        const handleViewBarcode = async () => {
            setViewBarcode(true)
        }



        return (
            <div className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="text-lg font-bold text-gray-600 cursor-pointer"
                >
                    ⋮
                </button>

                {open && (
                    <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border bg-white shadow-lg">
                        <ul className="py-1 text-sm">

                            {!product.deleted &&
                                <li
                                    onClick={handleEdit}
                                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                                >
                                    Edit
                                </li>}

                            {product.deleted ?
                                <li
                                    onClick={handleUndo}
                                    className="cursor-pointer px-4 py-2 text-red-600 hover:bg-gray-100"
                                >
                                    Undo
                                </li> :
                                <li
                                    onClick={handleDelete}
                                    className="cursor-pointer px-4 py-2 text-red-600 hover:bg-gray-100"
                                >
                                    delete
                                </li>
                            }
                            <li
                                className="cursor-pointer px-4 py-2 text-blue-600 hover:bg-gray-100"

                                onClick={handleViewBarcode}>
                                View Barcode
                            </li>


                        </ul>
                    </div>

                )}


                <AddProductModal
                    open={editOpen}
                    onClose={() => {
                        setEditOpen(false)
                        //   fetchAllProduct()
                    }}
                    product={product}
                />
                {viewBarcode && <BarcodeLabel product={product} onclose={() => setViewBarcode(false)} open={viewBarcode} />}

            </div>
        )
    }
    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
            <div className="flex h-[95vh] w-full max-w-7xl flex-col mt-40 overflow-hidden rounded-2xl bg-white shadow-xl">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                        <h2 className="text-lg font-semibold">{title} ({filteredProducts.length})</h2>

                        {/* Filters */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">

                            {/* Close */}
                            <button
                                onClick={onClose}
                                className="ml-auto text-gray-500 hover:text-gray-800"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4  max-h-[80vh] overflow-y-auto  md:hidden">
                    {filteredProducts.map((p: any) => (
                        <div
                            key={p.id}
                            className="rounded-xl bg-white p-4 shadow-sm border space-y-3"
                        >
                            {/* Top row: Date + Action */}
                            <div className="flex items-center justify-between">
                                <p className="text-md font-semibold text-gray-700 mb-1">
                                    {new Date(p.created_at).toLocaleDateString()}
                                </p>
                                <ActionMenu product={p} />
                            </div>

                            <hr />

                            {/* Name */}
                            <div className="flex items-center justify-between">
                                <p className="text-md font-semibold text-gray-700 mb-1">Product Name</p>
                                <p className="text-base font-semibold text-gray-900">
                                    {p.name}
                                </p>
                            </div>

                            {/* Category */}
                            <div className="flex items-center justify-between">
                                <p className="text-md font-semibold text-gray-700 mb-1">Category</p>
                                <p className="font-medium text-gray-800">
                                    {p.category || '—'}
                                </p>
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center justify-between">
                                <p className="text-md font-semibold text-gray-700 mb-1">Quantity</p>
                                <p className="font-medium text-gray-800">
                                    {p.product_stock[0]?.quantity}{' '}
                                    {p.product_stock[0]?.unit_of_measure}
                                </p>
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between">
                                <p className="text-md font-semibold text-gray-700 mb-1">Selling Price</p>
                                <p className="font-semibold text-gray-900">
                                    {currency} {Number(p.product_prices[0]?.selling_price).toLocaleString()}
                                </p>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <p className="text-md font-semibold text-gray-700 mb-1">Status</p>
                                <span
                                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold
                    ${p.deleted
                                            ? 'bg-red-100 text-red-700'
                                            : p.product_stock[0]?.status === 'in_stock'
                                                ? 'bg-green-100 text-green-700'
                                                : p.product_stock[0]?.status === 'low_stock'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-800'}
                  `}
                                >
                                    {p.deleted
                                        ? 'Deleted'
                                        : p.product_stock[0]?.status?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Table */}
                <div className="hidden md:block rounded-xl bg-white shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Item</th>
                                <th className="px-4 py-3 text-left">Category</th>
                                <th className="px-4 py-3 text-left">Quantity</th>
                                <th className="px-4 py-3 text-left">Selling Price</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredProducts.map((p:any) => (
                                <tr key={p.id} className="border-t">
                                    <td className="px-4 py-3">
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 font-medium">{p.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{p.category}</td>
                                    <td className="px-4 py-3">{p.product_stock[0]?.quantity}</td>
                                    <td className="px-4 py-3">
                                        {currency} {Number(p.product_prices[0]?.selling_price).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${p.product_stock[0]?.status === 'in_stock'
                                                ? 'bg-green-100 text-green-700'
                                                : p.product_stock[0]?.status === 'low_stock'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {p.product_stock[0]?.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-2 py-3 text-center">
                                        <ActionMenu product={p} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    )
}