'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'
import { useCompany } from '@/app/context/CompanyContext'

export const dynamic = 'force-dynamic'

type TimelineEvent = {
  at: string
  type: 'sold' | 'price_changed' | 'stock_changed' | 'updated' | 'deleted' | 'restored'
  field: string | null
  old_value: string | null
  new_value: string | null
  quantity: number | null
  amount: number | null
  actor: string | null
}

type HistoryResponse = {
  stats: {
    created_at: string
    added_by_name: string | null
    units_sold: number
    sales_count: number
    last_sold_at: string | null
  }
  events: TimelineEvent[]
}

type ProductDetail = {
  id: string
  name: string
  category: string | null
  brand: string | null
  barcode: string | null
  expires_at: string | null
  deleted: boolean
  created_at: string
  needs_review: boolean | null
  product_prices: { selling_price: number | null; cost_price: number | null }[]
  product_stock: { quantity: number | null; status: string | null; unit_of_measure: string | null }[]
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  category: 'Category',
  brand: 'Brand',
  expires_at: 'Expiry date',
  selling_price: 'Selling price',
  cost_price: 'Cost price',
  quantity: 'Stock',
  unit: 'Unit',
}

const DOT_COLORS: Record<string, string> = {
  sold: 'bg-green-500',
  price_changed: 'bg-blue-500',
  stock_changed: 'bg-purple-500',
  updated: 'bg-gray-400',
  deleted: 'bg-red-500',
  restored: 'bg-emerald-500',
  created: 'bg-gray-800',
}

/* ---------- date helpers ---------- */
const formatDateTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

