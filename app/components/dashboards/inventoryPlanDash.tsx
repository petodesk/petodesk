'use client'

import { createClient } from "@/app/utils/supabase/client"
import { useCallback, useEffect, useState } from "react"

export default function InventoryPlanDash() {

    const supabase = createClient()

    const [salesTotal, setSalesTotal] = useState(0)
    const [expenseTotal, setExpenseTotal] = useState(0)
    const [netProfit, setNetProfit] = useState(0)

    const [totalProducts, setTotalProducts] = useState(0)
    const [lowStock, setLowStock] = useState(0)
    const [outOfStock, setOutOfStock] = useState(0)
    const [stockValue, setStockValue] = useState(0)
    const [categories, setCategories] = useState(0)
    const [recentlyUpdated, setRecentlyUpdated] = useState(0)
const[loading, setLoading] = useState(true)
    const fetchDashboardData = useCallback(async () => {

        setLoading(true)

        /* ---------------- GET USER ---------------- */

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            setLoading(false)
            return
        }

        /* ---------------- GET COMPANY ---------------- */

        const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single()

        const companyId = profile?.company_id

        if (!companyId) {
            setLoading(false)
            return
        }

        /* ---------------- SALES ---------------- */

        const { data: sales, error: salesError } = await supabase
            .from('sales')
            .select('total_amount')
            .eq('company_id', companyId)

        if (salesError) console.error(salesError)

        const totalSales =
            sales?.reduce((sum, s) => sum + Number(s.total_amount || 0), 0) || 0

        setSalesTotal(totalSales)

        /* ---------------- EXPENSES ---------------- */

        const { data: expenses, error: expenseError } = await supabase
            .from('expenses')
            .select('amount')
            .eq('company_id', companyId)

        if (expenseError) console.error(expenseError)

        const totalExpenses =
            expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0

        setExpenseTotal(totalExpenses)

        /* ---------------- PROFIT ---------------- */

        setNetProfit(totalSales - totalExpenses)

        /* ---------------- INVENTORY ---------------- */

        const { data: inventory, error: inventoryError } = await supabase
            .from('products')
            .select('*, product_stock(*)')
            .eq('company_id', companyId)

        if (inventoryError) console.error(inventoryError)

        if (inventory) {

            setTotalProducts(inventory.length)

            const lowStockItems = inventory.filter(
                (i) => i.product_stock.quantity > 0 && i.product_stock.quantity <= 5
            )

            setLowStock(lowStockItems.length)

            const outStockItems = inventory.filter(
                (i) => i.product_stock.quantity === 0
            )

            setOutOfStock(outStockItems.length)

            const value = inventory.reduce(
                (sum, i) =>
                    sum + (Number(i.product_stock.quantity || 0) * Number(i.cost_price || 0)),
                0
            )

            setStockValue(value)

            const uniqueCategories = new Set(
                inventory.map((i) => i.category)
            )

            setCategories(uniqueCategories.size)

            const recent = inventory.filter((i) => {
                const updated = new Date(i.updated_at)
                const now = new Date()

                const diff =
                    (now.getTime() - updated.getTime()) /
                    (1000 * 3600 * 24)

                return diff <= 7
            })

            setRecentlyUpdated(recent.length)
        }

        setLoading(false)

    }, [supabase])



    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])






    return (
        <div className="p-6 bg-green-50 rounded-lg border-2 border-green-200">

            {/* profit and loss card */}
            <div className="flex flex-col gap-2">

                <div className="flex flex-col gap-4 rounded-lg shadow-md w-[100%] md:w-[45%] p-4 bg-white">

                    <div className="flex justify-between">
                        <h1>Profit and Loss</h1>

                        <select>
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>Custom Range</option>
                            <option>Last Year</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-3">
                        <p className="text-2xl font-bold text-green-600">
                            ${netProfit.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">Net Profit</p>
                    </div>

                    <div className="flex flex-col gap-2">

                        <div className="flex justify-between gap-4 items-center">
                            <div className="bg-blue-500 h-8 rounded-lg p-1 flex-1"></div>

                            <div className="flex flex-col gap-1 items-center p-1">
                                <span className="text-md font-semibold">
                                    ${salesTotal.toLocaleString()}
                                </span>
                                <span>Sale</span>
                            </div>
                        </div>

                        <div className="flex justify-between gap-4 items-center">
                            <div className="bg-gray-500 h-8 rounded-lg p-1 flex-1"></div>

                            <div className="flex flex-col gap-1 items-center p-1">
                                <span className="text-md font-semibold">
                                    ${expenseTotal.toLocaleString()}
                                </span>
                                <span>Expenses</span>
                            </div>
                        </div>

                    </div>
                </div>


                {/* Inventory Overview */}

                <div className="flex flex-col gap-4 rounded-lg shadow-md p-4 bg-white">

                    <div className="flex gap-10">
                        <h1>Inventory Overview</h1>

                        <select>
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>Custom Range</option>
                            <option>Last Year</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3">

                        <div className="flex gap-2">
                            <p className="text-md font-semibold">Total Products:</p>
                            <p className="text-sm text-gray-500">{totalProducts} Items</p>
                        </div>

                        <div className="flex gap-2">
                            <p className="text-md font-semibold">Low Stock</p>
                            <p className="text-sm text-gray-500">{lowStock} Items</p>
                        </div>

                        <div className="flex gap-2">
                            <p className="text-md font-semibold">Out of Stock</p>
                            <p className="text-sm text-gray-500">{outOfStock} Items</p>
                        </div>

                        <div className="flex gap-2">
                            <p className="text-md font-semibold">Stock Value</p>
                            <p className="text-sm text-gray-500">${stockValue.toLocaleString()}</p>
                        </div>

                        <div className="flex gap-2">
                            <p className="text-md font-semibold">Categories</p>
                            <p className="text-sm text-gray-500">{categories}</p>
                        </div>

                        <div className="flex gap-2">
                            <p className="text-md font-semibold">Recently Updated</p>
                            <p className="text-sm text-gray-500">{recentlyUpdated}</p>
                        </div>

                    </div>
                </div>


                {/* revenue card */}

                <div>
                    <div className="flex justify-between">
                        <h1>Revenue Summary</h1>

                        <select>
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                </div>

            </div>

        </div>
    )
}