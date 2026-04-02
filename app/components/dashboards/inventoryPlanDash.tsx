'use client'

import { createClient } from "@/app/utils/supabase/client"
import { useCallback, useEffect, useState } from "react"
import RevenueSummaryChart from "../RevenueSummary"
import { ClipLoader } from "react-spinners"
import { Line, LineChart, ResponsiveContainer } from "recharts"

type Range =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year'

export default function InventoryPlanDash() {

  const supabase = createClient()

  const [salesTotal, setSalesTotal] = useState(0)
  const [expenseTotal, setExpenseTotal] = useState(0)
  const [netProfit, setNetProfit] = useState(0)
  const [profitTotal, setProfitTotal] = useState(0)
  const [chartData, setChartData] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState(0)
  const [recentlyUpdated, setRecentlyUpdated] = useState(0)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<Range>('this_month')

  /* ---------------- DATE RANGE LOGIC ---------------- */

  const getRangeDates = (range: Range) => {

    const now = new Date()
    let from = new Date()
    let to = new Date()

    switch (range) {
      case 'today':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        to.setHours(23, 59, 59, 999)
        break
      case 'yesterday':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        to.setHours(23, 59, 59, 999)
        break
      case 'this_week':
        const dayOfWeek = now.getDay() || 7
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1)
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - dayOfWeek))
        to.setHours(23, 59, 59, 999)
        break
      case 'last_week':
        const lastWeekDayOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getDay() || 7
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7 - lastWeekDayOfWeek + 1)
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7 + (7 - lastWeekDayOfWeek))
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

  const fetchDashboardData = useCallback(async () => {

    setLoading(true)

    const { from, to } = getRangeDates(range)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!profile?.company_id) {
      setLoading(false)
      return
    }

    const companyId = profile.company_id

    /* SALES */

    const { data: sales } = await supabase
      .from('sales')
      .select('total_amount, created_at, sale_items (quantity, selling_price, cost_price, discount, subtotal, status)')
      .eq('company_id', companyId)
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())

     let salesTotal = 0
    let profitTotal = 0

    sales?.forEach((sale) => {
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
    


    setSalesTotal(salesTotal)
    setProfitTotal(profitTotal)

    /* EXPENSES */

    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, created_at')
      .eq('company_id', companyId)
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())

    const totalExpenses =
      expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0

    setExpenseTotal(totalExpenses)

    /* PROFIT */

    setNetProfit(profitTotal - totalExpenses)

    /* INVENTORY */

    const { data: productsData } = await supabase
      .from('products')
      .select(`
        id,
        category,
        product_stock (
          quantity,
          status
        ),
        product_prices (
          selling_price
        )
      `)
      .eq('company_id', companyId)

    if (productsData) {

      setProducts(productsData)

      const uniqueCategories = new Set(
        productsData.map((p) => p.category)
      )

      setCategories(uniqueCategories.size)
    }

    /* REVENUE CHART */

    const months = [
      'Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec'
    ]

    const monthly = months.map((m) => ({
      month: m,
      sales: 0,
      expenses: 0
    }))

    sales?.forEach((s) => {
      const month = new Date(s.created_at).getMonth()
      monthly[month].sales += Number(s.total_amount || 0)
    })

    expenses?.forEach((e) => {
      const month = new Date(e.created_at).getMonth()
      monthly[month].expenses += Number(e.amount || 0)
    })

    setChartData(monthly)

    setLoading(false)

  }, [supabase, range])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  /* INVENTORY CALCULATIONS */

  const totalItems = products.length

  const lowStockCount = products.filter(p =>
    p.product_stock?.[0]?.status === 'low_stock'
  ).length

  const outOfStockCount = products.filter(p =>
    p.product_stock?.[0]?.status === 'out_of_stock'
  ).length

  const stockValue = products.reduce((sum, p) => {

    const quantity = p.product_stock?.[0]?.quantity || 0
    const price = p.product_prices?.[0]?.selling_price || 0

    return sum + quantity * price

  }, 0)

  const total = salesTotal + expenseTotal || 1

  const salesPercent = (salesTotal / total) * 100
  const expensePercent = (expenseTotal / total) * 100

  const isUp = netProfit >= 0

 const currentMonth = new Date().getMonth()

const previousMonthIndex =
  currentMonth === 0 ? 11 : currentMonth - 1

const previousMonthProfit =
  (chartData[previousMonthIndex]?.sales || 0) -
  (chartData[previousMonthIndex]?.expenses || 0)

