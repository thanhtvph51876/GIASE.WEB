"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { AdminPagination, ADMIN_PAGE_SIZE, defaultPagination } from "@/components/admin/admin-pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { RoleBadge } from "@/components/platform/operational-components"
import { hasAdminPermission } from "@/lib/admin/admin-permissions"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { adminService } from "@/lib/services"
import { formatDate } from "@/lib/helpers"
import type { User } from "@/types"

export default function AdminParentsPage() {
  const { user } = useAuthContext()
  const [parents, setParents] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(defaultPagination())
  const [loading, setLoading] = useState(false)
  const canManage = hasAdminPermission(user, "users.manage")
  const [busyId, setBusyId] = useState<string | null>(null)
  const load = async (targetPage = page) => {
    setLoading(true)
    try {
      const result = await adminService.getUsersPage({ role: "parent", page: targetPage, pageSize: ADMIN_PAGE_SIZE })
      setParents(result.items)
      setPagination(result.pagination)
    } catch {
      toast.error("Không tải được danh sách phụ huynh")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load(page) }, [page])

  const updateStatus = async (target: User, status: User["status"], reason: string) => {
    setBusyId(target.id)
    try {
      const result = await adminService.updateUserStatus(target.id, status, reason)
      if (result.success) {
        toast.success("Đã cập nhật tài khoản phụ huynh")
        load(page)
      } else toast.error(result.error)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold">Phụ huynh</h1>
        <p className="text-sm text-muted-foreground">Quản lý tài khoản phụ huynh, quyền truy cập và trạng thái chăm sóc liên quan học sinh.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{pagination.total} phụ huynh</CardTitle>
          <CardDescription>Admin có thể xem chi tiết, khóa hoặc mở lại tài khoản theo quyền users.manage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {parents.map((parent) => (
            <div key={parent.id} className="item-row grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{parent.fullName}</p>
                  <RoleBadge role={parent.role} />
                  <StatusBadge kind="user" status={parent.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{parent.email} · {parent.phone || "Chưa có SĐT"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/parents/${parent.id}`}>CRM</Link>
                </Button>
                <ParentDetailDialog parent={parent} />
                <ConfirmReasonDialog
                  trigger={<Button size="sm" variant="outline" disabled={!canManage || busyId === parent.id || parent.status === "inactive"}>Khóa</Button>}
                  title="Khóa tài khoản phụ huynh"
                  description="Dùng khi tài khoản có rủi ro, tranh chấp hoặc cần dừng truy cập tạm thời."
                  actionName="Khóa"
                  severity="danger"
                  reasonOptions={[
                    { value: "DISPUTE", label: "Đang có tranh chấp" },
                    { value: "PAYMENT_RISK", label: "Rủi ro thanh toán" },
                    { value: "POLICY_VIOLATION", label: "Vi phạm chính sách" },
                    { value: "OTHER", label: "Lý do khác" },
                  ]}
                  onConfirm={(reason, note) => updateStatus(parent, "inactive", note || reason)}
                />
                <ConfirmReasonDialog
                  trigger={<Button size="sm" variant="outline" disabled={!canManage || busyId === parent.id || parent.status === "active"}>Mở</Button>}
                  title="Mở lại tài khoản phụ huynh"
                  description="Chỉ mở lại sau khi đã xử lý xong rủi ro hoặc xác nhận từ support."
                  actionName="Mở"
                  severity="warning"
                  reasonOptions={[
                    { value: "SUPPORT_RESOLVED", label: "Support đã xử lý" },
                    { value: "PAYMENT_RECONCILED", label: "Thanh toán đã đối soát" },
                    { value: "OTHER", label: "Lý do khác" },
                  ]}
                  onConfirm={(reason, note) => updateStatus(parent, "active", note || reason)}
                />
              </div>
            </div>
          ))}
          {!parents.length && <div className="soft-panel border-dashed p-10 text-center text-sm text-muted-foreground">Chưa có tài khoản phụ huynh.</div>}
        </CardContent>
      </Card>
      <AdminPagination pagination={pagination} loading={loading} onPageChange={setPage} />
    </div>
  )
}

function ParentDetailDialog({ parent }: { parent: User }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Chi tiết</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{parent.fullName}</DialogTitle>
          <DialogDescription>Thông tin tài khoản phụ huynh để admin xử lý quyền truy cập và support.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="User ID" value={parent.id} />
          <Info label="Email" value={parent.email} />
          <Info label="SĐT" value={parent.phone || "Chưa có"} />
          <Info label="Trạng thái" value={parent.status} />
          <Info label="Role" value={parent.role} />
          <Info label="Ngày tạo" value={formatDate(parent.createdAt)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
