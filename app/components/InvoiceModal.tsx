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

export function ViewInvoiceModal({
    open,
    onClose,
    invoice,
    company,
    companyProfile
}: {
    open: boolean
    onClose: () => void
    invoice: Invoice | null
    company: Company
    companyProfile: CompanyProfile
}) {
    if (!open || !invoice) return null

    // Handle undefined arrays
    const invoiceItems = invoice.invoice_items || []
    const invoicePayments = invoice.invoice_payments || []

    const subtotal =
        invoice.subtotal ??
        invoiceItems.reduce(
            (sum, i) => sum + i.quantity * i.unit_price,
            0
        )

    const [isExporting, setIsExporting] = useState(false)

    const handleDownloadPDF = async () => {
        const element = document.getElementById('invoice-pdf-content')
        if (!element) return

        setIsExporting(true)

        // Add CSS override to fix lab() colors
        const style = document.createElement('style')
        style.textContent = `
            .pdf-export * {
                color: #000000 !important;
                background-color: transparent !important;
                border-color: #000000 !important;
            }
            .pdf-export .bg-blue-600 {
                background-color: #2563eb !important;
            }
            .pdf-export .bg-blue-200 {
                background-color: #bfdbfe !important;
            }
            .pdf-export .text-blue-600 {
                color: #2563eb !important;
            }
            .pdf-export .text-white {
                color: #ffffff !important;
            }
            .pdf-export .text-gray-600 {
                color: #4b5563 !important;
            }
            .pdf-export .bg-white {
                background-color: #ffffff !important;
            }
            /* Hide buttons in PDF */
            .pdf-export .pdf-exclude {
                display: none !important;
            }
        `
        document.head.appendChild(style)

        // Add PDF export class
        element.classList.add('pdf-export')

        try {
            // Dynamically import to avoid SSR issues
            const html2pdf = (await import('html2pdf.js')).default

            await html2pdf()
                .set({
                    margin: 10,
                    filename: `invoice-${invoice.invoice_number}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        backgroundColor: '#ffffff',
                        logging: false,
                        ignoreElements: (element: any) => {
                            // Ignore all elements with pdf-exclude class
                            return element.classList?.contains('pdf-exclude')
                        }
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait',
                    },
                })
                .from(element)
                .save()
        } catch (error) {
            console.error('PDF export failed:', error)
            alert('Failed to generate PDF. Please try again.')
        } finally {
            // Cleanup
            element.classList.remove('pdf-export')
            document.head.removeChild(style)
            setIsExporting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-xl bg-white p-10 mt-50 max-h-(80vh) text-black">
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
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h1 className="text-blue-600 font-semibold text-lg" style={{ color: '#2563eb' }}>{company?.name}</h1>
                            <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>{company?.location}</p>
                            <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>{companyProfile?.phone}</p>
                            <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>{companyProfile?.email}</p>
                        </div>

                        <div className="text-right">
                            <h2 className="text-2xl font-bold">INVOICE</h2>
                            <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                                #INV-{invoice.invoice_number}
                            </p>
                            <p className="text-sm mt-2">
                                Invoice Date:{' '}
                                {new Date(invoice.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Bill / Ship */}
                    <div className="grid grid-cols-2 gap-10 mb-8 justify-center">
                        <div className='border border-gray-300 pb-4'>
                            <p className="bg-blue-200 px-2 w-full py-1 text-sm font-medium" style={{ backgroundColor: '#bfdbfe' }}>
                                BILL TO
                            </p>
                            <p className="mt-2 px-2 text-sm capitalize">{invoice.bill_to}</p>
                        </div>

                        <div className='border border-gray-300 pb-4'>
                            <p className="bg-blue-200 w-full px-2 py-1 text-sm font-medium" style={{ backgroundColor: '#bfdbfe' }}>
                                SHIP TO
                            </p>
                            <p className="mt-2 px-2 text-sm capitalize">{invoice.ship_to}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-sm border mb-8">
                        <thead>
                            <tr className="bg-blue-200 text-left" style={{ backgroundColor: '#bfdbfe' }}>
                                <th className="p-2">Item Description</th>
                                <th className="p-2 text-center">Quantity</th>
                                <th className="p-2 text-right">Unit Price</th>
                                <th className="p-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice?.invoice_items?.map((item, idx) => (
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
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-between items-end">
                        <div className="text-sm">
                            <p className="mb-4 text-md font-semibold">Thanks for your business</p>
                            <p className="text-md font-semibold">Please make payment to the account below:</p>
                            <p className="mt-3 font-medium">{invoice.invoice_payments?.[0]?.bank_name}</p>
                            <p className="text-md text-gray-900">{invoice.invoice_payments?.[0]?.account_name}</p>
                            <p className="text-md text-gray-900">{invoice.invoice_payments?.[0]?.account_number}</p>
                        </div>

                        <div className="text-sm w-64">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-800 font-bold">SUBTOTAL</span>
                                <span className="text-md font-semibold">{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span>TAX ({invoice.tax_rate}%)</span>
                                <span className="text-md font-semibold">{invoice.tax_amount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>TOTAL</span>
                                <span className="text-md font-semibold">{invoice.total.toLocaleString()}</span>
                            </div>
                            <p className="text-right mt-4 font-bold">NGN</p>
                            <p className="text-right font-bold text-xl">
                                {invoice.total.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions - Separate container that won't be in PDF */}
                <div className="flex justify-between pdf-exclude no-print">
                    <button
                        onClick={onClose}
                        className="rounded-lg border px-10 py-2 text-sm"
                    >
                        Cancel
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="rounded-lg border px-6 py-2 text-sm"
                        >
                            Print
                        </button>

                        <button
                            onClick={handleDownloadPDF}
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