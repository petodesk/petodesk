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

        html5QrcodeRef.current = new Html5Qrcode('qr-reader');

        Html5Qrcode.getCameras()
            .then((devices) => {
                if (devices && devices.length) {
                    const cameraId = devices[0].id; // default to first camera
                    html5QrcodeRef.current?.start(
                        cameraId,
                        {
                            fps: 10,
                            qrbox: 250
                        },
                        (decodedText) => {
                            onScan(decodedText);
                            stopScanner();
                        },
                        (error) => {
                            console.warn('QR scan error:', error);
                        }
                    );
                }
            })
            .catch((err) => console.error(err));

        return () => stopScanner();
    }, []);

    const stopScanner = () => {
        if (html5QrcodeRef.current && html5QrcodeRef.current.getState() === 2) {
            // 2 = SCANNER_RUNNING
            html5QrcodeRef.current.stop()
                .then(() => html5QrcodeRef.current?.clear())
                .catch(err => console.warn('Failed to stop scanner:', err));
        } else {
            // Already stopped or not started yet
            html5QrcodeRef.current?.clear();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 p-4">
            <div ref={scannerRef} id="qr-reader" className="w-full max-w-md bg-white" />
            <button
                onClick={() => {
                    stopScanner();
                    onClose();
                }}
                className="mt-4 rounded bg-red-600 px-4 py-2 text-white"
            >
                Close
            </button>
        </div>
    );
}