const profitTrend = netProfit - previousMonthProfit

  return (

    <div className="p-6 rounded-lg font-poppins bg-gray-50 max-h-[90vh] overflow-y-auto no-scrollbar">

      <div className="flex flex-col gap-6">

        {/* FILTER */}

        <div className="flex items-center gap-2 justify-end">
          <h1 className="text-md font-semibold">Filter By Time</h1>

          <select
            className="p-2 rounded-md border"
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
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

        {/* TOP CARDS */}

        <div className="flex flex-col md:flex-row gap-5 w-full">

          {/* PROFIT CARD */}

          <div className="flex flex-col gap-5 rounded-xl border border-gray-100 shadow-sm md:w-[45%] p-5 bg-white">

            <h1 className="text-md font-semibold">Profit & Loss</h1>

            <div>
              <p className={`text-4xl font-bold tracking-tight ${isUp ? "text-green-600" : "text-red-600"}`}>
                N{netProfit.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Net Profit for {range.replace('_', ' ')}
              </p>
            </div>

            <div className="flex flex-col gap-4">

              {/* SALES */}

              <div className="flex justify-between items-center gap-3">

                <div className="w-full h-[15px] bg-gray-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${salesPercent}%` }}
                  />

                </div>

                <div className="flex flex-col text-right min-w-[90px]">
                  <span className="text-sm text-gray-500">Sales</span>
                  <span className="text-sm font-semibold">
                    N{salesTotal.toLocaleString()}
                  </span>
                </div>

              </div>

              {/* EXPENSES */}

              <div className="flex justify-between items-center gap-3">

                <div className="w-full h-[15px] bg-gray-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${expensePercent}%` }}
                  />

                </div>

                <div className="flex flex-col text-right min-w-[90px]">
                  <span className="text-sm text-gray-500">Expenses</span>
                  <span className="text-sm font-semibold">
                    N{expenseTotal.toLocaleString()}
                  </span>
                </div>

              </div>

              {/* TREND */}

              <div className="pt-3 border-t border-gray-100">

                <div className="flex items-center gap-1 text-sm">

                  <span className={`font-semibold ${profitTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitTrend >= 0 ? "▲" : "▼"} {Math.abs(profitTrend).toLocaleString()}
                  </span>

                  <span className="text-gray-500">
                    from Prev {range.includes('month') ? 'Month' : 'Year'}
                  </span>

                </div>

                <div className="h-[40px] w-full">

                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { name: 'Last Month', profit: previousMonthProfit },
                        { name: 'This Month', profit: netProfit }
                      ]}
                    >
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke={profitTrend >= 0 ? '#16a34a' : '#dc2626'}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                </div>

              </div>

            </div>

          </div>

          {/* INVENTORY CARD */}

          <div className="flex flex-1 flex-col gap-4 rounded-lg shadow-md p-4 bg-white">

            <h1 className="text-md font-bold text-gray-900 ">Inventory Overview</h1>

            <div className="grid gap-3">

              <div className="flex gap-2">
                <p className="font-semibold">Total Products:</p>
                <span>{totalItems} {' '} Items</span>
              </div>

              <div className="flex gap-2">
                <p className="font-semibold">Low Stock:</p>
                <span>{lowStockCount} {' '} Items</span>
              </div>

              <div className="flex gap-2">
                <p className="font-semibold">Out of Stock:</p>
                <span>{outOfStockCount} {' '} Items</span>
              </div>

              <div className="flex gap-2">
                <p className="font-semibold">Stock Value:</p>
                <span>N{stockValue.toLocaleString()}</span>
              </div>

              <div className="flex gap-2">
                <p className="font-semibold">Categories:</p>
                <span>{categories} {' '} Categories</span>
              </div>

              <div className="flex gap-2">
                <p className="font-semibold">Recently Updated:</p>
                <span>{recentlyUpdated} {' '} Items</span>
              </div>

            </div>

          </div>

        </div>

        {/* REVENUE SUMMARY */}

        <div className="flex flex-col gap-4 rounded-lg shadow-md p-4 bg-white">

          <h1 className="text-lg font-semibold">Revenue Summary</h1>

          {loading ? (
            <div className="flex justify-center p-10">
              <ClipLoader size={30} />
            </div>
          ) : (
            <RevenueSummaryChart data={chartData} />
          )}

        </div>

      </div>

    </div>
  )
}