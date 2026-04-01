'use client'

import { useEffect, useState, useCallback } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { createClient } from '@/app/utils/supabase/client'
import { AddExpendeModal } from '@/app/components/AddExpendeModal'
import { AllExpensesModal } from '@/app/components/AllExpensesModal'
import { HiSearch } from 'react-icons/hi'
import { ViewExpensesModal } from '@/app/components/ViewModal'
import { useCompany } from '@/app/context/CompanyContext'

type Range =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year'

type Status = 'all' | 'paid' | 'Cancelled' | 'pending'

type Expense = {
  id: string
  amount: number
  status: string
  category: string
  created_at: string
  title: string
  paid_to: string
  image: string
  note: string
  receipt_number: string
  profiles?: {
    full_name: string
  }
}


export default function ExpensesPage() {
  const supabase = createClient()

  const [range, setRange] = useState<Range>('this_month')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [show, setShow] = useState(true)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [openEdit, setOpenEdit] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [openAllExpenses, setOpenAllExpenses] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<Status>('all')
  const [ViewMore, setViewMore] = useState<Expense | null>(null)
  const { company, currency } = useCompany()


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

  /* ---------------- FETCH EXPENSES ---------------- */
  const fetchExpenses = useCallback(async () => {
    setLoading(true)

    const { from, to } = getRangeDates(range)

    const { data, error } = await supabase
      .from('expenses')
      .select(`
        id,
        title,
        amount,
        paid_to,
        receipt_number,
        note,
        image,
        created_at,
        profiles ( full_name ),
        category,
        status
      `)
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setExpenses(data as [])

    // Calculate total expenses for non-cancelled expenses only
    const total = data
      .filter(expense => expense.status !== 'Cancelled') // Filter out cancelled expenses
      .reduce((sum, expense) => sum + expense.amount, 0)
    setTotalExpenses(total)

    setLoading(false)
  }, [range, supabase])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const handleModalClose = () => {
    setOpenModal(false)
    fetchExpenses()
    setOpenEdit(false)
  }

  /* ---------------- ACTION MENU ---------------- */
  function ActionMenu({ expense }: { expense: Expense }) {
    const supabase = createClient()
    const [open, setOpen] = useState(false)

    const handleCancel = async () => {
      if (!confirm('Cancel this expense?')) return

      await supabase
        .from('expenses')
        .update({
          status: "Cancelled"
        })
        .eq('id', expense.id)

      fetchExpenses()
    }

    const handlePaid = async () => {
      await supabase
        .from('expenses')
        .update({
          status: "paid"
        })
        .eq('id', expense.id)

      fetchExpenses()
    }
    const handleEdit = () => {
      setEditExpense(expense)
    }

    const handleViewMore = async () => {
      setViewMore(expense)

      fetchExpenses()
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
              {expense.status !== 'Cancelled' && (
                <li
                  onClick={() => {
                    handleEdit()
                    setOpen(false)
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"

                >Edit</li>)}
              {expense.status !== "paid" && expense.status !== 'Cancelled' && (
                <li
                  onClick={() => {
                    handlePaid()
                    setOpen(false)
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-green-600"
                >
                  Make Paid
                </li>
              )}

              {expense.status == "pending" && (
                <li
                  onClick={() => {
                    handleCancel()
                    setOpen(false)
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-orange-600"
                >
                  Cancel
                </li>
              )}

              <li
                onClick={() => {
                  handleViewMore()
                  setOpen(false)
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-blue-600"
              >
                View More
              </li>


            </ul>
          </div>
        )}
        {editExpense && (
          <AddExpendeModal
            open={true}
            expense={editExpense}
            onClose={() => {
              setEditExpense(null)
              fetchExpenses()
            }}
          />
        )}
        {ViewMore && (

          <ViewExpensesModal
            open={true}
            onClose={() => {
              setViewMore(null)
              fetchExpenses()

            }}
            expenses={ViewMore}

          />
        )}



      </div>
    )
  }

  const filteredExpenses = expenses.filter((ex) => {
    /* ---------- SEARCH FILTER ---------- */
    const query = search.toLowerCase()
    const searchMatch =
      ex.title.toLowerCase().includes(query) ||
      ex.category?.toLowerCase().includes(query)


    /* ---------- STATUS FILTER ---------- */
    const stockStatus = ex.status

    const statusMatch =
      filterStatus === 'all' ||
      filterStatus === stockStatus


    return searchMatch && statusMatch


  })


  /* ---------------- UI ---------------- */
  return (
    <section className="w-full px-6 py-6 bg-gray-50 min-h-screen">
      {/* ---------------- TOP ACTION BAR ---------------- */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Add Expense */}
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors sm:w-auto"
        >
          + Add Expense
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
      <div className="mb-6">
        <SummaryCard
          label="Total Expenses"
          value={`${currency} ${''}${totalExpenses.toLocaleString()}`}
          show={show}
          onToggle={() => setShow(!show)}
        />
      </div>

      <div className="flex flex-col-reverse w-full md:flex-row gap-3 mb-4 items-center justify-between">
        {/* Search */}
        <div className="flex w-full items-center flex-1 rounded-xl bg-gray-100 px-3 py-2">
          <HiSearch className="text-gray-500" size={22} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tilte or category"
            className="w-full bg-transparent px-2  outline-none text-sm"
          />
        </div>

        {/* status Filter */}
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
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      {/* ---------------- EXPENSES TABLE ---------------- */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">

        <div className="border-b px-4 py-3 text-sm font-medium mb-4 flex justify-between items-center">
          <span>
            Expense History
            <span className="ml-2 text-gray-400 capitalize">
              ({range.replace('_', ' ')})
            </span>
          </span>
          <span className="text-xs text-gray-500">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* mobile card */}
        <div className="space-y-4 md:hidden">
          {filteredExpenses.slice(0, 4).map((ex) => (
            <div
              key={ex.id}
              className="rounded-xl bg-white p-4 shadow-sm border space-y-3"
            >

              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">
                  {new Date(ex.created_at).toLocaleDateString()}
                </p>
                {
                  ex.status !== "Cancelled" && (
                    <ActionMenu expense={ex} />
                  )
                }

              </div>

              <hr />

              {/* Name */}
              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Expense Title</p>
                <p className="text-base font-semibold text-gray-900">
                  {ex.title}
                </p>
              </div>

              {/* Category */}
              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Expense Category</p>
                <p className="font-medium text-gray-800">
                  {ex.category || '—'}
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Amount</p>
                <p className="font-medium text-gray-800">
                  {currency} {ex.amount?.toLocaleString() || '—'}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Added By</p>
                <p className="font-semibold text-gray-900">
                  {ex.profiles?.full_name}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Status</p>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold
            ${ex.status === 'Cancelled'
                      ? 'bg-red-100 text-red-700'
                      : ex.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : ex.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : ''}
          `}
                >
                  {ex.status}
                </span>
              </div>
            </div>
          ))}
          {!loading && expenses.length === 0 && (
            <>
              <p className="px-4 py-10 text-center text-gray-400">
                No Expense found for this filter.

              </p>
            </>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Added By</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Loading expenses...
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No expenses found for this filter.
                  </td>
                </tr>
              ) : (
                filteredExpenses.slice(0, 4).map((expense) => (
                  <tr key={expense.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {new Date(expense.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {expense.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {currency} {expense.amount?.toLocaleString() || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {expense.profiles?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${expense.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : expense.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {
                        expense.status !== "Cancelled" && (
                          <ActionMenu expense={expense} />
                        )
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

        </div>
      </div>

      <AddExpendeModal open={openModal} onClose={handleModalClose} />
      <AllExpensesModal
        open={openAllExpenses}
        onClose={() => setOpenAllExpenses(false)}
        expenses={expenses}
        ActionMenu={ActionMenu}
      />

      <button
        onClick={() => setOpenAllExpenses(true)}
        className="mt-4 w-full rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium hover:bg-gray-50"
      >
        View All Expenses
      </button>

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