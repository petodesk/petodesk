'use client'

import { AddExpendeModal } from './AddExpendeModal'
import { useState } from 'react'
import { useCompany } from '../context/CompanyContext'
type Expense = {
  id: string
  amount: number
  status: string
  category: string
  created_at: string
  title: string
  paid_to: string
  note: string
  receipt_number: string
  profiles?: {
    full_name: string
  }
}
export function AllExpensesModal({
  open,
  onClose,
  expenses,
  ActionMenu,
}: {
  open: boolean
  onClose: () => void
  expenses: Expense[]
  ActionMenu: any
}) {
  if (!open) return null
  const { company, currency } = useCompany()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 mx-4 my-20 w-full max-w-6xl max-h-[85vh] bg-white rounded-xl shadow-lg flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">All Expenses</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* ---------------- MOBILE (CARDS) ---------------- */}
          <div className="space-y-4 md:hidden">
            {expenses.map((ex) => (
              <div
                key={ex.id}
                className="rounded-xl border bg-white p-4 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {new Date(ex.created_at).toLocaleDateString()}
                  </p>
                  {ex.status !== 'Cancelled' && (
                    <ActionMenu expense={ex} />
                  )}
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Title</span>
                  <span className="font-medium">{ex.title}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span>{ex.category}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-semibold">
                   {currency} {ex.amount?.toLocaleString() || '—'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Added By</span>
                  <span>{ex.profiles?.full_name ?? '—'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full
                      ${ex.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : ex.status === 'Cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                  >
                    {ex.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ---------------- DESKTOP (TABLE) ---------------- */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Added By</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((ex) => (
                  <tr key={ex.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {new Date(ex.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{ex.title}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        {ex.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {currency} {ex.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {ex.profiles?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full
                          ${ex.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : ex.status === 'Cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                      >
                        {ex.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {ex.status !== 'Cancelled' && (
                        <ActionMenu expense={ex} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
