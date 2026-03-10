'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { AddProductModal } from '@/app/components/AddProductModal'
import { HiDownload, HiSearch } from 'react-icons/hi'
import Products from '@/app/types/products'
import BarcodeLabel from '@/app/components/BarcodeLabel'
import BarcodeBatchPrint from '@/app/components/barcodeBatch'

type DateFilter =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'lastYear'


type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'



export const dynamic = 'force-dynamic'

export default function inventoryPage() {
  const supabase = createClient()

  const [openModal, setOpenModal] = useState(false)

  const [products, setProducts] = useState<Products[]>([])
  const [loading, setLoading] = useState(true)
  const [openAllProducts, setOpenAllProducts] = useState(false)

  const [dateFilter, setDateFilter] = useState<DateFilter>('thisMonth')
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
const[viewaAllBarcode, setViewAllBArcode] = useState(false)
  // 🔹 Fetch today's sales
  const fetchAllProduct = useCallback(async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    const { data, error } = await supabase
      .from('products')
      .select(`
      id,
      name,
      category,
      brand,
      barcode,
      deleted,
      created_at,
      product_prices(selling_price, cost_price),
      product_stock(quantity, status, unit_of_measure)
    `)
      .eq('company_id', profile!.company_id)
      .eq('deleted', false)

      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setProducts(data ?? [])
    setLoading(false)
  }, [supabase])

  const filteredProducts = products.filter((p) => {
    /* ---------- DATE FILTER ---------- */
    const created = new Date(p.created_at)
    const now = new Date()

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfYesterday = new Date(startOfToday)
    startOfYesterday.setDate(startOfToday.getDate() - 1)

    /* Week */
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfToday.getDate() - 6)

    const startOfLastWeek = new Date(startOfWeek)
    startOfLastWeek.setDate(startOfWeek.getDate() - 7)
    const endOfLastWeek = new Date(startOfWeek)

    /* Month */
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(startOfThisMonth)

    /* Year */
    const startOfThisYear = new Date(now.getFullYear(), 0, 1)
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1)
    const endOfLastYear = new Date(startOfThisYear)

    let dateMatch = true

    switch (dateFilter) {
      case 'today':
        dateMatch = created >= startOfToday
        break

      case 'yesterday':
        dateMatch =
          created >= startOfYesterday && created < startOfToday
        break

      case 'week':
        dateMatch = created >= startOfWeek
        break

      case 'lastWeek':
        dateMatch =
          created >= startOfLastWeek && created < endOfLastWeek
        break

      case 'thisMonth':
        dateMatch = created >= startOfThisMonth
        break

      case 'lastMonth':
        dateMatch =
          created >= startOfLastMonth && created < endOfLastMonth
        break

      case 'thisYear':
        dateMatch = created >= startOfThisYear
        break

      case 'lastYear':
        dateMatch =
          created >= startOfLastYear && created < endOfLastYear
        break
    }


    /* ---------- SEARCH FILTER ---------- */
    const query = search.toLowerCase()
    const searchMatch =
      p.name.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query)

    /* ---------- STOCK FILTER ---------- */
    const stockStatus = p.product_stock[0]?.status

    const stockMatch =
      stockFilter === 'all' ||
      stockFilter === stockStatus

    return dateMatch && searchMatch && stockMatch
  })




  useEffect(() => {
    fetchAllProduct()
  }, [fetchAllProduct])

  // 🔹 Refresh after modal close
  const handleModalClose = () => {
    setOpenModal(false)
    fetchAllProduct()
  }

  const handleOpenAllBarcode  = ()=>{
    setViewAllBArcode(true)
  }

  const totalItems = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.product_stock[0]?.quantity || 0), 0);
  const inStockCount = products.filter(p => p.product_stock[0]?.status === 'in_stock').length;
  const lowStockCount = products.filter(p => p.product_stock[0]?.status === 'low_stock').length;
  const outOfStockCount = products.filter(p => p.product_stock[0]?.status === 'out_of_stock').length;

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
            fetchAllProduct()
          }}
          product={product}
        />
        {viewBarcode && <BarcodeLabel product={product} onclose={() => setViewBarcode(false)} open={viewBarcode} />}

      </div>
    )
  }

  return (
    <section className="w-full px-6 py-6 bg-gray-50">
      {/* Top action */}
      <div className="flex flex-col gap-6 md:flex-row md:justify-between  mb-6">
        <button
          onClick={() => setOpenModal(true)}
          className="flex flex-col md:flex-row items-center gap-2 rounded-lg bg-blue-600 w-full md:h-10 md:w-60  justify-center cursor-pointer px-4 py-2 text-sm font-medium text-white"
        >
          + Add Product
        </button>
         <button
          onClick={handleOpenAllBarcode}
          className="flex flex-col md:flex-row items-center gap-2 rounded-lg bg-blue-600 w-full md:h-10 md:w-60  justify-center cursor-pointer px-4 py-2 text-sm font-medium text-white"
        >
          View Products Barcode
        </button>
        <button className='flex gap-2 items-center justify-center md:h-10 rounded-md bg-white px-4 py-4 max-sm:w-full '>
          <HiDownload className='cursor-pointer' /> uplaod from CSV
        </button>
        
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-20 mb-6">
        <SummaryCard
          label="Total Items"
          value={totalItems.toString()}
        />

        <SummaryCard
          label="Total Stock Quantity"
          value={totalStock.toLocaleString()}
        />

        <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-sm bg-green-500"></div>
            <p className="text-gray-700">In Stock: {inStockCount}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-sm bg-yellow-500"></div>
            <p className="text-gray-700">Low Stock: {lowStockCount}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-sm bg-red-500"></div>
            <p className="text-gray-700">Out of Stock: {outOfStockCount}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="flex items-center w-full rounded-xl bg-gray-100 px-3 py-2">
          <HiSearch className="text-gray-500" size={22} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, category, or brand"
            className="w-full bg-transparent px-2 outline-none text-sm"
          />
        </div>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as StockFilter)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm"
        >
          <option value="all">All Stock</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3 text-sm font-medium mb-2">
          <span>{dateFilter === 'today' ? "Today's" : dateFilter == 'yesterday' ? "Yasterday's" : "This Week"} Added Products</span>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="lastWeek">Last Week</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
            <option value="lastYear">Last Year</option>
          </select>

        </div>

        {/* mobile card */}
        <div className="space-y-4 md:hidden">
          {filteredProducts.slice(0, 4).map((p) => (
            <div
              key={p.id}
              className="rounded-xl bg-white p-4 shadow-sm border space-y-3"
            >

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
                  ₦{Number(p.product_prices[0]?.selling_price).toLocaleString()}
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
          {!loading && filteredProducts.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                No products found for this period.

              </td>
            </tr>
          )}
        </div>



        <div className="hidden md:block rounded-xl bg-white shadow-sm overflow-x-auto">

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
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
              {filteredProducts.slice(0, 4).map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category}</td>
                  <td className="px-4 py-3">{p.product_stock[0]?.quantity} {p.product_stock[0]?.unit_of_measure}</td>
                  <td className="px-4 py-3">
                    ₦{Number(p.product_prices[0]?.selling_price).toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${p.deleted
                        ? 'bg-red-100 text-red-700'
                        : p.product_stock[0]?.status === 'in_stock'
                          ? 'bg-green-100 text-green-700'
                          : p.product_stock[0]?.status === 'low_stock'
                            ? 'bg-yellow-100 text-yellow-700'
                            : p.product_stock[0]?.status === 'out_of_stock'
                              ? 'bg-red-100 text-red-800'
                              : ''
                        }`}
                    >
                      {p.deleted ? 'deleted' : p.product_stock[0]?.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ActionMenu product={p} />
                  </td>
                </tr>
              ))}

              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    No products found for this match.

                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
        {/* if product is grater than 5 i make it popup */}
        {filteredProducts.length > 4 && (
          <div className="border-t px-4 py-3 text-center">
            <button
              onClick={() => setOpenAllProducts(true)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              See all products →
            </button>
          </div>
        )}

      </div>
      <AddProductModal
        open={openModal}
        onClose={handleModalClose}


      />
      {openAllProducts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
          <div className="flex h-[95vh] w-full max-w-7xl flex-col mt-40 overflow-hidden rounded-2xl bg-white shadow-xl">

            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                <h2 className="text-lg font-semibold">All Products</h2>

                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">

                  {/* Search */}
                  <div className="flex items-center w-full sm:w-64 rounded-xl bg-gray-100 px-3 py-2">
                    <HiSearch className="text-gray-500" size={18} />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search products"
                      className="w-full bg-transparent px-2 text-sm outline-none"
                    />
                  </div>

                  {/* Stock Filter */}
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                    className="rounded-xl border px-3 py-2 text-sm"
                  >
                    <option value="all">All Stock</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>

                  {/* Date Filter */}
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                    className="rounded-xl border px-3 py-2 text-sm"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">This Week</option>
                    <option value="lastWeek">Last Week</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="thisYear">This Year</option>
                    <option value="lastYear">Last Year</option>
                  </select>

                  {/* Close */}
                  <button
                    onClick={() => setOpenAllProducts(false)}
                    className="ml-auto text-gray-500 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4  max-h-[80vh] overflow-y-auto  md:hidden">
              {filteredProducts.map((p) => (
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
                      ₦{Number(p.product_prices[0]?.selling_price).toLocaleString()}
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
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-3">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-gray-500">{p.category}</td>
                      <td className="px-4 py-3">{p.product_stock[0]?.quantity}</td>
                      <td className="px-4 py-3">
                        ₦{Number(p.product_prices[0]?.selling_price).toLocaleString()}
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
                hey
              </table>
            </div>
          </div>
        </div>
      )}
      {viewaAllBarcode &&(
        <BarcodeBatchPrint products={products} open={viewaAllBarcode} onClose={()=>(setViewAllBArcode(false))}/>
      )}

    </section>
  )
}

/* 🔹 Small reusable card */
function SummaryCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      className={`flex flex-row rounded-xl bg-white p-6 max-h-30 shadow-sm md:flex-col max-sm:items-center justify-between
        }`}
    >
      <p className="text-md font-semibold text-gray-700 font-poppins">{label}</p>
      <div className="flex justify-between items-center item-end">
        <p className="mt-2 text-xl font-semibold">
          {value}
        </p>

      </div>
    </div>
  )
}
