"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api/auth-api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!email.includes("@")) {
      toast.error("Vui lòng nhập email hợp lệ")
      return
    }
    setLoading(true)
    try {
      const result = await authApi.forgotPassword(email)
      setResetToken(result.resetToken || null)
      setSent(true)
      toast.success("Đã ghi nhận yêu cầu đặt lại mật khẩu")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể gửi yêu cầu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="app-container flex flex-1 items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Quên mật khẩu</CardTitle>
            <CardDescription>Nhập email để nhận hướng dẫn đặt lại mật khẩu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sent ? (
              <div className="soft-panel space-y-3 p-4 text-sm text-emerald-700">
                <p>Đã ghi nhận yêu cầu đặt lại mật khẩu. Nếu email tồn tại, hệ thống sẽ gửi hướng dẫn đặt lại.</p>
                {resetToken && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/reset-password?token=${resetToken}`}>Mở link đặt lại mật khẩu dev</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="email@example.com" />
              </div>
            )}
            <Button
              className="w-full"
              onClick={submit}
              disabled={loading || sent}
            >
              {loading ? "Đang gửi..." : "Gửi hướng dẫn"}
            </Button>
            {!sent && (
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Về đăng nhập</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
