'use client'

import { useState } from "react"

type InvoiceItem = {
    item_name: string
    quantity: number
    unit_price: number
    amount: number
}

type Payment = {
     id: string
    bank_name: string
    account_name: string
    account_number: number
    payment_status: string
} | null

type Company = {
    name: string
    location: string
} | null

// More flexible Invoice type
type Invoice = {
    id?: string
    invoice_number: string
    created_at: string
    bill_to: string
    ship_to: string
    total: number
    tax_rate?: number
    tax_amount?: number
    subtotal?: number
    invoice_items?: InvoiceItem[]
    invoice_payments?: Payment[]
}

type CompanyProfile = {
    email: string
    phone: string
    company_id: string
} | null

export function PaySlipModal({
    open,
    onClose,
    payroll,
    company,
}: {
    open: boolean
    onClose: () => void
    payroll: any
    company: Company
}) {
    if (!open || !payroll) return null

    // // Handle undefined arrays
    // const invoiceItems = invoice.invoice_items || []
    // const invoicePayments = invoice.invoice_payments || []

    // const subtotal =
    //     invoice.subtotal ??
    //     invoiceItems.reduce(
    //         (sum, i) => sum + i.quantity * i.unit_price,
    //         0
    //     )

    const [isExporting, setIsExporting] = useState(false)

    // const handleDownloadPDF = async () => {
    //     const element = document.getElementById('invoice-pdf-content')
    //     if (!element) return

    //     setIsExporting(true)

    //     // Add CSS override to fix lab() colors
    //     const style = document.createElement('style')
    //     style.textContent = `
    //         .pdf-export * {
    //             color: #000000 !important;
    //             background-color: transparent !important;
    //             border-color: #000000 !important;
    //         }
    //         .pdf-export .bg-blue-600 {
    //             background-color: #2563eb !important;
    //         }
    //         .pdf-export .bg-blue-200 {
    //             background-color: #bfdbfe !important;
    //         }
    //         .pdf-export .text-blue-600 {
    //             color: #2563eb !important;
    //         }
    //         .pdf-export .text-white {
    //             color: #ffffff !important;
    //         }
    //         .pdf-export .text-gray-600 {
    //             color: #4b5563 !important;
    //         }
    //         .pdf-export .bg-white {
    //             background-color: #ffffff !important;
    //         }
    //         /* Hide buttons in PDF */
    //         .pdf-export .pdf-exclude {
    //             display: none !important;
    //         }
    //     `
    //     document.head.appendChild(style)

    //     // Add PDF export class
    //     element.classList.add('pdf-export')

    //     try {
    //         // Dynamically import to avoid SSR issues
    //         const html2pdf = (await import('html2pdf.js')).default

    //         await html2pdf()
    //             .set({
    //                 margin: 10,
    //                 filename: `invoice-${invoice.invoice_number}.pdf`,
    //                 image: { type: 'jpeg', quality: 0.98 },
    //                 html2canvas: {
    //                     scale: 2,
    //                     useCORS: true,
    //                     backgroundColor: '#ffffff',
    //                     logging: false,
    //                     ignoreElements: (element: any) => {
    //                         // Ignore all elements with pdf-exclude class
    //                         return element.classList?.contains('pdf-exclude')
    //                     }
    //                 },
    //                 jsPDF: {
    //                     unit: 'mm',
    //                     format: 'a4',
    //                     orientation: 'portrait',
    //                 },
    //             })
    //             .from(element)
    //             .save()
    //     } catch (error) {
    //         console.error('PDF export failed:', error)
    //         alert('Failed to generate PDF. Please try again.')
    //     } finally {
    //         // Cleanup
    //         element.classList.remove('pdf-export')
    //         document.head.removeChild(style)
    //         setIsExporting(false)
    //     }
    // }

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-xl bg-white max-sm:p-4 p-10 mt-50 max-h-(80vh) text-black">
                {/* Add CSS to ensure colors are safe */}
                <style jsx>{`
                    @media print {
                        .no-print {
                            display: none !important;
                        }
                    }
                    .bg-blue-600 {
                        background-color: rgb(37, 99, 235) !important;
                    }
                    .bg-blue-200 {
                        background-color: rgb(191, 219, 254) !important;
                    }
                    .text-blue-600 {
                        color: rgb(37, 99, 235) !important;
                    }
                    .text-gray-600 {
                        color: rgb(75, 85, 99) !important;
                    }
                    #invoice-pdf-content {
                        padding-top: 0;
                        margin-top: 0;
                    }
                `}</style>

                {/* PDF content container - this is what gets exported */}
                <div
                    id="invoice-pdf-content"
                    className="invoice-root mb-10">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-2 border-b">
                        <div>
                            <h1 className="text-blue-600 font-semibold text-lg" style={{ color: '#2563eb' }}>{'Sude Tech'}</h1>
                            
                        </div>

                        <div className="text-right">
                            <h2 className="text-md font-bold">Pay Slip for the month</h2>
                            <p className="text-xl font-bold " style={{ color: '#4b5563' }}>
                                January 2026
                            </p>
                            
                        </div>
                    </div>

                    {/* employee info */}
                    <div>
                        <h1>Employee Summary</h1>
                
                    
                    <div className="flex flex-col gap-2 mb-6">
                       <EmployeeInfo label="Employee Name" value={payroll.employee.name}/>
                       <EmployeeInfo label="Designation" value={payroll.employee.department}/>
                       <EmployeeInfo label="Employee Id" value={payroll.employee.employee_id_slug}/>
                       <EmployeeInfo label="Pay Period" value={payroll.pay_period}/>
                       <EmployeeInfo label="Bank Name" value={payroll.employee.salary.bank_name}/>
                       <EmployeeInfo label="Bank Account" value={payroll.employee.salary.account_number}/>
                    </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-sm border mb-8">
                        <thead>
                            <tr className="bg-blue-200 text-left" style={{ backgroundColor: '#bfdbfe' }}>
                                <th className="text-xs p-2">Earnings</th>
                                <th className="text-sm p-2 text-center">Amount</th>
                                <th className="text-sm p-2 text-right">Deductions</th>
                                <th className="text-sm p-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* {invoice?.invoice_items?.map((item, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="p-2">{item.item_name}</td>
                                    <td className="p-2 text-center">{item.quantity}</td>
                                    <td className="p-2 text-right">
                                        {item.unit_price}
                                    </td>
                                    <td className="p-2 text-right">
                                        {item.amount}
                                    </td>
                                </tr>
                            ))} */}
                            <tr>
                                <td>Base slary</td>
                                <td>Base slary</td>
                                <td>Base slary</td>
                                <td>Base slary</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-between items-end max-sm:w-full">
                       

                        <div className="text-sm w-44">
                            
                        </div>
                    </div>
                </div>

                {/* Actions - Separate container that won't be in PDF */}
                <div className="flex gap-4 md:justify-between pdf-exclude no-print">
                    <button
                        onClick={onClose}
                        className="rounded-lg border px-2 md:px-10 py-2 text-sm"
                    >
                        Cancel
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="rounded-lg border px-2 md:px-6 py-2 text-sm"
                        >
                            Print
                        </button>

                        <button
                            // onClick={handleDownloadPDF}
                            disabled={isExporting}
                            className="rounded-lg bg-blue-600 px-10 py-2 text-sm text-white cursor-pointer"
                            style={{ backgroundColor: '#2563eb' }}
                        >
                            {isExporting ? 'Generating PDF...' : 'Download PDF'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

function EmployeeInfo ({label, value}:{label:string, value:string}){
return (
    <div className="flex gap-10">
        <h1>{label}:</h1>
        <h1>{value}</h1>
    </div>
)
}