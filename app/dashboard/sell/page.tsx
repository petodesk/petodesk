
'use client'

import { useEffect, useState, useCallback } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { createClient } from '@/app/utils/supabase/client'
import { AddSaleModal } from '@/app/components/SellerForm'
import ReceiptModal from '@/app/components/ReceiptModal'
import AllSalesModal from '@/app/components/AllSalesModal'

type Range =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year'

type Sale = {
  id: string
  total_amount: number
  payment_method: string
  created_at: string

  profiles?: {
    full_name: string
  }[]
  sale_items: {
    id: string
    quantity: number
    status: string
    subtotal: number
    selling_price: number
    cost_price: number
    discount: number
    discount_percent: number
    tax_percent: number
    tax_amount: number
    product_id: string
    products?: {
      name: string
    }[]
  }[]

}

export default function SellPage() {
  const supabase = createClient()

  const [range, setRange] = useState<Range>('today')
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [allSalesOpen, setAllSalesOpen] = useState(false)

  //  Receipt modal state
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [company, setCompany] = useState<{ name: string; location: string } | null>(null)


  const [show, setShow] = useState(true)
  const [totalSales, setTotalSales] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [edit, setEdit] = useState(false)
  /* ---------------- DATE RANGE LOGIC ---------------- */
  const getRangeDates = (range: Range) => {
    const now = new Date()
    let from = new Date()
    let to = new Date()

    switch (range) {
      case 'today':
        from.setHours(0, 0, 0, 0)
        break

      case 'yesterday':
        from.setDate(from.getDate() - 1)
        from.setHours(0, 0, 0, 0)
        to = new Date(from)
        to.setHours(23, 59, 59, 999)
        break

      case 'this_week':
        from.setDate(from.getDate() - from.getDay())
        from.setHours(0, 0, 0, 0)
        break

      case 'last_week':
        from.setDate(from.getDate() - from.getDay() - 7)
        from.setHours(0, 0, 0, 0)
        to = new Date(from)
        to.setDate(to.getDate() + 6)
        to.setHours(23, 59, 59, 999)
        break

      case 'this_month':
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        break

      case 'last_month':
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        to = new Date(now.getFullYear(), now.getMonth(), 0)
        to.setHours(23, 59, 59, 999)
        break

      case 'this_year':
        from = new Date(now.getFullYear(), 0, 1)
        break

      case 'last_year':
        from = new Date(now.getFullYear() - 1, 0, 1)
        to = new Date(now.getFullYear() - 1, 11, 31)
        to.setHours(23, 59, 59, 999)
        break
    }

    return { from, to }
  }

  /* ---------------- FETCH SALES ---------------- */
  const fetchSales = useCallback(async () => {
    setLoading(true)

    const { from, to } = getRangeDates(range)

    const { data, error } = await supabase
      .from('sales')
      .select(`
    id,
    total_amount,
    payment_method,
    created_at,
    profiles ( full_name ),
    sale_items (
  id,
  quantity,
  status,
  subtotal,
  selling_price,
  discount_percent,
  tax_percent,  
  tax_amount, 
  cost_price,
  discount,
  product_id,
  products ( name )
)

  `)
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())
      .order('created_at', { ascending: false })


    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    let salesTotal = 0
    let profitTotal = 0

    data.forEach((sale) => {
      const activeItems = sale.sale_items.filter(
        item => item.status !== 'Cancelled'
      )

      activeItems.forEach(item => {
        salesTotal += item.subtotal
        profitTotal +=
          (item.selling_price - item.cost_price) *
          item.quantity -
          item.discount
      })
    })



    setSales(data)
    setTotalSales(salesTotal)
    setTotalProfit(profitTotal)
    setTotalTransactions(data.length)
    setLoading(false)
  }, [range, supabase])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])


  useEffect(() => {
    const fetchCompany = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userData.user.id)
        .single()

      if (!profile?.company_id) return

      const { data: company } = await supabase
        .from('companies')
        .select('name, location')
        .eq('id', profile.company_id)
        .single()

      setCompany(company)
    }

    fetchCompany()
  }, [])

  const handleModalClose = () => {
    setOpenModal(false)
    fetchSales()
  }



  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editQty, setEditQty] = useState(1)


  function ActionMenu({ sale, item, rowId }: any) {

    const supabase = createClient()
    const [open, setOpen] = useState(false)

    const startEdit = () => {
      setEditingItemId(rowId)
      setEditQty(item.quantity)
      setOpen(false)
    }





    const saveEdit = async () => {
      if (editQty === item.quantity) {
        setEditingItemId(null)
        return
      }

      const diff = editQty - item.quantity
      const price = item.selling_price

      /* ---------- OLD VALUES ---------- */
      const grossOld = price * item.quantity
      const discountOld = (grossOld * item.discount_percent) / 100
      const netOld = grossOld - discountOld
      const taxOld = (netOld * item.tax_percent) / 100
      const oldSubtotal = netOld + taxOld

      /* ---------- NEW VALUES ---------- */
      const grossNew = price * editQty
      const discountNew = (grossNew * item.discount_percent) / 100
      const netNew = grossNew - discountNew
      const taxNew = (netNew * item.tax_percent) / 100
      const newSubtotal = netNew + taxNew

      /* ---------- STOCK CHECK ---------- */
      const { data: stockRow, error } = await supabase
        .from('product_stock')
        .select('quantity')
        .eq('product_id', item.product_id)
        .single()

      if (error || !stockRow) {
        alert('Failed to update stock')
        return
      }

      if (diff > 0 && stockRow.quantity < diff) {
        alert('Not enough stock available')
        return
      }

      await supabase
        .from('product_stock')
        .update({
          quantity: stockRow.quantity - diff,
        })
        .eq('product_id', item.product_id)

      /* ---------- UPDATE SALE ITEM ---------- */
      await supabase
        .from('sale_items')
        .update({
          quantity: editQty,
          discount: discountNew,
          tax_amount: taxNew,
          subtotal: newSubtotal,
        })
        .eq('id', item.id)

      /* ---------- UPDATE SALE TOTAL ---------- */
      await supabase
        .from('sales')
        .update({
          total_amount: sale.total_amount - oldSubtotal + newSubtotal,
        })
        .eq('id', sale.id)

      setEditingItemId(null)
      fetchSales()
    }



    const handleCancelItem = async () => {
      if (item.status === 'cancelled') {
        alert('Item already cancelled')
        return
      }

      if (!confirm('Cancel this item and return stock?')) return

      /* 1️⃣ Mark item cancelled */
      await supabase
        .from('sale_items')
        .update({ status: 'Cancelled' })
        .eq('id', item.id)

      /* 2️⃣ Restore stock */
      const { data: stock } = await supabase
        .from('product_stock')
        .select('quantity')
        .eq('product_id', item.product_id)
        .single()

      await supabase
        .from('product_stock')
        .update({
          quantity: stock?.quantity + item.quantity,
        })
        .eq('product_id', item.product_id)

      /* 3️⃣ Recalculate sale total */
      const remainingItems = sale.sale_items.filter(
        (i: any) => i.id !== item.id && i.status !== 'cancelled'
      )

      const newTotal = remainingItems.reduce((sum: any, i: any) => {
        const gross = i.selling_price * i.quantity
        const discount = (gross * i.discount_percent) / 100
        const net = gross - discount
        const tax = (net * i.tax_percent) / 100
        return sum + net + tax
      }, 0)


      await supabase
        .from('sales')
        .update({
          total_amount: newTotal,
        })
        .eq('id', sale.id)

      fetchSales()
    }




    const openReceipt = () => {
      setSelectedSale(sale)
      setReceiptOpen(true)
      setOpen(false)
    }


    return (
      <div className="relative">
        <button
          className='font-bold w-4 cursor-pointer'
          onClick={() => setOpen(!open)}>⋮</button>

        {open && (
          <div className="absolute right-0 z-20 w-40 rounded-lg border bg-white shadow">
            <ul className="text-sm">
              {item.status !== 'Cancelled' && (
                editingItemId === rowId ? (
                  <li onClick={saveEdit} className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                    Save
                  </li>
                ) : (
                  <li onClick={startEdit} className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                    Edit Qty
                  </li>
                )
              )}


              {item.status !== 'Cancelled' && (
                <li
                  onClick={handleCancelItem}
                  className="px-4 py-2 cursor-pointer text-red-600 hover:bg-gray-100"
                >
                  Cancel
                </li>
              )}

              <li
                onClick={openReceipt}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                Receipt
              </li>

            </ul>
          </div>
        )}

      </div>
    )
  }

  /* ---------------- UI ---------------- */
  return (
    <section className="w-full px-6 py-6 bg-gray-50">

      {/* ---------------- TOP ACTION BAR ---------------- */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Left: Add Sale */}
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:w-auto"
        >
          + Add New Sell
        </button>

        {/* Right: Range Selector */}
        <div className='flex gap-2 items-center'>
          <h1>Filter by:</h1>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-48"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">This Week</option>
            <option value="last_week">Last Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="last_year">Last Year</option>
          </select>
        </div>
      </div>


      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          label="Total Sales"
          value={`₦${totalSales.toLocaleString()}`}
          show={show}
          onToggle={() => setShow(!show)}
        />

        <SummaryCard
          label="Total Profit"
          value={`₦${totalProfit.toLocaleString()}`}
          show={show}
          onToggle={() => setShow(!show)}
        />

        <div className="flex flex-row md:flex-col justify-between items-center rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Transactions</p>
          <p className="mt-2 text-xl font-semibold">
            {loading ? '…' : totalTransactions}
          </p>
        </div>



      </div>
      {/* ---------------- TRANSACTION TABLE ---------------- */}
      <div className="rounded-xl bg-white shadow-sm">
        <div className="border-b px-4 py-3 text-sm font-medium flex justify-between">
          <span>
            Transaction History
            <span className="ml-2 text-gray-400 capitalize">
              ({range.replace('_', ' ')})
            </span>
          </span>
        </div>
        {/* ---------------- MOBILE SALES CARDS ---------------- */}
        <div className="space-y-4 md:hidden">
          {!loading &&
            sales.slice(0, 5).flatMap((sale) =>
              sale.sale_items.map((item) => {
                const amount =
                  item.subtotal

                return (
                  <div
                    key={item.id}
                    className="rounded-xl bg-white p-4 shadow-sm border space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-600">
                        {new Date(sale.created_at).toLocaleDateString()}
                      </p>
                      <ActionMenu
                        sale={sale}
                        item={item}
                        rowId={item.id}
                      />
                    </div>

                    <hr />

                    {/* Product Name */}
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-600">
                        Product
                      </span>
                      <span className="font-medium text-gray-900">
                        {item.products?.[0]?.name ?? '—'}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600">
                        Quantity
                      </span>

                      {editingItemId === item.id ? (
                        <input
                          type="number"
                          min={1}
                          value={editQty}
                          onChange={(e) => setEditQty(+e.target.value)}
                          className="w-20 rounded border px-2 py-1 text-sm"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">
                          {item.quantity}
                        </span>
                      )}
                    </div>

                    {/* Selling Price */}
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-600">
                        Selling Price
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₦{item.selling_price.toLocaleString()}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-600">
                        Amount
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₦{amount.toLocaleString()}
                      </span>
                    </div>

                    {/* Sold By */}
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-600">
                        Sold By
                      </span>
                      <span className="text-gray-800">
                        {sale.profiles?.[0]?.full_name ?? '—'
                        }
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600">
                        Status
                      </span>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold
                  ${item.status === 'Cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                )
              })
            )}

          {!loading && sales.length === 0 && (
            <div className="text-center text-gray-400 py-10">
              No transactions for this period.
            </div>
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-left">Qty</th>
                <th className="px-4 py-3 text-left">Selling Price</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Sold By</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-2 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                sales.slice(0, 5).flatMap((sale) =>
                  sale.sale_items.map((item, index) => {
                    const amount =
                      item.subtotal

                    return (
                      <tr
                        key={`${sale.id}-${index}`}
                        className="border-t"
                      >
                        <td className="px-4 py-3">
                          {new Date(sale.created_at).toLocaleDateString()}
                        </td>

                        <td className="px-4 py-3">
                          {item.products?.[0]?.name ?? '—'
}
                        </td>

                        <td className="px-4 py-3">
                          {editingItemId === item.id ? (
                            <input
                              type="number"
                              min={1}
                              value={editQty}
                              onChange={(e) => setEditQty(+e.target.value)}
                              className="w-16 rounded border px-2 py-1 text-sm"
                            />
                          ) : (
                            item.quantity
                          )}

                        </td>





                        <td className="px-4 py-3">{item.selling_price}</td>

                        <td className="px-4 py-3">
                          ₦{amount.toLocaleString()}
                        </td>

                        <td className="px-4 py-3">
                          {sale.profiles?.[0]?.full_name ?? '—'
                          }
                        </td>

                        <td
                          className={`px-4 py-3 font-medium ${item.status === 'Cancelled'
                            ? 'text-red-500'
                            : 'text-blue-600'
                            }`}
                        >
                          {item.status}
                        </td>
                        <td className="px-4 py-3">
                          <ActionMenu
                            sale={sale}
                            item={item}
                            rowId={item.id}
                          />

                        </td>
                      </tr>
                    )
                  })
                )}

              {!loading && sales.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No transactions for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <AddSaleModal open={openModal} onClose={handleModalClose} />
        {receiptOpen && selectedSale && company && (
          <ReceiptModal
            open={receiptOpen}
            onClose={() => setReceiptOpen(false)}
            sale={selectedSale}
            company={company}
          />
        )}
        {allSalesOpen && (
          <AllSalesModal
            open={allSalesOpen}
            onClose={() => setAllSalesOpen(false)}
            sales={sales}
            ActionMenu={ActionMenu}
            editingItemId={editingItemId}
            editQty={editQty}
            editOpen={edit}
            loading={loading}
            setEditQty={setEditQty}

          />
        )}


      </div>
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setAllSalesOpen(true)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          See all sales
        </button>
      </div>

    </section>
  )
}

/* ---------------- SUMMARY CARD ---------------- */
function SummaryCard({
  label,
  value,
  show,
  onToggle,
}: {
  label: string
  value: string
  show: boolean
  onToggle: () => void
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="flex items-center justify-between">
        <p className="mt-2 text-xl font-semibold">
          {show ? value : '••••'}
        </p>
        <button onClick={onToggle}>
          {show ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>
    </div>
  )
}

