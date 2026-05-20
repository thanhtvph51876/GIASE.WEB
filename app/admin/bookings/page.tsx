"use client"

import { useEffect, useState } from "react"
import { CalendarCheck, CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { DashboardMetricCard, EmptyState, EntityCard, PageHero } from "@/components/platform/operational-components"
import { bookingService } from "@/lib/services"
import type { TrialBooking } from "@/types"

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<TrialBooking[]>([])
  const load = async () => setBookings(await bookingService.getAllBookings())
  useEffect(() => { load() }, [])

  const complete = async (id: string) => {
    const result = await bookingService.completeTrial(id, "Admin xác nhận học thử đã hoàn tất")
    if (result.success) { toast.success("Đã hoàn tất học thử"); load() } else toast.error(result.error)
  }
  const convert = async (id: string) => {
    const result = await bookingService.convertToClass(id)
    if (result.success) { toast.success("Đã convert thành lớp chính thức"); load() } else toast.error(result.error)
  }
  const cancel = async (id: string) => {
    const result = await bookingService.updateBookingStatus(id, "cancelled")
    if (result.success) { toast.success("Đã hủy booking"); load() } else toast.error(result.error)
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
          {bookings.map((booking) => (
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
                  <Button size="sm" variant="outline" onClick={() => complete(booking.id)}>Hoàn tất học thử</Button>
                  <Button size="sm" onClick={() => convert(booking.id)}>Convert lớp</Button>
                  <Button size="sm" variant="outline" onClick={() => cancel(booking.id)}>Hủy</Button>
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
          ))}
        </div>
      ) : (
        <EmptyState title="Chưa có booking học thử" description="Booking sẽ xuất hiện khi học viên đặt học thử hoặc admin tạo từ yêu cầu học." />
      )}
    </div>
  )
}