// "2026-12-01" is a calendar date: parse it as LOCAL, not UTC, so it never shifts a day
const parseLocalDate = (s?: string | null) => {
  if (!s) return null
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

const formatDateOnly = (s?: string | null) => {
  const d = parseLocalDate(s)
  return d ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
}

const daysUntil = (s?: string | null) => {
  const d = parseLocalDate(s)
  if (!d) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}

export default function ProductDetailPage() {
  const supabase = createClient()
  const { id } = useParams<{ id: string }>()
  const { currency } = useCompany()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [history, setHistory] = useState<HistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    setHistoryError(null)

    const { data, error: productError } = await supabase
      .from('products')
      .select(`
        id, name, category, brand, barcode, expires_at, deleted, created_at, needs_review,
        product_prices(selling_price, cost_price),
        product_stock(quantity, status, unit_of_measure)
      `)
      .eq('id', id)
      .single()

    if (productError || !data) {
      setError('Product not found, or you do not have access to it.')
      setLoading(false)
      return
    }
    setProduct(data as unknown as ProductDetail)

    const { data: hist, error: histError } = await supabase.rpc('get_product_history', {
      p_product_id: id,
    })
    if (histError) {
      console.error(histError)
      setHistoryError('History is unavailable right now.')
    } else {
      setHistory(hist as HistoryResponse)
    }

    setLoading(false)
  }, [supabase, id])

  useEffect(() => {
    load()
  }, [load])

  const describe = (e: TimelineEvent): string => {
    const label = e.field ? FIELD_LABELS[e.field] ?? e.field : ''
    const plain = (v: string | null) => (v === null || v === '' ? 'not set' : v)
    const money = (v: string | null) =>
      v === null || v === '' ? 'not set' : `${currency} ${Number(v).toLocaleString()}`

    switch (e.type) {
      case 'sold': {
        const q = Number(e.quantity)
        return `Sold ${q.toLocaleString()} unit${q === 1 ? '' : 's'} at ${currency} ${Number(e.amount).toLocaleString()} each`
      }
      case 'price_changed':
        return `${label} changed from ${money(e.old_value)} to ${money(e.new_value)}`
      case 'stock_changed':
        return e.field === 'unit'
          ? `Unit changed from ${plain(e.old_value)} to ${plain(e.new_value)}`
          : `Stock changed from ${plain(e.old_value)} to ${plain(e.new_value)}`
      case 'updated':
        return e.field === 'expires_at'
          ? `${label} changed from ${e.old_value ? formatDateOnly(e.old_value) : 'not set'} to ${e.new_value ? formatDateOnly(e.new_value) : 'not set'}`
          : `${label} changed from "${plain(e.old_value)}" to "${plain(e.new_value)}"`
      case 'deleted':
        return 'Product deleted'
      case 'restored':
        return 'Product restored'
      default:
        return 'Product updated'
    }
  }

  if (loading) return <p className="p-6 text-sm text-gray-500">Loading product…</p>

  if (error || !product) {
    return (
      <section className="p-6">
        <Link href="/dashboard/inventory" className="text-sm text-blue-600 hover:underline">
          ← Back to inventory
        </Link>
        <p className="mt-4 text-sm text-red-600">{error ?? 'Product not found.'}</p>
      </section>
    )
  }

  const price = product.product_prices?.[0]
  const stock = product.product_stock?.[0]
  const selling = price?.selling_price ?? null
  const cost = price?.cost_price ?? null
  const margin = selling !== null && cost !== null ? Number(selling) - Number(cost) : null

  const expiryDays = daysUntil(product.expires_at)
  const expiryNote =
    expiryDays === null
      ? null
      : expiryDays < 0
        ? { text: `Expired ${Math.abs(expiryDays)} day${Math.abs(expiryDays) === 1 ? '' : 's'} ago`, cls: 'bg-red-100 text-red-700' }
        : expiryDays <= 7
          ? { text: expiryDays === 0 ? 'Expires today' : `Expires in ${expiryDays} day${expiryDays === 1 ? '' : 's'}`, cls: 'bg-orange-100 text-orange-700' }
          : expiryDays <= 30
            ? { text: `Expires in ${expiryDays} days`, cls: 'bg-yellow-100 text-yellow-800' }
            : null

  // "Last updated" = the most recent edit (sales do not count as edits)
  const lastEdit = history?.events.find((e) => e.type !== 'sold') ?? null
  const events = history?.events ?? []

  return (
    <section className="w-full h-full max-h-screen p-2 md:p-6 bg-gray-50 my-3">
      <Link href="/dashboard/inventory" className="text-sm text-blue-600 hover:underline">
        ← Back to inventory
      </Link>

      {/* Header */}
      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900">{product.name}</h1>
        {product.deleted && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Deleted</span>
        )}
        {product.needs_review && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
            Needs review: some details are missing
          </span>
        )}
      </div>

      {/* History cards */}
      {historyError ? (
        <p className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{historyError}</p>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard
            label="Added on"
            value={formatDateTime(history?.stats.created_at ?? product.created_at)}
            sub={history?.stats.added_by_name ? `by ${history.stats.added_by_name}` : undefined}
          />
          <StatCard
            label="Last updated"
            value={lastEdit ? formatDateTime(lastEdit.at) : 'Never edited'}
            sub={lastEdit?.actor ? `by ${lastEdit.actor}` : undefined}
          />
          <StatCard
            label="Units sold"
            value={Number(history?.stats.units_sold ?? 0).toLocaleString()}
            sub={`${Number(history?.stats.sales_count ?? 0).toLocaleString()} sale${Number(history?.stats.sales_count ?? 0) === 1 ? '' : 's'}`}
          />
          <StatCard
            label="Last sold"
            value={history?.stats.last_sold_at ? formatDateTime(history.stats.last_sold_at) : 'Not sold yet'}
          />
        </div>
      )}

      {/* Product info */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Product details</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Info label="Category" value={product.category} />
          <Info label="Brand" value={product.brand} />
          <Info label="Barcode" value={product.barcode} />
          <Info
            label="Selling price"
            value={selling !== null ? `${currency} ${Number(selling).toLocaleString()}` : null}
          />
          <Info
            label="Cost price"
            value={cost !== null ? `${currency} ${Number(cost).toLocaleString()}` : null}
          />
          <Info
            label="Profit per unit"
            value={margin !== null ? `${currency} ${margin.toLocaleString()}` : null}
          />
          <Info
            label="In stock"
            value={stock?.quantity !== null && stock?.quantity !== undefined ? `${Number(stock.quantity).toLocaleString()} ${stock.unit_of_measure ?? ''}`.trim() : null}
          />
          <Info label="Stock status" value={stock?.status?.replace('_', ' ') ?? null} />
          <div>
            <p className="text-sm font-medium text-gray-500">Expiry date</p>
            <p className="text-sm font-medium text-gray-800">
              {product.expires_at ? formatDateOnly(product.expires_at) : '—'}
            </p>
            {expiryNote && (
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${expiryNote.cls}`}>
                {expiryNote.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold">History</h2>
        <p className="mb-4 text-xs text-gray-500">
          Edits are recorded from the day this feature was switched on. Sales are shown for the whole life of the product.
        </p>

        <ol className="relative border-l border-gray-200 pl-6">
          {events.map((e, i) => (
            <TimelineItem
              key={`${e.type}-${e.at}-${i}`}
              dot={DOT_COLORS[e.type] ?? 'bg-gray-400'}
              title={describe(e)}
              meta={`${formatDateTime(e.at)}${e.actor ? ` · ${e.actor}` : ''}`}
            />
          ))}

          {/* The product's creation is always the first event */}
          <TimelineItem
            dot={DOT_COLORS.created}
            title="Product added"
            meta={`${formatDateTime(history?.stats.created_at ?? product.created_at)}${history?.stats.added_by_name ? ` · ${history.stats.added_by_name}` : ''}`}
          />
        </ol>

        {events.length >= 100 && (
          <p className="mt-2 text-xs text-gray-400">Showing the latest 100 events.</p>
        )}
      </div>
    </section>
  )
}

/* ---------- small components ---------- */
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <p className="mt-2 text-base font-semibold text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800 capitalize">{value || '—'}</p>
    </div>
  )
}

function TimelineItem({ dot, title, meta }: { dot: string; title: string; meta: string }) {
  return (
    <li className="mb-5 last:mb-0">
      <span className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ${dot}`} />
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-xs text-gray-500">{meta}</p>
    </li>
  )
}
