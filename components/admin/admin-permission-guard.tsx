"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/lib/contexts/auth-context"
import {
  hasAllAdminPermissions,
  hasAnyAdminPermission,
  type AdminPermission,
} from "@/lib/admin/admin-permissions"

interface AdminPermissionGuardProps {
  requiredPermissions?: AdminPermission[]
  mode?: "any" | "all"
  children: React.ReactNode
}

export function AdminPermissionGuard({
  requiredPermissions = [],
  mode = "any",
  children,
}: AdminPermissionGuardProps) {
  const { user, isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-sm font-medium text-slate-600">
        Đang kiểm tra quyền truy cập...
      </div>
    )
  }

  const allowed =
    mode === "all"
      ? hasAllAdminPermissions(user, requiredPermissions)
      : hasAnyAdminPermission(user, requiredPermissions)

  if (!allowed) return <AdminForbiddenState />
  return <>{children}</>
}

export function AdminForbiddenState() {
  return (
    <div className="flex min-h-[520px] items-center justify-center p-4">
      <div className="surface-panel max-w-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-950">Bạn không có quyền truy cập chức năng này.</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Tài khoản admin hiện tại không có quyền cần thiết cho module hoặc thao tác này.
        </p>
        <Button asChild className="mt-5">
          <Link href="/admin">Quay lại Admin Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}

