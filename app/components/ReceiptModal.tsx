'use client'

import html2pdf from 'html2pdf.js'

type ReceiptModalProps = {
  open: boolean
  onClose: () => void
  sale: any
  company: {
    name: string
    location: string
  }
}

export default function ReceiptModal({
  open,
  onClose,
  sale,
  company,
}: ReceiptModalProps) {
  if (!open) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const el = document.getElementById('receipt-content')
    if (!el) return

    html2pdf()
      .set({
        margin: 10,
        filename: `receipt-${sale.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a6', orientation: 'portrait' },
      })
      .from(el)
      .save()
  }
  console.log('Rendering ReceiptModal with sale:', sale, '  and company:', company)

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-lg">

        {/* HEADER */}
        <div className="border-b px-4 py-3 text-center">
          <h2 className="text-lg font-bold">{company.name}</h2>
          <p className="text-xs text-gray-500">{company.location}</p>
        </div>

        {/* RECEIPT CONTENT */}
        <div
          id="receipt-content"
          className="px-4 py-4 font-mono text-sm text-black"
        >
          <h3 className="mb-2 text-center text-base font-bold">
            RECEIPT
          </h3>

          <div className="mb-3 text-center text-xs text-gray-600">
            <p>{new Date(sale.created_at).toLocaleString()}</p>
            <p>Receipt #{sale.id.slice(0, 8)}</p>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* ITEMS */}
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Amt</th>
              </tr>
            </thead>
            <tbody>
              {sale.sale_items.map((item: any) => {
                const amount =
                  item.subtotal

                return (
                  <tr key={item.id} className="border-t">
                    <td className="py-1">
                      {item.products?.name}
                      {item.discount_percent > 0 && (
                        <div className="text-[10px] text-gray-500">
                          Discount: {item.discount_percent}% =  ₦{item.discount}
                        </div>
                      )}
                      
                      {item.tax_percent > 0 && (
                        <div className="text-[10px] text-gray-500">
                          Tax: {item.tax_percent}% =  ₦{item.tax_amount}
                        </div>
                      )}
                      {item.tax_percent > 0 && (
                        <div className="text-[10px] text-gray-900 text-right">
                          Subtotal:  ₦{amount}
                        </div>
                      )}
                    </td>
                    <td className="py-1 text-center">
                      {item.quantity} × {item.selling_price}
                    </td>
                    <td className="py-1 text-right">
                      ₦{item.selling_price * item.quantity}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* TOTALS */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₦{sale.total_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cash</span>
              <span>₦{sale.total_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Change</span>
              <span>₦0</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          <p className="text-center font-bold">THANK YOU!</p>

          <div className="mt-2 text-center text-xs tracking-widest">
            |||| ||| |||| ||| |||||
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 border-t px-4 py-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"
          >
            Print
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  )
}
