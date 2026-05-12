import type { Metadata } from "next";
import { Geist, Poppins } from "next/font/google";
import ToastProvider from "./components/ToastProvider";
import { CompanyProvider } from "./context/CompanyContext";
// @ts-ignore
import './global.css'; // global styles
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
        url: 'https://www.petodesk.com/opengraph-image',
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

    images: ['https://www.petodesk.com/opengraph-image'],
  },
}






export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${poppins.variable} antialiased`}
      >
          <CompanyProvider>{children}</CompanyProvider>
        <ToastProvider />
      </body>
    </html>
  );
}