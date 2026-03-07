'use client'

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

type CameraScannerProps = {
    onScan: (code: string) => void;
    onClose: () => void;
};

export default function CameraScanner({ onScan, onClose }: CameraScannerProps) {
    const scannerRef = useRef<HTMLDivElement>(null);
    const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        if (!scannerRef.current) return;

        const scannerId = "qr-reader";
        html5QrcodeRef.current = new Html5Qrcode(scannerId);

        // Start scanning with facingMode configuration
        html5QrcodeRef.current.start(
            // Use facingMode instead of a specific device ID
            { facingMode: "environment" }, 
            {
                fps: 10,
                qrbox: { width: 250, height: 250 } // Better responsive handling
            },
            (decodedText) => {
                onScan(decodedText);
                stopScanner();
            },
            (error) => {
                // Keep this quiet to avoid console spamming during focus hunting
            }
        ).catch((err) => {
            console.error("Unable to start scanning", err);
        });

        return () => {
            stopScanner();
        };
    }, []);

    const stopScanner = async () => {
        if (html5QrcodeRef.current) {
            try {
                if (html5QrcodeRef.current.isScanning) {
                    await html5QrcodeRef.current.stop();
                }
                html5QrcodeRef.current.clear();
            } catch (err) {
                console.warn('Failed to stop scanner:', err);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-white">
                <div id="qr-reader" className="w-full" />
            </div>
            <button
                onClick={() => {
                    stopScanner();
                    onClose();
                }}
                className="mt-4 rounded bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-700"
            >
                Close Scanner
            </button>
        </div>
    );
}