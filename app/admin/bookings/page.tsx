"use client"

import { useEffect, useState } from "react"
import { CalendarCheck, CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react"
import { toast } from "sonner"
import { AdminActionButton } from "@/components/admin/admin-action-button"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { DashboardMetricCard, EmptyState, EntityCard, PageHero } from "@/components/platform/operational-components"
import { getAdminActionAvailability } from "@/lib/admin/admin-actions"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { bookingService } from "@/lib/services"
import type { TrialBooking } from "@/types"

export default function AdminBookingsPage() {
  const { user } = useAuthContext()
  const [bookings, setBookings] = useState<TrialBooking[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
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
      const result = await bookingService.updateBookingStatus(id, "cancelled", reason)
      if (result.success) { toast.success("Đã hủy booking"); load() } else toast.error(result.error)
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
                actions={(
                  <>
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
