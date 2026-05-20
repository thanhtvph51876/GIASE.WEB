"use client"

import Link from "next/link"
import { BookOpen, Calendar, Star, Users, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useBookings } from "@/lib/hooks/use-bookings"
import { useClasses } from "@/lib/hooks/use-classes"
import { useTutorLearningRequests } from "@/lib/hooks/use-learning-requests"
import { useReviews } from "@/lib/hooks/use-reviews"
import { useSchedule } from "@/lib/hooks/use-schedule"
import { useTutorEarnings } from "@/lib/hooks/use-tutor-earnings"
import { useTutorProfileByUser } from "@/lib/hooks/use-tutors"
import { formatCurrency, formatDateTime, getStatusLabel } from "@/lib/helpers"

export default function TutorDashboardPage() {
  const { user } = useAuthContext()
  const { tutor } = useTutorProfileByUser(user?.id)
  const { bookings } = useBookings({ tutorId: tutor?.id, role: "tutor", user, tutorProfile: tutor })
  const { requests } = useTutorLearningRequests(tutor?.id)
  const { sessions } = useSchedule({ userId: tutor?.id || "", role: "tutor", actor: user })
  const { reviews } = useReviews(tutor?.id)
  const { totalEarnings } = useTutorEarnings(Boolean(tutor?.id))
  const { classes } = useClasses({ tutorId: tutor?.id, role: "tutor" })

  const income = totalEarnings
  const pending = bookings.filter((booking) => booking.status === "pending" || booking.status === "assigned").length + requests.filter((request) => request.status === "matched").length

  return (
    <div className="space-y-6">
      <div className="surface-panel overflow-hidden border-l-4 border-l-primary p-6">
        <p className="text-sm font-semibold text-primary">Xin chào, {user?.fullName}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Quản lý lớp dạy và hồ sơ gia sư</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Theo dõi yêu cầu mới, lịch dạy, thu nhập và đánh giá trong một dashboard.</p>
      </div>

      {tutor && tutor.approvalStatus !== "approved" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-amber-800">
            Hồ sơ của bạn đang ở trạng thái <b>{getStatusLabel("approval", tutor.approvalStatus)}</b>. Một số tính năng sẽ bị giới hạn cho đến khi admin duyệt.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat title="Lớp đang dạy" value={classes.filter((item) => item.status === "active" || item.status === "trial").length} icon={Users} />
        <Stat title="Buổi dạy tuần này" value={sessions.filter((s) => s.status === "upcoming").length} icon={Calendar} />
        <Stat title="Thu nhập tháng này" value={formatCurrency(income)} icon={Wallet} />
        <Stat title="Rating trung bình" value={(tutor?.rating || 0).toFixed(1)} icon={Star} />
        <Stat title="Yêu cầu mới" value={pending} icon={BookOpen} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Yêu cầu dạy học mới</CardTitle><CardDescription>Booking học thử và request được admin gán.</CardDescription></div>
            <Button variant="ghost" asChild><Link href="/dashboard/tutor/requests">Xem tất cả</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...bookings.filter((b) => b.status === "pending").slice(0, 3), ...requests.slice(0, 2)].length ? (
              <>
                {bookings.filter((b) => b.status === "pending" || b.status === "assigned").slice(0, 3).map((booking) => (
                  <div key={booking.id} className="item-row">
                    <p className="font-medium">{booking.studentName} · {booking.subject}</p>
                    <p className="text-sm text-muted-foreground">{booking.grade} · {booking.preferredTime}</p>
                  </div>
                ))}
                {requests.slice(0, 2).map((request) => (
                  <div key={request.id} className="item-row">
                    <p className="font-medium">{request.studentName} · {request.subject}</p>
                    <p className="text-sm text-muted-foreground">{request.grade} · {request.preferredSchedule || "Linh hoạt"}</p>
                  </div>
                ))}
              </>
            ) : <p className="text-sm text-muted-foreground">Chưa có yêu cầu mới.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Lịch dạy sắp tới</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {sessions.filter((s) => s.status === "upcoming").slice(0, 4).map((session) => (
              <div key={session.id} className="item-row flex items-center justify-between">
                <div>
                  <p className="font-medium">{session.subject} · {session.studentName}</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(session.startTime)}</p>
                </div>
                <StatusBadge kind="teachingMode" status={session.mode} />
              </div>
            ))}
            {!sessions.filter((s) => s.status === "upcoming").length && <p className="text-sm text-muted-foreground">Chưa có lịch dạy sắp tới.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Đánh giá gần đây</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="item-row">
              <div className="flex items-center gap-1 text-amber-500">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
              <p className="mt-2 text-sm font-medium">{review.studentName}</p>
            </div>
          ))}
          {!reviews.length && <p className="text-sm text-muted-foreground">Chưa có đánh giá.</p>}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ title, value, icon: Icon }: { title: string; value: string | number; icon: typeof Users }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
        <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  )
}
