'use client'

import JsBarcode from "jsbarcode";
import { useEffect, useRef } from "react";

export default function BarcodeBatchPrint({ products, onClose, open }: { products: any[], onClose: () => void, open: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        products.forEach((product, index) => {
            const svg = document.getElementById(`barcode-${index}`);
            if (svg) {
                JsBarcode(svg, product.barcode, {
                    format: "CODE128",
                    lineColor: "#000",
                    width: 2,
                    height: 50,
                    displayValue: true,
                });
            }
        });
    }, [products]);

    const handlePrint = () => {
        if (!containerRef.current) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write('<html><head><title>Print Barcodes</title></head><body>');
        printWindow.document.write(containerRef.current.innerHTML);
        printWindow.document.write('</body></html>');

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    if (!open) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

            <div className="relative w-full max-w-4xl p-4 bg-white rounded-lg  mt-4  max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">All Products Barcode</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4">

                    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map((product, index) => (
                            <div key={index} className="text-center border p-2">
                                <p className="text-xs font-semibold">{product.name}</p>
                                <svg id={`barcode-${index}`}></svg>
                                <p className="text-xs mt-1">₦{product.product_prices[0]?.selling_price}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-4">
                    <button
                        onClick={handlePrint}
                        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white cursor-pointer"
                    >
                        Print All Labels
                    </button>
                    </div>
                </div>
            </div>
        </div>
    );
}