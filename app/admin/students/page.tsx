"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { AdminPagination, ADMIN_PAGE_SIZE, defaultPagination } from "@/components/admin/admin-pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { hasAdminPermission } from "@/lib/admin/admin-permissions"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { adminService } from "@/lib/services"
import { formatDate } from "@/lib/helpers"
import type { User } from "@/types"

export default function AdminStudentsPage() {
  const { user } = useAuthContext()
  const [students, setStudents] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(defaultPagination())
  const [loading, setLoading] = useState(false)
  const canManage = hasAdminPermission(user, "users.manage")
  const [busyId, setBusyId] = useState<string | null>(null)
  const load = async (targetPage = page) => {
    setLoading(true)
    try {
      const result = await adminService.getUsersPage({ role: "student", page: targetPage, pageSize: ADMIN_PAGE_SIZE })
      setStudents(result.items)
      setPagination(result.pagination)
    } catch {
      toast.error("Không tải được danh sách học sinh")
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
        toast.success("Đã cập nhật tài khoản học sinh")
        load(page)
      } else toast.error(result.error)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Quản lý học sinh</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Admin xem hồ sơ tài khoản, trạng thái và khóa/mở tài khoản khi cần vận hành.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tài khoản học sinh</CardTitle>
          <CardDescription>{pagination.total} học sinh đang có trong hệ thống.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {students.map((item) => (
            <UserRow
              key={item.id}
              user={item}
              canManage={canManage}
              busy={busyId === item.id}
              onStatus={(status, reason) => updateStatus(item, status, reason)}
            />
          ))}
          {!students.length && <div className="soft-panel border-dashed p-10 text-center text-sm text-muted-foreground">Chưa có tài khoản học sinh.</div>}
        </CardContent>
      </Card>
      <AdminPagination pagination={pagination} loading={loading} onPageChange={setPage} />
    </div>
  )
}

function UserRow({ user, canManage, busy, onStatus }: { user: User; canManage: boolean; busy: boolean; onStatus: (status: User["status"], reason: string) => void }) {
  return (
    <div className="item-row grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-900">{user.fullName}</p>
          <StatusBadge kind="user" status={user.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{user.email} · {user.phone || "Chưa có SĐT"}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <UserDetailDialog user={user} />
        <ConfirmReasonDialog
          trigger={<Button size="sm" variant="outline" disabled={!canManage || busy || user.status === "inactive"}>Khóa</Button>}
          title="Khóa tài khoản học sinh"
          description="Backend sẽ cập nhật trạng thái và thu hồi refresh token nếu tài khoản không active."
          actionName="Khóa tài khoản"
          severity="danger"
          reasonOptions={[
            { value: "POLICY_VIOLATION", label: "Vi phạm chính sách" },
            { value: "FRAUD_RISK", label: "Rủi ro gian lận" },
            { value: "PARENT_REQUEST", label: "Theo yêu cầu phụ huynh" },
            { value: "OTHER", label: "Lý do khác" },
          ]}
          onConfirm={(reason, note) => onStatus("inactive", note || reason)}
        />
        <ConfirmReasonDialog
          trigger={<Button size="sm" variant="outline" disabled={!canManage || busy || user.status === "active"}>Mở</Button>}
          title="Mở lại tài khoản học sinh"
          description="Chỉ mở khi đã xác minh đủ điều kiện tiếp tục sử dụng hệ thống."
          actionName="Mở tài khoản"
          severity="warning"
          reasonOptions={[
            { value: "REVIEWED_OK", label: "Đã rà soát đủ điều kiện" },
            { value: "SUPPORT_CONFIRMED", label: "Support xác nhận" },
            { value: "OTHER", label: "Lý do khác" },
          ]}
          onConfirm={(reason, note) => onStatus("active", note || reason)}
        />
      </div>
    </div>
  )
}

function UserDetailDialog({ user }: { user: User }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Chi tiết</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{user.fullName}</DialogTitle>
          <DialogDescription>Thông tin tài khoản học sinh và trạng thái admin có thể xử lý.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="User ID" value={user.id} />
          <Info label="Email" value={user.email} />
          <Info label="SĐT" value={user.phone || "Chưa có"} />
          <Info label="Trạng thái" value={user.status} />
          <Info label="Role" value={user.role} />
          <Info label="Ngày tạo" value={formatDate(user.createdAt)} />
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
