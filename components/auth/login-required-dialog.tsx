"use client"

import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface LoginRequiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  redirectTo: string
  registerRole?: "student" | "parent" | "tutor"
}

function safeRedirect(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return "/"
  return value
}

export function LoginRequiredDialog({
  open,
  onOpenChange,
  title = "Cần đăng nhập để tiếp tục",
  description = "Đăng nhập để lưu thông tin, theo dõi trạng thái và quay lại đúng màn hình hiện tại.",
  redirectTo,
  registerRole = "student",
}: LoginRequiredDialogProps) {
  const redirect = safeRedirect(redirectTo)
  const loginHref = `/login?redirect=${encodeURIComponent(redirect)}`
  const registerHref = `/register?role=${registerRole}&redirect=${encodeURIComponent(redirect)}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tiếp tục xem
          </Button>
          <Button variant="outline" asChild>
            <Link href={registerHref}>Tạo tài khoản</Link>
          </Button>
          <Button asChild>
            <Link href={loginHref}>Đăng nhập</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
