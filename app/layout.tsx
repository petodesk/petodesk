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

export const metadata = {
  metadataBase: new URL('https://petodesk.com'),

  title: 'PetoDesk',
   description: "Business Management Software for Inventory, Invoice, Payroll, Sales & HR.",

  openGraph: {
    title: 'PetoDesk',
   description: "Business Management Software for Inventory, Invoice, Payroll, Sales & HR.",
   
    images: ['/opengraph-image'],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'PetoDesk',
   description: "Business Management Software for Inventory, Invoice, Payroll, Sales & HR.",
    
    images: ['/opengraph-image'],
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