'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { toast } from 'react-toastify'
import { touchCompanyActivity } from '../utils/activity'

export function AddExpendeModal({
  open,
  onClose,
  expense,
}: {
  open: boolean
  onClose: () => void
  expense?: any
}) {
  if (!open) return null

  const supabase = createClient()
  const isEdit = !!expense

  // form state
  const [title, settitle] = useState(expense?.title ?? '')
  const [categroy, setCategory] = useState(expense?.category ?? '')
  const [note, setNote] = useState(expense?.note ?? '')
  const [amount, setAmount] = useState(expense?.amount ?? '')
  const [paidTo, setPiadTo] = useState(expense?.paid_to ?? '')
  const [receiptNumber, setReceiptNumber] = useState(expense?.receipt_number ?? '')
  const [receiptImage, setReceiptImage] = useState<File | null>(null)

  const [payerId, setPayerId] = useState<string | null>(null)
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setPayerId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

      setUserCompanyId(profile?.company_id ?? null)
    }

    getUser()
  }, [])


  const uploadReceipt = async (file: File, companyId: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${companyId}/${crypto.randomUUID()}.${fileExt}`

    const { error } = await supabase.storage
      .from('expense-receipts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    const { data } = supabase.storage
      .from('expense-receipts')
      .getPublicUrl(fileName)

    return data.publicUrl
  }







  // ✅ Save or update
  const handleSave = async () => {
    if (!title || !categroy || !amount || !paidTo || !receiptNumber) {
      toast.error('Please fill all required fields')
      return
    }

    if (!payerId || !userCompanyId) {
      alert('User or company not found')
      return
    }
    setLoading(true)

    try {
      let imageUrl = expense?.image ?? null

      // 1️⃣ Upload image if selected
      if (receiptImage) {
        imageUrl = await uploadReceipt(receiptImage, userCompanyId)
      }

      // 2️⃣ Prepare payload
      const payload = {
        title,
        paid_to: paidTo,
        amount: Number(amount),
        receipt_number: receiptNumber,
        note,
        image: imageUrl,
        category: categroy,
        added_by: payerId,
        company_id: userCompanyId,
      }

      const { data } = await supabase.rpc(
        'touch_company_activity',
        {
          p_company_id: userCompanyId,
          p_user_id: payerId,
          p_activity: ` ${isEdit ? 'Expense updated' : 'Expense added'}: ${title} - $${amount}`,
        }
      )

      

      // 3️⃣ Insert or update
      const query = isEdit
        ? supabase.from('expenses').update(payload).eq('id', expense.id)
        : supabase.from('expenses').insert(payload)

      const { error } = await query
      if (error) throw error

      onClose()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }



  const expensesCategory = [
    'Employee Salaries and Benefits',
    'Office Rent and Utilities',
    'Marketing and Advertising',
    'Software Subscriptions and Technology',
    'Raw Materials and Inventory',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 mx-4 w-full max-w-3xl mt-10 max-h-[80vh] rounded-xl bg-white shadow-lg flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input

              required
              label="Expense Title *" value={title} onChange={settitle} />

            <Select
              required
              label="Expense Category *"
              options={expensesCategory}
              value={categroy}
              onChange={setCategory}
            />

            <Input
              required
              label="Amount *"
              type="number"
              value={amount}
              onChange={(v) => setAmount(v.replace(/^0+(?=\d)/, ''))}
            />

            <Input
              required
              label="Paid to / Vendor *"
              value={paidTo}
              onChange={setPiadTo}
            />

            <Input
              required
              label="Receipt Number"
              value={receiptNumber}
              onChange={setReceiptNumber}
            />

            <Input
              required
              label="Note" value={note} onChange={setNote} />

            {/* File Upload */}
            <div className="col-span-1 md:col-span-2 flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">
                  Attach Receipt
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setReceiptImage(e.target.files?.[0] || null)
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {receiptImage && (
                <div className="w-32 flex justify-center">
                  <img
                    src={URL.createObjectURL(receiptImage)}
                    alt="Receipt preview"
                    title="Click to remove"
                    onClick={() => setReceiptImage(null)}
                    className="h-24 w-24 cursor-pointer rounded-lg border object-cover
                               transition hover:opacity-80"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm
                       text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-8 py-2 text-sm text-white
                       hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- INPUT ---------------- */

function Input({
  label,
  value,
  required = false,
  onChange,
  type = 'text',
  disabled = false,
}: {
  label: string
  value: any
  required?: boolean
  onChange?: (v: string) => void
  type?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        required={required}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   disabled:bg-gray-100"
      />
    </div>
  )
}

/* ---------------- SELECT ---------------- */

function Select({
  label,
  value,
  required = false,
  onChange,
  options,
}: {
  label: string
  value: string
  required?: boolean
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
