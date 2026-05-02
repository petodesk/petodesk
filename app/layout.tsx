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
  title: "Petodesk",
  description: "Business Management Software for Inventory, Invoice, Payroll, Sales & HR.",

  icons: {
    icon: "/logo.svg",
  },

 openGraph: {
  title: "Petodesk",
  description: "Business Management Software for Inventory, Invoice, Payroll, Sales & HR.",
  url: "https://www.petodesk.com",
  siteName: "Petodesk",
  images: [
    {
      url: "https://www.petodesk.com/preview.png",
      width: 1200,
      height: 630,
      alt: "Petodesk",
    },
  ],
},

  twitter: {
    card: "summary_large_image",
    title: "Petodesk",
    description: "Business Management Software for Inventory, Invoice, Payroll, Sales & HR.",
    images: ["https://www.petodesk.com/preview.png"],
  },
};

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