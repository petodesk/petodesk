'use client'

import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'



export default function BarcodeLabel({ product, onclose, open }: { product: any, onclose: () => void, open: boolean }) {
    if (!open) return null
    const barcodeRef = useRef<SVGSVGElement | null>(null)

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

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>

            <div className="absolute inset-0 bg-black/50" onClick={onclose}></div>


            <div className=" relative w-48 border p-2 text-center bg-white rounded-lg shadow-lg left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <p className="text-xs font-semibold">{product.name}</p>

                <svg ref={barcodeRef}></svg>

                <p className="text-xs mt-1">₦{product.product_prices[0]?.selling_price}</p>
                <button
                    onClick={() => window.print()}
                    className="mt-3 rounded bg-blue-600 px-4 py-2 text-white"
                >
                    Print Label
                </button>
            </div>
        </div>
    )
}