"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarCheck, ClipboardList, Clock3, MessageSquare, UserCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { DashboardMetricCard, EmptyState, EntityCard, PageHero } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useBookings } from "@/lib/hooks/use-bookings"
import { useTutorLearningRequests } from "@/lib/hooks/use-learning-requests"
import { useTutorProfileByUser } from "@/lib/hooks/use-tutors"
import { messageService } from "@/lib/services"
import type { TeachingMode } from "@/types"

export default function TutorRequestsPage() {
  const { user } = useAuthContext()
  const router = useRouter()
  const { tutor } = useTutorProfileByUser(user?.id)
  const { bookings, acceptBooking, rejectBooking, refresh: refreshBookings } = useBookings({ tutorId: tutor?.id, role: "tutor", user, tutorProfile: tutor })
  const { requests, refresh: refreshRequests } = useTutorLearningRequests(tutor?.id)
  const [reason, setReason] = useState("")
  const [schedule, setSchedule] = useState({
    date: "",
    startTime: "",
    endTime: "",
    mode: "online" as TeachingMode,
    location: "",
    note: "",
  })

  const refreshAll = () => {
    refreshBookings()
    refreshRequests()
  }

  const accept = async (id: string) => {
    const ok = await acceptBooking(id, schedule)
    if (ok) {
      toast.success("Đã chấp nhận yêu cầu và tạo lịch học thử")
      setSchedule({ date: "", startTime: "", endTime: "", mode: "online", location: "", note: "" })
      refreshAll()
    }
  }

  const reject = async (id: string) => {
    const ok = await rejectBooking(id, reason || "Lịch dạy chưa phù hợp")
    if (ok) {
      toast.success("Đã từ chối yêu cầu")
      setReason("")
      refreshAll()
    }
  }

  const openChat = async (bookingId: string) => {
    try {
      const conversation = await messageService.createConversation({ type: "booking", bookingId })
      router.push(`/dashboard/tutor/messages?conversationId=${conversation.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể mở hội thoại")
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Tutor operations"
        title="Yêu cầu dạy học"
        description="Xử lý booking học thử, xác nhận lịch dạy và theo dõi request được admin gán cho hồ sơ của bạn."
        icon={ClipboardList}
        stats={[
          { label: "Booking", value: bookings.length },
          { label: "Request được gán", value: requests.length },
          { label: "Chờ phản hồi", value: bookings.filter((booking) => booking.status === "pending" || booking.status === "assigned").length },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Booking" value={bookings.length} icon={CalendarCheck} tone="blue" />
        <DashboardMetricCard label="Request được gán" value={requests.length} icon={UserCheck} tone="emerald" />
        <DashboardMetricCard label="Chờ phản hồi" value={bookings.filter((booking) => booking.status === "pending" || booking.status === "assigned").length} icon={Clock3} tone="amber" />
      </div>
      <div className="grid gap-4">
        {bookings.map((booking) => (
          <EntityCard
            key={booking.id}
            title={`${booking.studentName} · ${booking.subject}`}
            subtitle={`${booking.grade} · ${booking.phone} · ${booking.preferredTime}`}
            meta={booking.email || "Booking học thử"}
            icon={CalendarCheck}
            tone={booking.status === "pending" ? "amber" : booking.status === "accepted" || booking.status === "scheduled" ? "emerald" : "blue"}
            badge={<StatusBadge kind="booking" status={booking.status} />}
            actions={(
              <>
                {(booking.status === "pending" || booking.status === "assigned") && (
                  <>
                  <Dialog>
                    <DialogTrigger asChild><Button>Chấp nhận</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Xác nhận lịch học thử</DialogTitle></DialogHeader>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2"><Label>Ngày học thử</Label><Input type="date" value={schedule.date} onChange={(e) => setSchedule((current) => ({ ...current, date: e.target.value }))} /></div>
                        <div className="space-y-2"><Label>Hình thức học</Label><Select value={schedule.mode} onValueChange={(value) => setSchedule((current) => ({ ...current, mode: value as TeachingMode }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="online">Online</SelectItem><SelectItem value="offline">Offline</SelectItem><SelectItem value="both">Cả hai</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label>Giờ bắt đầu</Label><Input type="time" value={schedule.startTime} onChange={(e) => setSchedule((current) => ({ ...current, startTime: e.target.value }))} /></div>
                        <div className="space-y-2"><Label>Giờ kết thúc</Label><Input type="time" value={schedule.endTime} onChange={(e) => setSchedule((current) => ({ ...current, endTime: e.target.value }))} /></div>
                        <div className="space-y-2 sm:col-span-2"><Label>Địa điểm hoặc link học online</Label><Input value={schedule.location} onChange={(e) => setSchedule((current) => ({ ...current, location: e.target.value }))} placeholder="Địa chỉ học offline hoặc link học online" /></div>
                        <div className="space-y-2 sm:col-span-2"><Label>Ghi chú cho học sinh/phụ huynh</Label><Textarea value={schedule.note} onChange={(e) => setSchedule((current) => ({ ...current, note: e.target.value }))} placeholder="Dặn dò trước buổi học thử..." /></div>
                      </div>
                      <Button onClick={() => accept(booking.id)}>Xác nhận lịch học thử</Button>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild><Button variant="outline">Từ chối</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Lý do từ chối</DialogTitle></DialogHeader>
                      <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Nhập lý do..." />
                      <Button onClick={() => reject(booking.id)}>Xác nhận từ chối</Button>
                    </DialogContent>
                  </Dialog>
                  </>
                )}
                {!["cancelled", "rejected", "expired"].includes(booking.status) && (
                  <Button variant="outline" onClick={() => openChat(booking.id)}>
                    <MessageSquare className="size-4" />Nhắn tin
                  </Button>
                )}
              </>
            )}
          >
            {booking.message && <p className="text-sm leading-6 text-slate-700">{booking.message}</p>}
          </EntityCard>
        ))}
        {requests.map((request) => (
          <EntityCard
            key={request.id}
            title={`${request.studentName} · ${request.subject}`}
            subtitle={`${request.requestCode} · ${request.grade} · ${request.preferredSchedule || "Linh hoạt"}`}
            meta={request.note || "Request được gán"}
            icon={ClipboardList}
            tone={request.status === "active" ? "emerald" : request.status === "cancelled" ? "rose" : "blue"}
            badge={<StatusBadge kind="learningRequest" status={request.status} />}
          />
        ))}
        {!bookings.length && !requests.length && (
          <EmptyState title="Chưa có yêu cầu dạy học" description="Booking học thử và request admin gán sẽ xuất hiện tại đây." />
        )}
      </div>
    </div>
  )
}
