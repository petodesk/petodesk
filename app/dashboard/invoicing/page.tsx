'use client'

import { useEffect, useState, useCallback } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { createClient } from '@/app/utils/supabase/client'
import { HiSearch } from 'react-icons/hi'
import { AddInvoiceModal } from '@/app/components/AddInvoiceModal'
import { ViewInvoiceModal } from '@/app/components/InvoiceModal'
import { AllInvoiceModal } from '@/app/components/AllInvoiceModal'
import { toast } from 'react-toastify'

type Range =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year'
type Status = 'all' | 'paid' | 'cancelled' | 'pending' | 'overdue'


type InvoiceItem = {
  item_name: string
  quantity: number
  item_type: string
  unit_price: number
  amount: number
}
type Invoices = {
  id: string
  invoice_number: string
  bill_to: string
  ship_to: string
  tax_rate: number
  due_date: string
  tax_amount: number
  total: number
  created_at: string
  profiles?: { full_name: string }
  invoice_payments?: {
    id: string,
    payment_status: string,
    bank_name: string,
    account_number: number,
    account_name: string
  }[]
  invoice_items: InvoiceItem[]
}



export default function ExpensesPage() {
  const supabase = createClient()

  const [range, setRange] = useState<Range>('today')
  const [invoices, setInvoices] = useState<Invoices[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [show, setShow] = useState(true)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [openEdit, setOpenEdit] = useState(false)
  const [editInvoice, setEditInvoice] = useState<Invoices | null>(null)
  const [openAllInvoices, setOpenAllInvoices] = useState(false) // Fixed: changed from setOpenAllInvices
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<Status>('all')
  const [company, setCompany] = useState<{ name: string; location: string } | null>(null)
  const [companyProfile, setCompanyProfile] = useState<{ company_id: string; email: string, phone: string } | null>(null)
  const [ViewMore, setViewMore] = useState<Invoices | null>(null)



  /* ---------------- DATE RANGE LOGIC ---------------- */
  const getRangeDates = (range: Range) => {
    const now = new Date()
    let from = new Date()
    let to = new Date()

    switch (range) {
      case 'today':
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
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
        to.setHours(23, 59, 59, 999)
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
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        to.setHours(23, 59, 59, 999)
        break

      case 'last_month':
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        to = new Date(now.getFullYear(), now.getMonth(), 0)
        to.setHours(23, 59, 59, 999)
        break

      case 'this_year':
        from = new Date(now.getFullYear(), 0, 1)
        to = new Date(now.getFullYear(), 11, 31)
        to.setHours(23, 59, 59, 999)
        break

      case 'last_year':
        from = new Date(now.getFullYear() - 1, 0, 1)
        to = new Date(now.getFullYear() - 1, 11, 31)
        to.setHours(23, 59, 59, 999)
        break
    }

    return { from, to }
  }

  /* ---------------- FETCH INVOICES ---------------- */
  const fetchInvoices = useCallback(async () => {
    setLoading(true)

    const { from, to } = getRangeDates(range)

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        id,
        total,
        bill_to,
        ship_to,
        invoice_number,
        due_date,
        tax_rate,
        tax_amount,
        created_at,
        profiles ( full_name ),
        invoice_payments(id, payment_status, bank_name, account_name, account_number),
        invoice_items(item_type, item_name, unit_price, quantity, amount)
      `)
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Error fetching invoices: ' + error.message)
      setLoading(false)
      return
    }

    setInvoices(data as [])

    // Calculate total Invoices for non-cancelled invoices only
    const total = data
      .reduce((sum, invoice) => sum + invoice.total, 0)
    setTotalExpenses(total)

    setLoading(false)
  }, [range, supabase])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])


  useEffect(() => {
    const fetchCompanyProfile = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id, email, phone')
        .eq('id', userData.user.id)
        .eq('role', 'owner')
        .single()

      if (!profile?.company_id) return
      setCompanyProfile(profile)
      const { data: company } = await supabase
        .from('companies')
        .select('name, location')
        .eq('id', profile.company_id)
        .single()

      setCompany(company)
    }

    fetchCompanyProfile()
  }, [])



  const handleModalClose = () => {
    setOpenModal(false)
    fetchInvoices()
    setOpenEdit(false)
  }

  /* ---------------- ACTION MENU ---------------- */
  function ActionMenu({ invoice }: { invoice: Invoices }) {
    const supabase = createClient()
    const [open, setOpen] = useState(false)



    const handleEdit = () => {
      setEditInvoice(invoice)
      setOpenEdit(true)
    }

    const handleCancel = async () => {
      if (!invoice.invoice_payments?.[0]?.id) {
        toast.error('No payment record found for this invoice')
        return

      }
      try {
        const { error } = await supabase
          .from('invoice_payments')
          .update({ payment_status: 'cancelled' })
          .eq('id', invoice.invoice_payments[0]?.id)

        if (error) throw error

        // Refresh the invoices list
        fetchInvoices()
        setOpen(false)
      } catch (error) {
        toast.error('Error cancelling invoice')
        console.error('Error cancelling invoice:', error)
      }

    }



    const handlePaid = async () => {
      if (!invoice.invoice_payments?.[0]?.id) {
        toast.error('No payment record found for this invoice')
        return
      }

      try {
        const { error } = await supabase
          .from('invoice_payments')
          .update({ payment_status: 'paid' })
          .eq('id', invoice.invoice_payments[0]?.id)

        if (error) throw error

        // Refresh the invoices list
        fetchInvoices()
        setOpen(false)
      } catch (error) {
        toast.error('Error marking as paid')
        console.error('Error marking as paid:', error)
      }
    }

    const handleViewMore = () => {
      setViewMore(invoice)
      setOpen(false)
    }

    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="px-2 py-1 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          ⋮
        </button>

        {open && (
          <div className="absolute right-0 z-20 w-40 rounded-lg border bg-white shadow-lg">
            <ul className="text-sm">
              {invoice?.invoice_payments?.[0]?.payment_status !== 'paid' && invoice?.invoice_payments?.[0]?.payment_status !== 'cancelled' &&

              <li
                onClick={() => {
                  handleEdit()
                  setOpen(false)
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                Edit
              </li> 
  }

              {invoice?.invoice_payments?.[0]?.payment_status !== 'paid' && invoice?.invoice_payments?.[0]?.payment_status !== 'cancelled' &&

                (
                  <li
                    onClick={handlePaid}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-green-600"
                  >
                    Make Paid
                  </li>
                )}


              {invoice?.invoice_payments?.[0]?.payment_status !== 'cancelled' && invoice?.invoice_payments?.[0]?.payment_status !== 'paid' &&

                (
                  <li
                    onClick={handleCancel}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-red-600"
                  >
                    Cancel
                  </li>
                )}

              <li
                onClick={handleViewMore}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-blue-600"
              >
                View More
              </li>
            </ul>
          </div>
        )}
      </div>
    )
  }

  const filteredInvoices = invoices.filter((inv) => {
    /* ---------- SEARCH FILTER ---------- */
    const query = search.toLowerCase()
    const searchMatch =
      inv.bill_to.toLowerCase().includes(query) ||
      inv.invoice_items?.[0]?.item_type?.toLowerCase().includes(query)

    /* ---------- STATUS FILTER ---------- */
    const paymentStatus = inv.invoice_payments?.[0]?.payment_status?.toLowerCase()

    const statusMatch =
      filterStatus === 'all' ||
      (filterStatus === 'cancelled' && paymentStatus === 'cancelled') ||
      (filterStatus === 'paid' && paymentStatus === 'paid') ||
      (filterStatus === 'pending' && paymentStatus === 'pending') ||
      (filterStatus === 'overdue' && paymentStatus === 'overdue')

    return searchMatch && statusMatch
  })


  const paidCount = invoices.filter(inv => inv.invoice_payments?.[0]?.payment_status === 'paid').length
  const cancelledCount = invoices.filter(inv => inv.invoice_payments?.[0]?.payment_status === 'cancelled').length
  const pendingCount = invoices.filter(inv => !inv.invoice_payments?.[0]?.payment_status || inv.invoice_payments?.[0]?.payment_status === 'pending').length
  const overDueCount = invoices.filter(inv => inv.invoice_payments?.[0]?.payment_status === 'overdue').length



  /* ---------------- UI ---------------- */
  return (
    <section className="w-full px-6 py-6 bg-gray-50 min-h-screen">
      {/* ---------------- TOP ACTION BAR ---------------- */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Add Invoice */}
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors sm:w-auto"
        >
          + Add Invoice
        </button>

        {/* Right: Range Selector */}
        <div className='flex gap-2 items-center'>
          <h1 className="text-sm text-gray-600">Filter by Time:</h1>
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

      {/* Summary card */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-20 mb-6">
        <SummaryCard
          label="Total Invoices"
          value={`₦${totalExpenses.toLocaleString()}`}
          show={show}
          onToggle={() => setShow(!show)}
        />

        <div className="grid grid-cols-2  gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-sm bg-green-500"></div>
            <p className="text-gray-700">Paid: {paidCount}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-sm bg-red-500"></div>
            <p className="text-gray-700">Cancelled: {cancelledCount}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-sm bg-yellow-500"></div>
            <p className="text-gray-700">Pending: {pendingCount}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-sm bg-red-500"></div>
            <p className="text-gray-700">Over Due: {overDueCount}</p>
          </div>
        </div>

      </div>

      <div className="flex flex-col-reverse w-full md:flex-row gap-3 mb-4 items-center justify-between">
        {/* Search */}
        <div className="flex w-full items-center flex-1 rounded-xl bg-gray-100 px-3 py-2">
          <HiSearch className="text-gray-500" size={22} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client or item type"
            className="w-full bg-transparent px-2 outline-none text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className='flex gap-2 items-center'>
          <h1>Filter by Status</h1>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Status)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* ---------------- INVOICES TABLE ---------------- */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="border-b px-4 py-3 text-sm font-medium mb-4 flex justify-between items-center">
          <span>
            Invoice History
            <span className="ml-2 text-gray-400 capitalize">
              ({range.replace('_', ' ')})
            </span>
          </span>
          <span className="text-xs text-gray-500">
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Mobile view */}
        <div className="space-y-4 md:hidden">
          {filteredInvoices.slice(0, 4).map((inv) => (
            <div
              key={inv.id}
              className="rounded-xl bg-white p-4 shadow-sm border space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">
                  {new Date(inv.created_at).toLocaleDateString()}
                </p>
                <ActionMenu invoice={inv} />
              </div>

              <hr />

              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Invoice #</p>
                <p className="text-base font-semibold text-gray-900">
                  {inv.invoice_number}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Client</p>
                <p className="font-medium text-gray-800">
                  {inv.bill_to || '—'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Amount</p>
                <p className="font-medium text-gray-800">
                  ₦{inv.total.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Added By</p>
                <p className="font-semibold text-gray-900">
                  {inv.profiles?.full_name || 'N/A'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Status</p>
                <span className={`capitalize px-2 py-1 rounded-full text-xs ${inv.invoice_payments?.[0]?.payment_status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : inv.invoice_payments?.[0]?.payment_status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : inv.invoice_payments?.[0]?.payment_status === 'overdue'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {inv.invoice_payments?.[0]?.payment_status || 'Unpaid'}
                </span>

              </div>
            </div>
          ))}
          {!loading && filteredInvoices.length === 0 && (
            <div className="px-4 py-10 text-center text-gray-400">
              No invoices found for this period.
            </div>
          )}
        </div>

        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Invoice #</th>
                <th className="px-4 py-3 text-left font-medium">Client</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No invoices found for this period
                  </td>
                </tr>
              ) : (
                filteredInvoices.slice(0, 4).map((invoice) => (
                  <tr key={invoice.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {invoice.bill_to}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ₦{invoice.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`capitalize px-2 py-1 rounded-full text-xs ${invoice.invoice_payments?.[0]?.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.invoice_payments?.[0]?.payment_status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {invoice.invoice_payments?.[0]?.payment_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ActionMenu invoice={invoice} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddInvoiceModal open={openModal} onClose={handleModalClose} />

      {editInvoice && (
        <AddInvoiceModal
          open={openEdit}
          onClose={handleModalClose}
          invoices={editInvoice}
        />
      )}

      {ViewMore && (
        <ViewInvoiceModal
          open={true}
          onClose={() => {
            setViewMore(null)
            fetchInvoices()
          }}
          invoice={ViewMore}
          company={company}
          companyProfile={companyProfile}
        />
      )}


       <button
        onClick={() => setOpenAllInvoices(true)}
        className="mt-4 w-full rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium hover:bg-gray-50">
        View All Invoices
      </button> 

      {openAllInvoices && ( 
        <AllInvoiceModal
          open={openAllInvoices}
          onClose={() => setOpenAllInvoices(false)}
          invoices={invoices}
          loading={loading}
          ActionMenu={ActionMenu}
        />
      )}

    </section>
  )
}


/* ---------------- SUMMARY CARD COMPONENT ---------------- */
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
        <p className="mt-2 text-2xl font-bold text-gray-800">
          {show ? value : '••••'}
        </p>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600"
        >
          {show ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>
    </div>
  )
}