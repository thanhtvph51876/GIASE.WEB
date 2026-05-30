"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100/70 p-6">
      <section className="surface-panel max-w-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-950">Không tải được màn hình</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Hệ thống gặp lỗi khi hiển thị dữ liệu. Dữ liệu đăng nhập vẫn được giữ nếu phiên còn hợp lệ.
        </p>
        <Button className="mt-5" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Thử lại
        </Button>
      </section>
    </main>
  )
}
