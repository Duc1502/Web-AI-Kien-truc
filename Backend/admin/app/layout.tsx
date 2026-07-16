import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CảiTạoNhà.AI — Admin",
  robots: { index: false, follow: false }, // không cho công cụ tìm kiếm index trang admin
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
