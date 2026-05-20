"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api/auth-api"

export default function ResetPasswordPage() {
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "")
  }, [])

  const submit = async () => {
    if (!token) {
      toast.error("Thiếu token đặt lại mật khẩu")
      return
    }
    if (password.length < 8 || password !== confirm) {
      toast.error("Mật khẩu cần từ 8 ký tự và trùng khớp")
      return
    }
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
      toast.success("Đặt lại mật khẩu thành công")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể đặt lại mật khẩu")
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
            <CardTitle>Đặt lại mật khẩu</CardTitle>
            <CardDescription>Nhập mật khẩu mới cho tài khoản của bạn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!token && <div className="soft-panel p-3 text-sm text-amber-700">Link đặt lại mật khẩu thiếu token hoặc đã hết hạn.</div>}
            {done && <div className="soft-panel p-3 text-sm text-emerald-700">Mật khẩu đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.</div>}
            <div className="space-y-2"><Label>Mật khẩu mới</Label><Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" /></div>
            <div className="space-y-2"><Label>Nhập lại mật khẩu</Label><Input value={confirm} onChange={(event) => setConfirm(event.target.value)} type="password" /></div>
            <Button
              className="w-full"
              onClick={submit}
              disabled={loading || done || !token}
            >
              {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </Button>
            <Button variant="outline" className="w-full" asChild><Link href="/login">Về đăng nhập</Link></Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
