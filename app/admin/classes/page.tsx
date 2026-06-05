"use client"

import { useState } from "react"
import { BookOpenCheck, CalendarDays, CheckCircle2, GraduationCap, TimerReset } from "lucide-react"
import { toast } from "sonner"
import { AdminActionButton } from "@/components/admin/admin-action-button"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { AdminPagination, ADMIN_PAGE_SIZE } from "@/components/admin/admin-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { DashboardMetricCard, EmptyState, EntityCard, PageHero } from "@/components/platform/operational-components"
import { getAdminActionAvailability } from "@/lib/admin/admin-actions"
import { hasAdminPermission } from "@/lib/admin/admin-permissions"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useAdminOperations } from "@/lib/hooks/use-admin"
import { useClasses } from "@/lib/hooks/use-classes"
import { classService, workflowService } from "@/lib/services"
import { formatCurrency, formatDate } from "@/lib/helpers"
import type { Class, ClassSession, ClassStatus } from "@/types"

export default function AdminClassesPage() {
  const { user } = useAuthContext()
  const [page, setPage] = useState(1)
  const { classes, pagination, refresh, isLoading } = useClasses({ role: "admin", page, pageSize: ADMIN_PAGE_SIZE })
  const { data, refresh: refreshOperations } = useAdminOperations()
  const [result, setResult] = useState<"active" | "rematch" | "cancelled">("active")
  const [note, setNote] = useState("")
  const [scheduleText, setScheduleText] = useState("")
  const [fee, setFee] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const sessions = (data?.sessions || []) as ClassSession[]
  const trialCount = classes.filter((item) => item.status === "trial").length
  const activeCount = classes.filter((item) => item.status === "active").length
  const completedCount = classes.filter((item) => item.status === "completed").length
  const canManageClasses = hasAdminPermission(user, "classes.manage")

  const submitTrialResult = async (classId: string, requestId?: string) => {
    if (!requestId) {
      toast.error("Lớp học thử này chưa gắn với yêu cầu học")
      return
    }
    try {
      await workflowService.resolveTrialResult(
        requestId,
        classId,
        {
          result,
          note,
          scheduleText,
          feePerSession: fee ? Number(fee) : undefined,
        },
        user
      )
      toast.success("Đã cập nhật kết quả học thử")
      setNote("")
      setScheduleText("")
      setFee("")
      refresh()
      refreshOperations()
    } catch (error) {
      toast.error("Không thể cập nhật", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại",
      })
    }
  }

  const updateClassStatus = async (classId: string, status: ClassStatus, reason?: string) => {
    setBusyId(classId)
    try {
      const result = await classService.updateClassStatus(classId, status, reason)
      if (result.success) {
        toast.success("Đã cập nhật lớp học")
        refresh()
        refreshOperations()
      } else toast.error(result.error)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Class operations"
        title="Lớp học"
        description="Theo dõi lớp học thử, lớp chính thức, session liên quan và xử lý kết quả học thử ngay tại console."
        icon={GraduationCap}
        stats={[
          { label: "Tổng lớp", value: pagination.total },
          { label: "Học thử", value: trialCount },
          { label: "Đang học", value: activeCount },
          { label: "Hoàn thành", value: completedCount },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <DashboardMetricCard label="Tổng lớp" value={pagination.total} icon={BookOpenCheck} tone="blue" />
        <DashboardMetricCard label="Học thử" value={trialCount} icon={TimerReset} tone="amber" />
        <DashboardMetricCard label="Đang học" value={activeCount} icon={CalendarDays} tone="emerald" />
        <DashboardMetricCard label="Hoàn thành" value={completedCount} icon={CheckCircle2} tone="slate" />
      </div>

      {classes.length ? classes.map((item) => {
        const classSessions = sessions.filter((session) => session.classId === item.id)
        const trialResultAvailability = getAdminActionAvailability(user, "class", "learningRequest.update", item.status, item)
        return (
          <EntityCard
            key={item.id}
            title={`${item.subject} · ${item.grade}`}
            subtitle={`${item.tutorName} · ${item.studentName}`}
            meta={`${formatCurrency(item.feePerSession)}/buổi · bắt đầu ${formatDate(item.startDate)}`}
            icon={GraduationCap}
            tone={item.status === "active" ? "emerald" : item.status === "trial" ? "amber" : item.status === "cancelled" ? "rose" : "blue"}
            badge={(
              <>
                <StatusBadge kind="class" status={item.status} />
                {item.learningRequestId && <Badge variant="secondary">{item.learningRequestId}</Badge>}
              </>
            )}
            actions={(
              <>
                <ClassDetailDialog item={item} sessionCount={classSessions.length} />
                {item.status === "trial" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <AdminActionButton availability={trialResultAvailability}>Xác nhận kết quả học thử</AdminActionButton>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Kết quả học thử</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Select value={result} onValueChange={(value) => setResult(value as "active" | "rematch" | "cancelled")}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Phù hợp, chuyển thành lớp chính thức</SelectItem>
                            <SelectItem value="rematch">Chưa phù hợp, cần gán gia sư khác</SelectItem>
                            <SelectItem value="cancelled">Hủy yêu cầu</SelectItem>
                          </SelectContent>
                        </Select>
                        {result === "active" && (
                          <>
                            <Input value={scheduleText} onChange={(event) => setScheduleText(event.target.value)} placeholder="Lịch học chính thức, ví dụ: Tối thứ 2, 4 19:00-21:00" />
                            <Input value={fee} onChange={(event) => setFee(event.target.value)} type="number" placeholder="Học phí chính thức mỗi buổi" />
                          </>
                        )}
                        <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi chú admin..." />
                      <Button onClick={() => submitTrialResult(item.id, item.learningRequestId)}>Lưu kết quả</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                )}
                {item.status === "active" && (
                  <ConfirmReasonDialog
                    trigger={<Button size="sm" variant="outline" disabled={!canManageClasses || busyId === item.id}>Tạm dừng</Button>}
                    title="Tạm dừng lớp học"
                    description="Dùng khi cần giữ lớp nhưng tạm ngưng lịch, thanh toán hoặc vận hành."
                    actionName="Tạm dừng"
                    severity="warning"
                    reasonOptions={[
                      { value: "SCHEDULE_PAUSE", label: "Tạm dừng do lịch học" },
                      { value: "PAYMENT_HOLD", label: "Tạm dừng do thanh toán" },
                      { value: "OTHER", label: "Lý do khác" },
                    ]}
                    onConfirm={(reason, noteValue) => updateClassStatus(item.id, "paused", noteValue || reason)}
                  />
                )}
                {["active", "paused"].includes(item.status) && (
                  <ConfirmReasonDialog
                    trigger={<Button size="sm" variant="outline" disabled={!canManageClasses || busyId === item.id}>Hoàn thành</Button>}
                    title="Hoàn thành lớp học"
                    description="Chỉ hoàn thành khi lớp đã kết thúc và session/payment liên quan đã được đối soát."
                    actionName="Hoàn thành lớp"
                    severity="warning"
                    reasonOptions={[
                      { value: "COURSE_COMPLETED", label: "Lớp học đã hoàn tất" },
                      { value: "ADMIN_RECONCILED", label: "Admin đã đối soát" },
                      { value: "OTHER", label: "Ghi chú khác" },
                    ]}
                    onConfirm={(reason, noteValue) => updateClassStatus(item.id, "completed", noteValue || reason)}
                  />
                )}
                {!["completed", "cancelled"].includes(item.status) && (
                  <ConfirmReasonDialog
                    trigger={<Button size="sm" variant="outline" disabled={!canManageClasses || busyId === item.id}>Hủy lớp</Button>}
                    title="Hủy lớp học"
                    description="Hủy lớp sẽ ảnh hưởng lịch học và vận hành tài chính, cần ghi rõ lý do."
                    actionName="Hủy lớp"
                    severity="danger"
                    reasonOptions={[
                      { value: "PARENT_CANCELLED", label: "Phụ huynh hủy" },
                      { value: "TUTOR_UNAVAILABLE", label: "Gia sư không còn phù hợp" },
                      { value: "DISPUTE", label: "Đang có khiếu nại" },
                      { value: "OTHER", label: "Lý do khác" },
                    ]}
                    onConfirm={(reason, noteValue) => updateClassStatus(item.id, "cancelled", noteValue || reason)}
                  />
                )}
              </>
            )}
          >
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{item.scheduleText || "Chưa có lịch chính thức"}</p>
              <div className="grid gap-2 md:grid-cols-2">
                {classSessions.slice(0, 4).map((session) => (
                  <div key={session.id} className="soft-panel bg-white p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <b>{session.isTrial ? "Học thử" : "Buổi học"}</b>
                      <StatusBadge kind="session" status={session.status} />
                    </div>
                    <p className="mt-1 text-muted-foreground">{new Date(session.startTime).toLocaleString("vi-VN")}</p>
                  </div>
                ))}
                {!classSessions.length && <div className="soft-panel border-dashed p-4 text-center text-sm text-muted-foreground">Chưa có buổi học nào trong lớp này.</div>}
              </div>
            </div>
          </EntityCard>
        )
      }) : (
        <EmptyState title="Chưa có lớp học nào" description="Lớp học thử sẽ được tạo khi gia sư chấp nhận booking." />
      )}
      <AdminPagination pagination={pagination} loading={isLoading} onPageChange={setPage} />
    </div>
  )
}

function ClassDetailDialog({ item, sessionCount }: { item: Class; sessionCount: number }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Chi tiết</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{item.subject} · {item.grade}</DialogTitle>
          <DialogDescription>Thông tin vận hành lớp để admin kiểm tra lịch, học phí, tiến độ và trạng thái.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Lớp" value={item.id} />
          <Info label="Trạng thái" value={item.status} />
          <Info label="Gia sư" value={item.tutorName} />
          <Info label="Học viên" value={item.studentName} />
          <Info label="Học phí/buổi" value={formatCurrency(item.feePerSession)} />
          <Info label="Số buổi" value={`${item.completedSessions}/${item.totalSessions} hoàn thành · ${sessionCount} session tải được`} />
          <Info label="Lịch" value={item.scheduleText || "Chưa có lịch"} />
          <Info label="Ngày bắt đầu" value={formatDate(item.startDate)} />
          <div className="rounded-lg border bg-slate-50 p-3 md:col-span-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Ghi chú</p>
            <p className="mt-1 text-sm leading-6 text-slate-900">{item.note || "Chưa có ghi chú"}</p>
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
