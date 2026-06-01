"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CalendarCheck, CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react"
import { toast } from "sonner"
import { AdminActionButton } from "@/components/admin/admin-action-button"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/ui/status-badge"
import { DashboardMetricCard, EmptyState, EntityCard, PageHero } from "@/components/platform/operational-components"
import { getAdminActionAvailability } from "@/lib/admin/admin-actions"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { bookingService } from "@/lib/services"
import { formatDateTime } from "@/lib/helpers"
import type { TrialBooking } from "@/types"

export default function AdminBookingsPage() {
  const { user } = useAuthContext()
  const activeId = useSearchParams().get("id")
  const [bookings, setBookings] = useState<TrialBooking[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [assignTutorId, setAssignTutorId] = useState("")
  const load = async () => setBookings(await bookingService.getAllBookings())
  useEffect(() => { load() }, [])

  const complete = async (id: string, note: string) => {
    setBusyId(id)
    try {
      const result = await bookingService.completeTrial(id, note)
      if (result.success) { toast.success("Đã hoàn tất học thử"); load() } else toast.error(result.error)
    } finally {
      setBusyId(null)
    }
  }
  const convert = async (id: string) => {
    setBusyId(id)
    try {
      const result = await bookingService.convertToClass(id)
      if (result.success) { toast.success("Đã convert thành lớp chính thức"); load() } else toast.error(result.error)
    } finally {
      setBusyId(null)
    }
  }
  const cancel = async (id: string, reason: string) => {
    setBusyId(id)
    try {
      const result = await bookingService.cancelBookingByAdmin(id, reason)
      if (result.success) { toast.success("Đã hủy booking"); load() } else toast.error(result.error)
    } finally {
      setBusyId(null)
    }
  }
  const assignTutor = async (id: string) => {
    if (!assignTutorId.trim()) {
      toast.error("Vui lòng nhập Tutor ID")
      return
    }
    setBusyId(id)
    try {
      const result = await bookingService.assignTutorByAdmin(id, assignTutorId.trim())
      if (result.success) {
        toast.success("Đã gán lại gia sư cho booking")
        setAssignTutorId("")
        load()
      } else toast.error(result.error)
    } finally {
      setBusyId(null)
    }
  }
  const noShow = async (id: string, actor: "student" | "tutor", note: string) => {
    setBusyId(id)
    try {
      const result = actor === "student"
        ? await bookingService.markStudentNoShow(id, note)
        : await bookingService.markTutorNoShow(id, note)
      if (result.success) { toast.success("Đã ghi nhận no-show"); load() } else toast.error(result.error)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Trial operations"
        title="Booking học thử"
        description="Theo dõi booking chờ phản hồi, xác nhận kết quả học thử và chuyển đổi thành lớp chính thức."
        icon={CalendarCheck}
        stats={[
          { label: "Tổng booking", value: bookings.length },
          { label: "Chờ phản hồi", value: bookings.filter((item) => item.status === "pending").length },
          { label: "Đã học thử", value: bookings.filter((item) => item.status === "completed").length },
          { label: "Converted", value: bookings.filter((item) => item.status === "converted").length },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardMetricCard label="Tổng booking" value={bookings.length} icon={CalendarCheck} tone="blue" />
        <DashboardMetricCard label="Chờ phản hồi" value={bookings.filter((item) => item.status === "pending").length} icon={Clock3} tone="amber" />
        <DashboardMetricCard label="Đã học thử" value={bookings.filter((item) => item.status === "completed").length} icon={CheckCircle2} tone="emerald" />
        <DashboardMetricCard label="Converted" value={bookings.filter((item) => item.status === "converted").length} icon={RefreshCw} tone="slate" />
      </div>
      {bookings.length ? (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const completeAvailability = getAdminActionAvailability(user, "booking", "booking.complete", booking.status, booking)
            const convertAvailability = getAdminActionAvailability(user, "booking", "booking.convert", booking.status, booking)
            const cancelAvailability = getAdminActionAvailability(user, "booking", "booking.cancel", booking.status, booking)
            return (
              <EntityCard
                key={booking.id}
                title={`${booking.studentName} · ${booking.subject}`}
                subtitle={`${booking.grade} · ${booking.preferredTime} · tutor: ${booking.tutorId}`}
                meta={booking.schedule ? `${booking.schedule.date} · ${booking.schedule.startTime}-${booking.schedule.endTime}` : booking.phone}
                icon={booking.status === "cancelled" || booking.status === "rejected" ? XCircle : CalendarCheck}
                tone={booking.status === "cancelled" || booking.status === "rejected" ? "rose" : booking.status === "pending" ? "amber" : booking.status === "converted" ? "emerald" : "blue"}
                badge={<StatusBadge kind="booking" status={booking.status} />}
                className={activeId === booking.id ? "border-primary/60" : undefined}
                actions={(
                  <>
                    <BookingDetailDialog booking={booking} />
                    <Dialog>
                      <DialogTrigger asChild>
                        <AdminActionButton size="sm" variant="outline" disabled={busyId === booking.id} availability={cancelAvailability}>Gán lại GS</AdminActionButton>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Gán lại gia sư cho booking</DialogTitle>
                          <DialogDescription>Dùng khi tutor cũ từ chối, no-show hoặc không còn lịch phù hợp.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          <Label>Tutor ID mới</Label>
                          <Input value={assignTutorId} onChange={(event) => setAssignTutorId(event.target.value)} placeholder="Nhập tutorId đã được duyệt" />
                          <Button disabled={busyId === booking.id || !assignTutorId.trim()} onClick={() => assignTutor(booking.id)}>Xác nhận gán</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <ConfirmReasonDialog
                      trigger={<AdminActionButton size="sm" variant="outline" disabled={busyId === booking.id} availability={completeAvailability}>Hoàn tất học thử</AdminActionButton>}
                      title="Hoàn tất booking học thử"
                      description="Chỉ xác nhận khi buổi học thử đã diễn ra theo lịch. Trạng thái này có thể mở bước convert lớp."
                      actionName="Hoàn tất"
                      severity="warning"
                      reasonOptions={[
                        { value: "TRIAL_COMPLETED", label: "Học thử đã hoàn tất" },
                        { value: "ADMIN_CONFIRMED", label: "Admin xác nhận sau đối soát" },
                        { value: "OTHER", label: "Ghi chú khác" },
                      ]}
                      onConfirm={(reason, note) => complete(booking.id, note || reason)}
                    />
                    <ConfirmReasonDialog
                      trigger={<AdminActionButton size="sm" disabled={busyId === booking.id} availability={convertAvailability}>Convert lớp</AdminActionButton>}
                      title="Chuyển booking thành lớp"
                      description="Backend sẽ kiểm tra idempotency để tránh tạo trùng lớp khi thao tác lặp."
                      actionName="Convert lớp"
                      severity="warning"
                      reasonOptions={[
                        { value: "PARENT_CONFIRMED", label: "Phụ huynh xác nhận học tiếp" },
                        { value: "TRIAL_SUCCESSFUL", label: "Kết quả học thử phù hợp" },
                        { value: "OTHER", label: "Ghi chú khác" },
                      ]}
                      onConfirm={() => convert(booking.id)}
                    />
                    <ConfirmReasonDialog
                      trigger={<AdminActionButton size="sm" variant="outline" disabled={busyId === booking.id} availability={cancelAvailability}>HV no-show</AdminActionButton>}
                      title="Ghi nhận học viên no-show"
                      description="Dùng để khóa luồng học thử, phục vụ đối soát lịch và xử lý khiếu nại."
                      actionName="Ghi nhận no-show"
                      severity="warning"
                      reasonOptions={[
                        { value: "STUDENT_NO_SHOW", label: "Học viên không tham gia" },
                        { value: "PARENT_NO_RESPONSE", label: "Phụ huynh không phản hồi" },
                        { value: "OTHER", label: "Lý do khác" },
                      ]}
                      onConfirm={(reason, note) => noShow(booking.id, "student", note || reason)}
                    />
                    <ConfirmReasonDialog
                      trigger={<AdminActionButton size="sm" variant="outline" disabled={busyId === booking.id} availability={cancelAvailability}>GS no-show</AdminActionButton>}
                      title="Ghi nhận gia sư no-show"
                      description="Dùng để mở bước rematch/gán lại và phục vụ đánh giá chất lượng gia sư."
                      actionName="Ghi nhận no-show"
                      severity="warning"
                      reasonOptions={[
                        { value: "TUTOR_NO_SHOW", label: "Gia sư không tham gia" },
                        { value: "TUTOR_UNAVAILABLE", label: "Gia sư báo không còn lịch" },
                        { value: "OTHER", label: "Lý do khác" },
                      ]}
                      onConfirm={(reason, note) => noShow(booking.id, "tutor", note || reason)}
                    />
                    <ConfirmReasonDialog
                      trigger={<AdminActionButton size="sm" variant="outline" disabled={busyId === booking.id} availability={cancelAvailability}>Hủy</AdminActionButton>}
                      title="Hủy booking"
                      description="Booking bị hủy sẽ dừng luồng học thử hiện tại và ghi lý do vào audit nếu backend hỗ trợ."
                      actionName="Hủy booking"
                      severity="danger"
                      reasonOptions={[
                        { value: "SCHEDULE_CONFLICT", label: "Trùng lịch hoặc không xếp được lịch" },
                        { value: "PARENT_REQUEST", label: "Phụ huynh yêu cầu hủy" },
                        { value: "TUTOR_UNAVAILABLE", label: "Gia sư không còn phù hợp" },
                        { value: "OTHER", label: "Lý do khác" },
                      ]}
                      onConfirm={(reason, note) => cancel(booking.id, note || reason)}
                    />
                  </>
                )}
              >
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <span>Học viên: {booking.studentName}</span>
                  <span>Liên hệ: {booking.phone}</span>
                  {booking.message && <span className="sm:col-span-2">Mục tiêu: {booking.message}</span>}
                  {booking.resultNote && <span className="text-slate-700 sm:col-span-2">Kết quả: {booking.resultNote}</span>}
                </div>
              </EntityCard>
            )
          })}
        </div>
      ) : (
        <EmptyState title="Chưa có booking học thử" description="Booking sẽ xuất hiện khi học viên đặt học thử hoặc admin tạo từ yêu cầu học." />
      )}
    </div>
  )
}

function BookingDetailDialog({ booking }: { booking: TrialBooking }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Chi tiết</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{booking.studentName} · {booking.subject}</DialogTitle>
          <DialogDescription>Thông tin học thử để admin quyết định hoàn tất, convert, gán lại hoặc no-show.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Booking ID" value={booking.id} />
          <Info label="Trạng thái" value={booking.status} />
          <Info label="Gia sư" value={booking.tutorId} />
          <Info label="Yêu cầu học" value={booking.learningRequestId || "Không gắn"} />
          <Info label="Liên hệ" value={[booking.phone, booking.email].filter(Boolean).join(" · ")} />
          <Info label="Lịch ưu tiên" value={booking.preferredTime || "Chưa có"} />
          <Info label="Lịch học thử" value={booking.schedule ? `${booking.schedule.date} ${booking.schedule.startTime}-${booking.schedule.endTime} · ${booking.schedule.mode}` : "Chưa xếp lịch"} />
          <Info label="Tạo lúc" value={formatDateTime(booking.createdAt)} />
          <div className="rounded-lg border bg-slate-50 p-3 md:col-span-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Ghi chú / kết quả</p>
            <p className="mt-1 text-sm leading-6 text-slate-900">{booking.resultNote || booking.message || booking.rejectReason || "Chưa có ghi chú"}</p>
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
