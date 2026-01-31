import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

// Metadata updated for the Medical Billing context
export const metadata: Metadata = {
  title: "Stock Command | Medical Billing",
  description: "Enterprise Medical Billing & Inventory Management v2.0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body 
        className={`${inter.className} bg-[#f8fafc] text-[#0f172a] antialiased min-h-screen selection:bg-blue-100 selection:text-blue-900`}
      >
<AuthProvider>
          <div className="relative z-0">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}