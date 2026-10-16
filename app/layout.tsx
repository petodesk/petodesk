import type { Metadata, Viewport } from "next";
import { Geist, Poppins } from "next/font/google";
import ToastProvider from "./components/ToastProvider";
import { CompanyProvider } from "./context/CompanyContext";
// @ts-ignore
import './global.css'; // global styles
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
export const viewport: Viewport = {
  themeColor: '#1A56DB',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.petodesk.com'),

  title: 'PetoDesk',

  description:
    'Business Management Software for Inventory, Invoice, Payroll, Sales & HR.',

  openGraph: {
    title: 'PetoDesk',

    description:
      'Business Management Software for Inventory, Invoice, Payroll, Sales & HR.',

    url: 'https://www.petodesk.com',

    siteName: 'PetoDesk',

    images: [
      {
        url: 'https://www.petodesk.com/opengraph-image?v=2',
        width: 1200,
        height: 630,
        alt: 'PetoDesk',
      },
    ],

    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',

    title: 'PetoDesk',

    description:
      'Business Management Software for Inventory, Invoice, Payroll, Sales & HR.',
    images: ["https://www.petodesk.com/opengraph-image?v=2"],
  },

  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Petodesk',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}





export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Petodesk" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${geistSans.variable} ${poppins.variable} antialiased`}>
        <CompanyProvider>{children}</CompanyProvider>
        <ServiceWorkerRegistration />
        <ToastProvider />
      </body>
    </html>
  );
}