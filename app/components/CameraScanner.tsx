'use client'

import { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

type CameraScannerProps = {
    onScan: (code: string) => void;
    onClose: () => void;
};

export default function CameraScanner({ onScan, onClose }: CameraScannerProps) {
    const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
    const isStarting = useRef(false);

    useEffect(() => {
        const scannerId = "qr-reader";
        const scanner = new Html5Qrcode(scannerId);
        html5QrcodeRef.current = scanner;

        const startCamera = async () => {
            // Prevent double-start if React runs this twice
            if (isStarting.current || scanner.isScanning) return;
            
            isStarting.current = true;

            try {
                // Small delay to ensure DOM is ready
                await new Promise(resolve => setTimeout(resolve, 500));

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                };

                // Try back camera first
                await scanner.start(
                    { facingMode: "environment" },
                    config,
                    (text) => {
                        onScan(text);
                        handleClose();
                    },
                    () => {} // ignore frame errors
                );
            } catch (err) {
                console.warn("Back camera failed, trying fallback...", err);
                try {
                    // Fallback to any camera (laptop webcam)
                    await scanner.start(
                        { facingMode: "user" },
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        (text) => { onScan(text); handleClose(); },
                        () => {}
                    );
                } catch (fallbackErr) {
                    console.error("No camera found", fallbackErr);
                }
            } finally {
                isStarting.current = false;
            }
        };

        startCamera();

        return () => {
            // Cleanup: stop the scanner if it's running
            if (scanner.isScanning) {
                scanner.stop().then(() => scanner.clear()).catch(() => {});
            }
        };
    }, []);

    const handleClose = async () => {
        if (html5QrcodeRef.current) {
            if (html5QrcodeRef.current.isScanning) {
                await html5QrcodeRef.current.stop();
            }
            html5QrcodeRef.current.clear();
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-black shadow-2xl">
                {/* Center the video within the box */}
                <div id="qr-reader" className="w-full" />
            </div>
            
            <button
                onClick={handleClose}
                className="mt-8 rounded-lg bg-red-600 px-10 py-3 font-bold text-white hover:bg-red-700 active:scale-95"
            >
                Close
            </button>
        </div>
    );
}