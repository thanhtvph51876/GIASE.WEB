import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/contexts/auth-context"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Gia Sư Sư Phạm - Kết nối gia sư chất lượng",
    template: "%s | Gia Sư Sư Phạm",
  },
  description:
    "Nền tảng kết nối học sinh/phụ huynh với gia sư là sinh viên hoặc cựu sinh viên Đại học Sư phạm. Hồ sơ được xác minh, minh bạch và dễ đăng ký.",
  keywords: [
    "gia sư",
    "tìm gia sư",
    "gia sư sư phạm",
    "dạy kèm",
    "học thêm",
    "sinh viên sư phạm",
  ],
  authors: [{ name: "Gia Sư Sư Phạm" }],
  creator: "Gia Sư Sư Phạm",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Gia Sư Sư Phạm",
    title: "Gia Sư Sư Phạm - Kết nối gia sư chất lượng",
    description:
      "Nền tảng kết nối học sinh/phụ huynh với gia sư là sinh viên hoặc cựu sinh viên Đại học Sư phạm.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className="bg-background font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
