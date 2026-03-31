'use client'

import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import { useCompany } from './CompanyContext'



export default function BarcodeLabel({ product, onclose, open }: { product: any, onclose: () => void, open: boolean }) {
    if (!open) return null
    const barcodeRef = useRef<SVGSVGElement | null>(null)
const{currency} = useCompany()
    useEffect(() => {
        if (barcodeRef.current) {
            JsBarcode(barcodeRef.current, product.barcode, {
                format: "CODE128",
                lineColor: "#000",
                width: 2,
                height: 50,
                displayValue: true,
            })
        }
    }, [product])

    const handlePrint = () => {
  if (!barcodeRef.current) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write('<html><head><title>Print Barcode</title></head><body>');
  printWindow.document.write('<div style="text-align:center">');
  printWindow.document.write(`<p>${product.name}</p>`);
  printWindow.document.write(barcodeRef.current.outerHTML); // embed SVG
  printWindow.document.write(`<p>${currency} ${product.product_prices[0]?.selling_price}</p>`);
  printWindow.document.write('</div></body></html>');

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

    return (
        <div className='fixed inset-0 z-50 items-center justify-center'>

            <div className="absolute inset-0 bg-black/50" onClick={onclose}></div>


            <div className=" relative w-100 max-sm:w-full border p-2 text-center bg-white rounded-lg shadow-lg left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <p className="text-xs font-semibold">{product.name}</p>

                <svg ref={barcodeRef}></svg>
                    <div className='flex gap-2 items-center justify-center'>
                        <p>Price</p>
                <p className="text-xs mt-1"> {currency} {product.product_prices[0]?.selling_price}</p>
                        
                    </div>
                <button
                    onClick={handlePrint}
                    className="mt-3 rounded bg-blue-600 px-4 py-2 text-white"
                >
                    Print Label
                </button>
            </div>
        </div>
    )
}