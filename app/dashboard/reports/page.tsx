'use client'

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
import { useCompany } from "@/app/context/CompanyContext"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { formatNumber } from "@/app/utils/numberFormatter"
import { Loading } from "@/app/components/Loading"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
type Range =
    | 'this_month'
    | 'last_month'
    | 'this_year'
    | 'last_year'

export default function Reports() {
    const supabase = createClient()
    const { company, currency } = useCompany()
    const [salesTotal, setSalesTotal] = useState(0)
    const [expenseTotal, setExpenseTotal] = useState(0)
    const [netProfit, setNetProfit] = useState(0)
    const [profitTotal, setProfitTotal] = useState(0)

    const [chartData, setChartData] = useState<any[]>([])
    const [range, setRange] = useState<Range>('this_month')
    const [label, setLabel] = useState<string>('')

    const [currentSales, setCurrentSales] = useState(0)
    const [previousSale, setPreviousSale] = useState(0)
    const [currentExpenses, setCurrentExpenses] = useState(0)
    const [previousExpenses, setPreviousExpenses] = useState(0)

    const [stats, setStats] = useState({
        profit: 0,
        salesTotal: 0,
        expenseTotal: 0,
        inventory: { total_items: 0, out_of_stock: 0, categories: 0, low_stock: 0, total_value: 0 },
        employee_report: {
            active: 0,
            inactive: 0,
            recent_hires: 0,
            on_leave: 0,
            top_performers: 0,
            expiring_contracts: 0,
            probation: 0
        },
        hr_analytics: {
            attendance_rate: 0,
            turnover_rate: 0,
            avg_performance: 0,
            on_time_rate: 0,
            late_rate: 0,
            leave_approval_rate: 0,
            satisfaction_score: 0
        },
        tasks_report: {
            completed: 0,
            pending: 0,
            in_progress: 0,
            overdue: 0
        },
        payroll: {
            total_salary: 0,
            total_deductions: 0,
            net_pay: 0
        },
        leave_report: {
            pending: 0,
            approved: 0,
            rejected: 0
        },
        growth: {
            salary_increase_due: 0,
            promotion_due: 0,
            contract_renewal: 0,
            probation_end: 0,
            reviews_due: 0,
            awards_due: 0,
            training_needed: 0
        },
        discipline: {
            first_warning: 0,
            second_warning: 0,
            final_warning: 0,
            termination_risk: 0,
            active_cases: 0,
            pending_review: 0,
            unresolved: 0
        }

    })

    const [loading, setLoading] = useState(true)


    const getRangeDates = (range: Range) => {
        const now = new Date()
        let from = new Date()
        let to = new Date()
        let label = ""

        const getMonthName = (date: Date) =>
            date.toLocaleString('default', { month: 'long' })

        switch (range) {
            case 'this_month':
                from = new Date(now.getFullYear(), now.getMonth(), 1)
                to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                label = `${getMonthName(now)} ${now.getFullYear()}`
                break

            case 'last_month':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                from = lastMonth
                to = new Date(now.getFullYear(), now.getMonth(), 0)
                label = `${getMonthName(lastMonth)} ${lastMonth.getFullYear()}`
                break

            case 'this_year':
                from = new Date(now.getFullYear(), 0, 1)
                to = new Date(now.getFullYear(), 11, 31)
                label = `Full Year ${now.getFullYear()}`
                break

            case 'last_year':
                from = new Date(now.getFullYear() - 1, 0, 1)
                to = new Date(now.getFullYear() - 1, 11, 31)
                label = `Full Year ${now.getFullYear() - 1}`
                break
        }

        to.setHours(23, 59, 59, 999)

        return { from, to, label }
    }



    const fetchDashboardData = useCallback(async () => {
        if (!company?.id) return

        setLoading(true)

        try {
            const { from, to,label } = getRangeDates(range)

            const { data, error } = await supabase.rpc('get_reports_full', {
                p_company_id: company.id,
                p_from: from.toISOString(),
                p_to: to.toISOString()
            })
        setLabel(label)

            if (error) throw error
            console.log('Dashboard RPC data:', data)
            // ✅ CORE METRICS
            setSalesTotal(data.salesTotal || 0)
            setProfitTotal(data.profitTotal || 0)
            setExpenseTotal(data.expenseTotal || 0)
            setNetProfit(data.profitTotal)
            setCurrentSales(data.current_sales)
            setCurrentExpenses(data.current_expenses)
            setPreviousSale(data.previous_sales)
            setPreviousExpenses(data.previous_expenses)
            console.log("data", data)
            // ✅ STATS
            setStats(prev => ({
                ...prev,
                tasks: data.tasks || { completed: 0, pending: 0 },
                employees: data.employees || { active: 0, inactive: 0, admin: 0, users: 0 },
                inventory: data.inventory || {
                    total: 0,
                    outOfStock: 0,
                    categories: 0,
                    lowStock: 0,
                    value: 0
                },
                employee_report: data.employee_report || {},
                hr_analytics: data.hr_analytics || {},
                tasks_report: data.tasks_report || {},
                payroll: data.payroll || {},
                leave_report: data.leave_report || {},
                growth: data.growth || {},
                discipline: data.discipline || {},
                hr: data.hr
            }))


            // ✅ CHART
            setChartData(data.monthly || [])

        } catch (err) {
            console.error('Dashboard RPC error:', err)
        } finally {
            setLoading(false)
        }

    }, [range, company?.id])

    const total = salesTotal + expenseTotal || 1
    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    if (loading) return <div className="p-8 text-center"><Loading /></div>



    const exportToExcel = () => {
        const { label } = getRangeDates(range)
        setLabel(label)
        const reportData = [
            {
                Month: `${label}`,
                company: company?.name || "Company",
                TotalSales: salesTotal,
                TotalExpenses: expenseTotal,
                TotalProfit: netProfit,
                ActiveEmployees: stats.employee_report.active,
                InactiveEmployees: stats.employee_report.inactive,
                RecentHires: stats.employee_report.recent_hires,
                TopPerformancers: stats.employee_report.top_performers,
                TasksCompleted: stats.tasks_report.completed,
                pendingTasks: stats.tasks_report.pending,
                OverDueTasks: stats.tasks_report.overdue,
                TotalPayroll: stats.payroll.total_salary,
                TotalDeductions: stats.payroll.total_deductions,
                TotalPaid: stats.payroll.net_pay,
                LeavesApproved: stats.leave_report.approved,
                PendingLeaves: stats.leave_report.pending,
                RejectedLeavs: stats.leave_report.rejected,
            }
        ]

        const worksheet = XLSX.utils.json_to_sheet(reportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report")

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
        const fileData = new Blob([excelBuffer], { type: "application/octet-stream" })

        saveAs(fileData, `Report_${label}.xlsx`)
    }


const exportToPDF = () => {
    const { label } = getRangeDates(range);
    const doc = new jsPDF();

    // --- PDF Header ---
    doc.setFontSize(18);
    doc.text(`${company?.name || "Company"} - Business Report`, 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Reporting Period: ${label}`, 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 34);

    // --- Prepare Data into Sections ---
    // Instead of one long row, we create logical groups for readability
    const sections = [
        {
            title: "Financial Overview",
            data: [
                ["Total Sales", `$${salesTotal.toLocaleString()}`],
                ["Total Expenses", `$${expenseTotal.toLocaleString()}`],
                ["Net Profit", `$${netProfit.toLocaleString()}`],
            ]
        },
        {
            title: "Employee Statistics",
            data: [
                ["Active Employees", stats.employee_report.active],
                ["Inactive Employees", stats.employee_report.inactive],
                ["Recent Hires", stats.employee_report.recent_hires],
                ["Top Performers", stats.employee_report.top_performers],
            ]
        },
        {
            title: "Task Management",
            data: [
                ["Tasks Completed", stats.tasks_report.completed],
                ["Pending Tasks", stats.tasks_report.pending],
                ["Overdue Tasks", stats.tasks_report.overdue],
            ]
        },
        {
            title: "Payroll & Leave",
            data: [
                ["Total Payroll", `$${stats.payroll.total_salary.toLocaleString()}`],
                ["Total Paid (Net)", `$${stats.payroll.net_pay.toLocaleString()}`],
                ["Leaves Approved", stats.leave_report.approved],
                ["Leaves Pending", stats.leave_report.pending],
            ]
        }
    ];

    // --- Generate Tables ---
    let finalY = 40; // Starting vertical position

    sections.forEach((section) => {
        autoTable(doc, {
            startY: finalY + 10,
            head: [[section.title, "Details"]],
            body: section.data,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 }, // Professional Blue
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: { 0: { fontStyle: 'bold' } },
            margin: { left: 14, right: 14 }
        });
        // Use doc.lastAutoTable.finalY to get the updated Y position
        finalY = (doc as any).lastAutoTable?.finalY || finalY;
    });

    // --- Footer ---
            const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
    }

    doc.save(`Report_${label}.pdf`);
};
    const getTrend = (current: number, previous: number) => {
        if (!previous && !current) {
            return { percent: 0, trend: 'neutral' }
        }

        if (!previous) {
            return { percent: 0, trend: 'up' }
        }

        const change = ((current - previous) / previous) * 100

        if (change === 0) {
            return { percent: 0, trend: 'neutral' }
        }

        return {
            percent: Math.abs(change).toFixed(1),
            trend: change > 0 ? 'up' : 'down'
        }
    }

    const salesTrend = getTrend(currentSales, previousSale)
    const expenseTrend = getTrend(currentExpenses, previousExpenses)

    return (
        <div className="py-2  md:p-2 bg-gray-50 max-h-[95vh] overflow-auto space-y-6 text-gray-800 font-poppins ">
            <div className="flex md:justify-center my-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 items-center">
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value as any)}
                        className="w-full p-2 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        name="reportType"
                        id="reportSelect"
                        aria-label="Select report period"
                    >

                        <option value="this_month">This Month</option>
                        <option value="last_month">Last Month</option>
                        <option value="this_year">This Year</option>
                        <option value="last_year">Last Year</option>


                    </select>


                    <button
                        onClick={exportToExcel}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 cursor-pointer"
                        type="button"
                    >
                        Export Excel
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500  md:w-40 cursor-pointer"

                        onClick={exportToPDF}>Export PDF</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1.8fr_1.2fr] gap-2 w-full">
                <MetricCard
                    onClick={(value: Range) => setRange(value)}
                    option
                    show
                    range={range}
                    title="Profit & Loss" subtitle={`NET FOR ${label}`} value={`${currency} ${(netProfit.toLocaleString())}`}>
                    <div className="mt-4 space-y-6">

                        <ProgressBar
                            label="Sales" value={`${salesTotal}`} total={total} color="bg-blue-600" currency={currency} />
                        <ProgressBar label="Expense" value={`${expenseTotal}`} total={total} color="bg-green-400" currency={currency} />
                    </div>
                </MetricCard>

                <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-4 flex-1">
                    <h2 className="text-lg font-semibold text-gray-800">Sales & Expenses</h2>

                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-center gap-2">
                        {/* Sales Section */}
                        <div className="flex flex-col gap-4 md:gap-8 flex-1">
                            <div className="max-sm:flex max-sm:items-center max-sm:justify-between gap-2">
                             <h3 className="text-lg font-medium text-gray-500">Sales</h3>
                            <p className="text-md font-bold text-gray-900">{currency} {salesTotal}</p>
                            </div>
                           
                            <div>
                                <p
                                    className={`text-sm flex items-center gap-1 ${salesTrend.trend === 'up'
                                        ? 'text-green-600'
                                        : salesTrend.trend === 'down'
                                            ? 'text-red-600'
                                            : 'text-gray-500'
                                        }`}
                                >
                                    <span>
                                        {salesTrend.trend === 'up'
                                            ? '↑'
                                            : salesTrend.trend === 'down'
                                                ? '↓'
                                                : '→'}
                                    </span>

                                    {salesTrend.trend === 'neutral'
                                        ? 'No change'
                                        : `${salesTrend.percent}% vs last month`}
                                </p>
                            </div>

                        </div>

                        {/* Expenses Section */}
                        <div className="flex flex-col gap-4 md:gap-8 flex-1">
                            <div className="max-sm:flex max-sm:items-center max-sm:justify-between gap-2">
                            
                                <h3 className="text-sm font-medium text-gray-500">Expenses</h3>

                                <p className="text-md font-bold text-gray-900">{currency} {expenseTotal}</p>
                            </div>

                            <div>
                                <p
                                    className={`text-sm flex items-center gap-1 ${expenseTrend.trend === 'up'
                                        ? 'text-green-600'
                                        : expenseTrend.trend === 'down'
                                            ? 'text-red-600'
                                            : 'text-gray-500'
                                        }`}
                                >
                                    <span>
                                        {expenseTrend.trend === 'up'
                                            ? '↑'
                                            : expenseTrend.trend === 'down'
                                                ? '↓'
                                                : '→'}
                                    </span>

                                    {expenseTrend.trend === 'neutral'
                                        ? 'No change'
                                        : `${expenseTrend.percent}% vs last month`}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>


                <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm ">
                    <div className="flex justify-between mb-6">
                        <h3 className="font-bold text-lg text-gray-700">Inventory</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-y-2 gap-x-12">
                        <StatLine
                            col
                            label="Total Items" value={`${stats.inventory.total_items} items`} />
                        <StatLine col label="Out of Stock" value={`${stats.inventory.out_of_stock} items`} />
                        <StatLine col label="Low Stock Items" value={`${stats.inventory.low_stock} items`} />
                        <StatLine
                            none
                            col label="Total Value" value={`${currency} ${stats.inventory.total_value.toLocaleString()}`} />
                    </div>
                </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">


                <SummaryCard
                    title='Employees'
                    label1="Active Employee" value1={stats.employee_report.active}
                    label2="In Active Employee" value2={stats.employee_report.inactive}
                    label3="Recent Hires " value3={stats.employee_report.recent_hires}
                    label4="Propogation Employee" value4={stats.employee_report.probation}
                    label5="Contract Expiring soon" value5={stats.employee_report.expiring_contracts}
                    label6="OnLeave" value6={stats.employee_report.on_leave}
                    label7="Top Performance" value7={stats.employee_report.top_performers}


                />
                <SummaryCard
                    title='HR ANALYTICS'
                    label1="Attendance Rate" value1={`${stats.hr_analytics.attendance_rate}%`}
                    label2="Employee TurnOver" value2={`${stats.hr_analytics.turnover_rate}%`}
                    label3="AVG Performance Score " value3={`${stats.hr_analytics.avg_performance}%`}
                    label4="On Time Arrival Rate " value4={`${stats.hr_analytics.on_time_rate}%`}
                    label5="Late Submission Rate " value5={`${stats.hr_analytics.late_rate} %`}
                    label6="Leave Approval Rate" value6={`${stats.hr_analytics.leave_approval_rate} %`}
                    label7="Employee Satisfication Score " value7={`${stats.hr_analytics.satisfaction_score}%`}


                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 my-10">
                <SummaryCard
                    title='Tasks'
                    label1="Completed Tasks" value1={stats.tasks_report.completed}
                    label2=" OverDue Tasks Tasks" value2={stats.tasks_report.overdue}
                    label3="Task in progress" value3={stats.tasks_report.in_progress}
                    label4="Unassigned Tasks " value4={stats.tasks_report.pending}


                /><SummaryCard
                    title='Payroll'
                    label1="Total Payoll Cost " value1={stats.payroll.total_salary}
                    label2="Total Deduction" value2={stats.payroll.total_deductions}
                    label3="Totla Paid Cost " value3={stats.payroll.net_pay}



                /><SummaryCard
                    title='Leave Requests'
                    label1="Pending Approvals" value1={stats.leave_report.pending}
                    label2="Approved Leaves" value2={stats.leave_report.approved}
                    label3="Rejected Leaves" value3={stats.leave_report.rejected}



                />
            </div>

            {/* chart here */}

            <div className="space-y-10">
                <SummaryCard
                    title='Employee Growth'
                    label1="Salary Increase due" value1="3"
                    label2="Promotion Eligibility" value2="1"
                    label3="Contract Renewal " value3="9"
                    label4="Probation Ending Soon " value4="9"
                    label5="Performance Review Scheduled " value5="4"
                    label6="Recognition / Awards Due" value6="1"
                    label7="Training / Development Needed " value7="9"


                /><SummaryCard
                    title='Disciplinary Overview'
                    label1="First Warning" value1={stats.discipline.final_warning}
                    label2="Second Warning" value2={stats.discipline.second_warning}
                    label3="Final Warning " value3={stats.discipline.final_warning}
                    label4="At Risk of Termination " value4={stats.discipline.termination_risk}
                    label5="Active Disciplinary Cases " value5={stats.discipline.active_cases}
                    label6="Pending Disciplinary Review" value6={stats.discipline.pending_review}
                    label7="Unresolved Disciplinary Issues " value7={stats.discipline.unresolved}


                />
            </div>
        </div>
    )
}

/* --- REUSABLE COMPONENTs --- */

function MetricCard({ title, subtitle, value, children, onClick, range, option, show }: any) {
    const [showValue, setShowValue] = useState<boolean>(true)
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between md:items-start">
                <div>
                    <h3 className="font-bold text-gray-600">{title}</h3>
                    {subtitle && <p className="text-[9px] text-blue-500 font-extrabold tracking-widest mt-1 uppercase">{subtitle}</p>}
                </div>


            </div>
            {
                show ? (
                    <div className="flex items-center justify-between">

                        {showValue ? (
                            <p className="text-md font-black mt-3 text-gray-800">{value}</p>
                        ) : (
                            <p className="text-md font-black mt-3 text-gray-800">...</p>
                        )}
                        <span>
                            {showValue ? (
                                <FaEye onClick={() => setShowValue(false)} className="text-gray-400 cursor-pointer" size={14} />
                            ) : (
                                <FaEyeSlash onClick={() => setShowValue(true)} className="text-gray-400 cursor-pointer" size={14} />
                            )}
                        </span>
                    </div>
                ) : (
                    <p className="text-3xl font-black mt-3 text-gray-800">{value}</p>

                )
            }


            {children}
        </div>
    )
}

function StatLine({ label, value, subValue, col, none }: any) {
    return (
        <div
            className={`
                flex justify-between md:items-end border-b border-gray-50 pb-2
                ${col ? 'flex-col gap-2 md:flex-row' : ''}
                ${none ? 'md:hidden' : ''}
            `}
        >
            <span className="text-sm text-gray-400 font-medium">
                {label}:
            </span>

            <div className="md:text-right">
                <span className="text-sm font-bold text-gray-700">
                    {value}
                </span>

                {subValue && (
                    <p className="text-[10px] text-red-400 font-bold mt-0.5">
                        {subValue}
                    </p>
                )}
            </div>
        </div>
    )
}

function ProgressBar({ label, value, total, color, currency, show }: { label: string, value: any, total: number, color: string, currency?: any, show?: boolean }) {
    const [showValue, setShowValue] = useState<boolean>(true)
    const width = total > 0 ? (value / total) * 100 : 0
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-black text-gray-500">
                <span>{label.toUpperCase()}</span>
                {
                    showValue ? (
                        <span>
                            {currency ? `${currency} ${formatNumber(value)}` : `${formatNumber(value)}`}
                        </span>
                    ) : (
                        <span>...</span>
                    )
                }
                {
                    showValue ? (
                        <FaEye onClick={() => setShowValue(false)} className="text-gray-400 cursor-pointer" size={12} />
                    ) : (
                        <FaEyeSlash onClick={() => setShowValue(true)} className="text-gray-400 cursor-pointer" size={12} />
                    )
                }
            </div>
            <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden shadow-inner">
                <div className={`${color} h-full transition-all duration-500`} style={{ width: `${width}%` }}></div>
            </div>
        </div>
    )
}

function StatusCircle({ percentage, color }: any) {
    return (
        <div className="w-20 h-20">
            <svg className="w-full h-full" viewBox="0 0 36 36">
                <path className="text-green-600" strokeDasharray="100, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={color} strokeDasharray={`${percentage}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155   15.9155 0 0 1 0 -31.831" />
            </svg>

        </div>
    )
}


function SummaryCard({ label1, label2, label3, label4, label5, label6, label7, value1, value2, value3, value4, value7, value5, value6, title, onclick1, onclick2, onclick3, onclick4 }: any) {
    return (
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
            <p className="text-lg font-medium text-gray-900 pb-2 border-b mb-3">{title}</p>
            {[
                { l: label1, v: value1, onclick: onclick1 },
                { l: label2, v: value2, onclick: onclick2 },
                { l: label3, v: value3, onclick: onclick3 },
                { l: label4, v: value4, onclick: onclick4 },
                { l: label5, v: value5, onclick: onclick4 },
                { l: label6, v: value6, onclick: onclick4 },
                { l: label7, v: value7, onclick: onclick4 }
            ].map((item, i) => item.l && (

                <div key={i} className='flex items-center justify-between p-2 shadow-sm cursor-pointer rounded-md hover:bg-gray-50' onClick={item.onclick}>
                    <p className="text-sm text-gray-600">{item.l}</p>
                    <p className="text-sm font-semibold">{item.v}</p>
                </div>
            ))}
        </div>
    )
}