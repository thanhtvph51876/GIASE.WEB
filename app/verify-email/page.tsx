"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { authApi } from "@/lib/api/auth-api"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Đang xác minh email...")

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) {
      setStatus("error")
      setMessage("Link xác minh thiếu token hoặc không hợp lệ.")
      return
    }
    authApi.verifyEmail(token)
      .then(() => {
        setStatus("success")
        setMessage("Email của bạn đã được xác minh.")
      })
      .catch((error) => {
        setStatus("error")
        setMessage(error instanceof Error ? error.message : "Không thể xác minh email.")
      })
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="app-container flex flex-1 items-center justify-center py-12">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            {status === "loading" && <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />}
            {status === "success" && <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />}
            {status === "error" && <AlertCircle className="mx-auto h-12 w-12 text-red-600" />}
            <h1 className="mt-4 text-2xl font-bold text-slate-950">
              {status === "success" ? "Email đã được xác minh" : status === "error" ? "Không thể xác minh email" : "Đang xác minh"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Button className="mt-5" asChild><Link href="/dashboard">Về dashboard</Link></Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
