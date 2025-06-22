import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "ZKPassport – Globe Game",
  description: "A simple geography game powered by ZKPassport authentication.",
    generator: 'v0.dev'
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-gray-100 text-gray-900"}>
        {children}
      </body>
    </html>
  );
}
