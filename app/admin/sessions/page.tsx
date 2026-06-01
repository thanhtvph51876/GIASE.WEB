"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AdminActionButton } from "@/components/admin/admin-action-button"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { DashboardMetricCard } from "@/components/platform/operational-components"
import { getAdminActionAvailability } from "@/lib/admin/admin-actions"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { scheduleService } from "@/lib/services"
import { formatDateTime } from "@/lib/helpers"
import type { ClassSession } from "@/types"

export default function AdminSessionsPage() {
  const { user } = useAuthContext()
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const load = async () => setSessions(await scheduleService.getAllSessions())
  useEffect(() => { load() }, [])
  const update = async (id: string, status: "completed" | "student_absent" | "tutor_absent" | "cancelled", note: string) => {
    setBusyId(id)
    try {
      const result =
        status === "student_absent"
          ? await scheduleService.markStudentAbsent(id, note)
          : status === "tutor_absent"
            ? await scheduleService.markTutorAbsent(id, note)
            : await scheduleService.updateSessionStatus(id, status, note)
      if (result.success) { toast.success("Đã cập nhật buổi học"); load() } else toast.error(result.error)
    } finally {
      setBusyId(null)
    }
  }
  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6"><h1 className="text-2xl font-bold">Buổi học</h1><p className="text-sm text-muted-foreground">Quản lý session toàn hệ thống.</p></div>
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardMetricCard label="Tổng buổi" value={sessions.length} />
        <DashboardMetricCard label="Sắp tới" value={sessions.filter((item) => item.status === "upcoming" || item.status === "scheduled").length} />
        <DashboardMetricCard label="Hoàn thành" value={sessions.filter((item) => item.status === "completed").length} />
        <DashboardMetricCard label="Vắng/hủy" value={sessions.filter((item) => ["cancelled", "student_absent", "tutor_absent"].includes(item.status)).length} />
      </div>
      <Card><CardHeader><CardTitle>Danh sách session</CardTitle></CardHeader><CardContent className="space-y-3">
        {sessions.map((session) => {
          const completeAvailability = getAdminActionAvailability(user, "session", "session.complete", session.status, session)
          const cancelAvailability = getAdminActionAvailability(user, "session", "session.cancel", session.status, session)
          const absentAvailability = getAdminActionAvailability(user, "session", "session.markAbsent", session.status, session)
          return (
            <div key={session.id} className="item-row grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{session.subject} · {session.studentName}</p>
                  <StatusBadge kind="session" status={session.status} />
                </div>
                <p className="text-sm text-muted-foreground">{session.tutorName} · {formatDateTime(session.startTime)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <SessionDetailDialog session={session} />
                <ConfirmReasonDialog
                  trigger={<AdminActionButton size="sm" disabled={busyId === session.id} availability={completeAvailability}>Hoàn thành</AdminActionButton>}
                  title="Hoàn thành buổi học"
                  description="Thao tác này có thể phát sinh payment/earning, nên cần xác nhận sau khi đã đối soát điểm danh."
                  actionName="Hoàn thành"
                  severity="warning"
                  reasonOptions={[
                    { value: "SESSION_DELIVERED", label: "Buổi học đã diễn ra đầy đủ" },
                    { value: "ADMIN_RECONCILED", label: "Admin đã đối soát điểm danh" },
                    { value: "OTHER", label: "Ghi chú khác" },
                  ]}
                  onConfirm={(reason, note) => update(session.id, "completed", note || reason)}
                />
                <ConfirmReasonDialog
                  trigger={<AdminActionButton size="sm" variant="outline" disabled={busyId === session.id} availability={absentAvailability}>HV vắng</AdminActionButton>}
                  title="Ghi nhận học viên vắng"
                  description="Lý do vắng sẽ giúp vận hành xử lý học bù, phí hoặc khiếu nại sau này."
                  actionName="Ghi nhận"
                  severity="warning"
                  reasonOptions={[
                    { value: "STUDENT_NO_SHOW", label: "Học viên không tham gia" },
                    { value: "PARENT_NOTICE", label: "Phụ huynh báo vắng" },
                    { value: "OTHER", label: "Lý do khác" },
                  ]}
                  onConfirm={(reason, note) => update(session.id, "student_absent", note || reason)}
                />
                <ConfirmReasonDialog
                  trigger={<AdminActionButton size="sm" variant="outline" disabled={busyId === session.id} availability={absentAvailability}>GS vắng</AdminActionButton>}
                  title="Ghi nhận gia sư vắng"
                  description="Lý do vắng sẽ được dùng cho audit và xử lý chất lượng gia sư."
                  actionName="Ghi nhận"
                  severity="warning"
                  reasonOptions={[
                    { value: "TUTOR_NO_SHOW", label: "Gia sư không tham gia" },
                    { value: "TUTOR_NOTICE", label: "Gia sư báo vắng" },
                    { value: "OTHER", label: "Lý do khác" },
                  ]}
                  onConfirm={(reason, note) => update(session.id, "tutor_absent", note || reason)}
                />
                <ConfirmReasonDialog
                  trigger={<AdminActionButton size="sm" variant="outline" disabled={busyId === session.id} availability={cancelAvailability}>Hủy</AdminActionButton>}
                  title="Hủy buổi học"
                  description="Buổi học bị hủy cần lý do rõ để tránh sai lệch payment/earning."
                  actionName="Hủy buổi"
                  severity="danger"
                  reasonOptions={[
                    { value: "SCHEDULE_CONFLICT", label: "Trùng lịch" },
                    { value: "ADMIN_CANCELLED", label: "Admin hủy sau đối soát" },
                    { value: "OTHER", label: "Lý do khác" },
                  ]}
                  onConfirm={(reason, note) => update(session.id, "cancelled", note || reason)}
                />
              </div>
            </div>
          )
        })}
      </CardContent></Card>
    </div>
  )
}

function SessionDetailDialog({ session }: { session: ClassSession }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Chi tiết</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{session.subject} · {formatDateTime(session.startTime)}</DialogTitle>
          <DialogDescription>Thông tin điểm danh, lịch học và liên kết lớp để admin xử lý đúng payment/earning.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Session ID" value={session.id} />
          <Info label="Class ID" value={session.classId || "Không gắn lớp"} />
          <Info label="Trạng thái" value={session.status} />
          <Info label="Loại buổi" value={session.isTrial ? "Học thử" : "Chính thức"} />
          <Info label="Gia sư" value={session.tutorName} />
          <Info label="Học viên" value={session.studentName} />
          <Info label="Thời gian" value={`${formatDateTime(session.startTime)} - ${formatDateTime(session.endTime)}`} />
          <Info label="Hình thức" value={`${session.mode}${session.location ? ` · ${session.location}` : ""}`} />
          <div className="rounded-lg border bg-slate-50 p-3 md:col-span-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Ghi chú</p>
            <p className="mt-1 text-sm leading-6 text-slate-900">{session.note || "Chưa có ghi chú"}</p>
          </div>
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
