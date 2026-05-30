"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarCheck, Clock3, ClipboardCheck, MessageSquare, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { ConfirmReasonDialog, type ReasonOption } from "@/components/dashboard/confirm-reason-dialog"
import { DashboardMetricCard, EmptyState, EntityCard, ErrorState, InsightPanel, LoadingSkeleton, PageHero } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useBookings } from "@/lib/hooks/use-bookings"
import { bookingService, messageService } from "@/lib/services"
import { canCancelBooking, getNormalizedBookingStatusLabel } from "@/lib/helpers"

const cancelReasons: ReasonOption[] = [
  { value: "SCHEDULE_CHANGED", label: "Lịch học không còn phù hợp" },
  { value: "FOUND_ANOTHER_TUTOR", label: "Đã chọn gia sư khác" },
  { value: "NO_LONGER_NEEDED", label: "Không còn nhu cầu học thử" },
  { value: "OTHER", label: "Lý do khác" },
]

export default function StudentBookingsPage() {
  const { user } = useAuthContext()
  const router = useRouter()
  const { bookings, isLoading, error, refresh } = useBookings({ userId: user?.id, role: "student" })

  const cancel = async (id: string, reason: string, note: string) => {
    const finalReason = reason === "OTHER" ? note : `${reason}${note ? `: ${note}` : ""}`
    const result = await bookingService.updateBookingStatus(id, "cancelled", finalReason)
    if (result.success) {
      toast.success("Đã hủy booking học thử")
      refresh()
    } else {
      toast.error(result.error || "Không thể hủy booking")
    }
  }

  const openChat = async (bookingId: string) => {
    try {
      const conversation = await messageService.createConversation({ type: "booking", bookingId })
      router.push(`/dashboard/student/messages?conversationId=${conversation.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể mở hội thoại")
    }
  }

  if (isLoading) return <LoadingSkeleton label="Đang tải booking học thử..." />
  if (error) return <ErrorState message="Không tải được booking học thử." onRetry={() => refresh()} />

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Trial booking"
        title="Booking học thử"
        description="Theo dõi trạng thái phản hồi của gia sư, lịch học thử đã chốt và các booking cần hủy hoặc xử lý tiếp."
        icon={CalendarCheck}
        actions={<Button asChild><Link href="/tutors">Đặt học thử mới</Link></Button>}
        stats={[
          { label: "Tổng booking", value: bookings.length },
          { label: "Chờ xác nhận", value: bookings.filter((item) => item.status === "pending").length },
          { label: "Đã lên lịch", value: bookings.filter((item) => ["accepted", "scheduled"].includes(item.status)).length },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Tổng booking" value={bookings.length} icon={ClipboardCheck} tone="blue" />
        <DashboardMetricCard label="Chờ xác nhận" value={bookings.filter((item) => item.status === "pending").length} icon={Clock3} tone="amber" />
        <DashboardMetricCard label="Đã lên lịch" value={bookings.filter((item) => ["accepted", "scheduled"].includes(item.status)).length} icon={CalendarCheck} tone="emerald" />
      </div>
      <InsightPanel title="Theo dõi học thử" description="Khi gia sư xác nhận hoặc admin lên lịch, booking sẽ tự cập nhật và tạo thông báo trong notification center." href="/dashboard/student/notifications" />
      {bookings.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {bookings.map((booking) => (
            <EntityCard
              key={booking.id}
              title={`${booking.subject} · ${booking.grade}`}
              subtitle={`${booking.studentName} · ${booking.preferredTime}`}
              meta={booking.schedule ? `${booking.schedule.date} · ${booking.schedule.startTime}-${booking.schedule.endTime}` : booking.phone}
              icon={booking.status === "cancelled" || booking.status === "rejected" ? XCircle : CalendarCheck}
              tone={booking.status === "cancelled" || booking.status === "rejected" ? "rose" : booking.status === "pending" || booking.status === "assigned" ? "amber" : "emerald"}
              badge={<StatusBadge kind="booking" status={booking.status} />}
              actions={(
                <>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/dashboard/student/schedule">Xem lịch</Link>
                  </Button>
                  {!["cancelled", "rejected", "expired"].includes(booking.status) && (
                    <Button size="sm" variant="outline" onClick={() => openChat(booking.id)}>
                      <MessageSquare className="size-4" />Nhắn tin
                    </Button>
                  )}
                  {canCancelBooking(booking.status) && (
                    <ConfirmReasonDialog
                      confirmLabel="Hủy booking"
                      description={`Booking đang ở trạng thái ${getNormalizedBookingStatusLabel(booking.status)}. Hủy booking có thể ảnh hưởng lịch học và thanh toán liên quan.`}
                      onConfirm={(reason, note) => cancel(booking.id, reason, note)}
                      reasonLabel="Lý do hủy"
                      reasons={cancelReasons}
                      requireReason
                      title="Xác nhận hủy booking học thử"
                      trigger={<Button size="sm" variant="outline">Hủy</Button>}
                    />
                  )}
                </>
              )}
            >
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <span>Liên hệ: {booking.phone}</span>
                <span>Email: {booking.email || "Chưa có"}</span>
                {booking.rejectReason && <span className="text-red-600 sm:col-span-2">Lý do từ chối: {booking.rejectReason}</span>}
                {booking.resultNote && <span className="text-slate-700 sm:col-span-2">Kết quả: {booking.resultNote}</span>}
              </div>
            </EntityCard>
          ))}
        </div>
      ) : (
        <EmptyState title="Chưa có booking học thử" description="Bạn có thể đặt học thử từ hồ sơ gia sư phù hợp." actionLabel="Tìm gia sư" href="/tutors" />
      )}
    </div>
  )
}
