"use client"

import Link from "next/link"
import { Children } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useAdminOperations, useTutorApprovalActions } from "@/lib/hooks/use-admin"
import { formatDateTime } from "@/lib/helpers"

export default function AdminOperationsPage() {
  const { user } = useAuthContext()
  const { data, refresh } = useAdminOperations()
  const { approveTutor } = useTutorApprovalActions(user, refresh)

  const tutors = data?.tutors || []
  const requests = data?.requests || []
  const bookings = data?.bookings || []
  const sessions = data?.sessions || []
  const classes = data?.classes || []
  const reviews = data?.reviews || []

  const pendingTutors = tutors.filter((tutor) => tutor.approvalStatus === "pending")
  const newRequests = requests.filter((request) => request.status === "new")
  const needAssign = requests.filter((request) => request.status === "new" || !request.assignedTutorId)
  const pendingBookings = bookings.filter((booking) => booking.status === "pending")
  const trialSessions = sessions.filter((session) => session.isTrial && session.status === "upcoming")
  const activeClasses = classes.filter((item) => item.status === "active")
  const qualityWarnings = reviews.filter((review) => review.rating <= 3)

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Trung tâm vận hành</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Điều phối hồ sơ, yêu cầu học, booking, học thử và cảnh báo chất lượng.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        <Metric label="Chờ duyệt" value={pendingTutors.length} />
        <Metric label="Yêu cầu mới" value={newRequests.length} />
        <Metric label="Cần gán" value={needAssign.length} />
        <Metric label="Booking chờ" value={pendingBookings.length} />
        <Metric label="Học thử" value={trialSessions.length} />
        <Metric label="Lớp active" value={activeClasses.length} />
        <Metric label="Cảnh báo" value={qualityWarnings.length} />
      </div>
      <Tabs defaultValue="pending-tutors" className="space-y-4">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="pending-tutors">Chờ duyệt gia sư</TabsTrigger>
          <TabsTrigger value="new-requests">Yêu cầu học mới</TabsTrigger>
          <TabsTrigger value="assign">Cần gán gia sư</TabsTrigger>
          <TabsTrigger value="bookings">Booking chờ xác nhận</TabsTrigger>
          <TabsTrigger value="trial">Lịch học thử</TabsTrigger>
          <TabsTrigger value="classes">Lớp đang học</TabsTrigger>
          <TabsTrigger value="quality">Cảnh báo chất lượng</TabsTrigger>
        </TabsList>

        <TabsContent value="pending-tutors"><List title="Hồ sơ gia sư chờ duyệt">{pendingTutors.map((tutor) => <Row key={tutor.id} title={tutor.fullName} meta={`${tutor.subjects.join(", ")} · ${tutor.university}`} badge={tutor.approvalStatus} badgeKind="approval" action={<Button size="sm" onClick={() => approveTutor(tutor.id)}>Duyệt nhanh</Button>} />)}</List></TabsContent>
        <TabsContent value="new-requests"><List title="Yêu cầu học mới">{newRequests.map((request) => <Row key={request.id} title={`${request.subject} · ${request.grade}`} meta={`${request.studentName} · ${request.phone}`} badge={request.status} badgeKind="learningRequest" action={<Button size="sm" asChild><Link href="/admin/learning-requests">Xử lý</Link></Button>} />)}</List></TabsContent>
        <TabsContent value="assign"><List title="Yêu cầu cần gán gia sư">{needAssign.map((request) => <Row key={request.id} title={request.requestCode} meta={`${request.subject} · ${request.grade} · ${request.location || "Online"}`} badge={request.status} badgeKind="learningRequest" action={<Button size="sm" asChild><Link href="/admin/learning-requests">Gán gia sư</Link></Button>} />)}</List></TabsContent>
        <TabsContent value="bookings"><List title="Booking chờ gia sư xác nhận">{pendingBookings.map((booking) => <Row key={booking.id} title={`${booking.studentName} · ${booking.subject}`} meta={booking.preferredTime} badge={booking.status} badgeKind="booking" />)}</List></TabsContent>
        <TabsContent value="trial"><List title="Lịch học thử">{trialSessions.map((session) => <Row key={session.id} title={`${session.subject} · ${session.studentName}`} meta={formatDateTime(session.startTime)} badge={session.status} badgeKind="session" action={<Button size="sm" asChild><Link href="/admin/classes">Xem lớp</Link></Button>} />)}</List></TabsContent>
        <TabsContent value="classes"><List title="Lớp đang học">{activeClasses.map((item) => <Row key={item.id} title={`${item.subject} · ${item.grade}`} meta={`${item.tutorName} · ${item.studentName}`} badge={item.status} badgeKind="class" action={<Button size="sm" asChild><Link href="/admin/classes">Quản lý</Link></Button>} />)}</List></TabsContent>
        <TabsContent value="quality"><List title="Cảnh báo chất lượng">{qualityWarnings.map((review) => <Row key={review.id} title={`${review.rating} sao từ ${review.studentName}`} meta={review.content} badge="Review thấp" action={<Button size="sm" asChild><Link href="/admin/reports">Xem báo cáo</Link></Button>} />)}</List></TabsContent>
      </Tabs>
    </div>
  )
}

function List({ title, children }: { title: string; children: React.ReactNode }) {
  const count = Children.count(children)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{count} mục cần theo dõi.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {count ? children : <div className="soft-panel border-dashed p-8 text-center text-sm text-muted-foreground">Không có việc cần xử lý.</div>}
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-tile p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  )
}

function Row({ title, meta, badge, badgeKind, action }: { title: string; meta: string; badge: string; badgeKind?: React.ComponentProps<typeof StatusBadge>["kind"]; action?: React.ReactNode }) {
  return (
    <div className="item-row grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{title}</p>
          {badgeKind ? <StatusBadge kind={badgeKind} status={badge} /> : <Badge variant="secondary">{badge}</Badge>}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
      </div>
      {action}
    </div>
  )
}
