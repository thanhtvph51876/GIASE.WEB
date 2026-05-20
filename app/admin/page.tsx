"use client"

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { AlertTriangle, BookOpen, CalendarDays, GraduationCap, Star, Users, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { formatCurrency, formatDateTime } from "@/lib/helpers"
import { useAdminDashboard } from "@/lib/hooks/use-admin"

export default function AdminDashboardPage() {
  const { data } = useAdminDashboard()
  const stats = data?.stats
  const reports = data?.reports
  const pendingTutors = data?.pendingTutors || []
  const requests = data?.requests || []
  const sessions = data?.sessions || []
  const bookings = data?.bookings || []
  const reviews = data?.reviews || []
  const tasks = [
    ...pendingTutors.map((tutor) => ({ id: tutor.id, title: `Duyệt hồ sơ ${tutor.fullName}`, meta: tutor.university, badge: "Hồ sơ", priority: 1 })),
    ...requests.filter((request) => request.status === "new" || !request.assignedTutorId).map((request) => ({ id: request.id, title: `Gán gia sư cho ${request.subject} · ${request.grade}`, meta: `${request.studentName} · ${request.phone}`, badge: "Yêu cầu", priority: 2 })),
    ...bookings.filter((booking) => booking.status === "rejected").map((booking) => ({ id: booking.id, title: `Booking bị từ chối: ${booking.studentName}`, meta: booking.rejectReason || booking.subject, badge: "Cần gán lại", priority: 3 })),
    ...sessions.filter((session) => session.isTrial && session.status === "completed").map((session) => ({ id: session.id, title: `Xác nhận kết quả học thử ${session.subject}`, meta: `${session.studentName} · ${formatDateTime(session.startTime)}`, badge: "Học thử", priority: 4 })),
    ...reviews.filter((review) => review.rating <= 3).map((review) => ({ id: review.id, title: `Review thấp từ ${review.studentName}`, meta: `${review.rating} sao · ${review.content}`, badge: "Chất lượng", priority: 5 })),
  ].sort((a, b) => a.priority - b.priority)

  return (
    <div className="space-y-6">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Quản lý hệ thống gia sư tập trung</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Theo dõi yêu cầu học, duyệt hồ sơ và kết nối gia sư phù hợp.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        <Stat title="Chờ duyệt" value={stats?.pendingTutors || 0} icon={GraduationCap} />
        <Stat title="Yêu cầu mới" value={stats?.newRequests || 0} icon={BookOpen} />
        <Stat title="Cần gán" value={stats?.pendingAssignments || 0} icon={AlertTriangle} />
        <Stat title="Booking chờ" value={stats?.pendingBookings || 0} icon={CalendarDays} />
        <Stat title="Học thử sắp tới" value={stats?.upcomingTrialSessions || 0} icon={CalendarDays} />
        <Stat title="Lớp đang học" value={stats?.activeClasses || 0} icon={Users} />
        <Stat title="Review mới" value={stats?.newReviews || 0} icon={Star} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Tổng gia sư" value={stats?.totalTutors || 0} icon={GraduationCap} />
        <Stat title="Học sinh" value={stats?.totalStudents || 0} icon={Users} />
        <Stat title="Lớp học thử" value={stats?.trialClasses || 0} icon={CalendarDays} />
        <Stat title="Doanh thu" value={formatCurrency(stats?.totalRevenue || 0)} icon={Wallet} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Việc cần xử lý</CardTitle>
          <CardDescription>Các tác vụ vận hành được sắp theo độ ưu tiên.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.slice(0, 8).length ? tasks.slice(0, 8).map((task) => (
            <Row key={`${task.badge}-${task.id}`} title={task.title} meta={task.meta} badge={task.badge} />
          )) : <p className="soft-panel border-dashed p-6 text-center text-sm text-muted-foreground">Hôm nay chưa có việc cần xử lý.</p>}
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Số yêu cầu học theo tháng</CardTitle>
            <CardDescription>Theo dõi nhịp tăng trưởng nhu cầu học.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports?.requestsByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ Online/Offline</CardTitle>
            <CardDescription>Phân bổ hình thức học đang được chọn.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={reports?.teachingModeRatio || []} dataKey="count" nameKey="mode" outerRadius={110} label>
                  {(reports?.teachingModeRatio || []).map((_, index) => <Cell key={index} fill={["#2563eb", "#10b981", "#f59e0b"][index % 3]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Hồ sơ gia sư chờ duyệt" description="Các hồ sơ pending mới nhất">
          {pendingTutors.slice(0, 5).map((tutor) => <Row key={tutor.id} title={tutor.fullName} meta={`${tutor.subjects.join(", ")} · ${tutor.university}`} badge={tutor.approvalStatus} badgeKind="approval" />)}
        </Panel>
        <Panel title="Yêu cầu học mới" description="Lead cần tư vấn">
          {requests.filter((r) => r.status === "new").slice(0, 5).map((request) => <Row key={request.id} title={`${request.subject} · ${request.grade}`} meta={`${request.studentName} · ${request.phone}`} badge={request.status} badgeKind="learningRequest" />)}
        </Panel>
        <Panel title="Lớp học sắp tới" description="Các session upcoming">
          {sessions.filter((s) => s.status === "upcoming").slice(0, 5).map((session) => <Row key={session.id} title={`${session.subject} · ${session.studentName}`} meta={formatDateTime(session.startTime)} badge={session.mode} badgeKind="teachingMode" />)}
        </Panel>
      </div>
    </div>
  )
}

function Stat({ title, value, icon: Icon }: { title: string; value: string | number; icon: typeof GraduationCap }) {
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

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {children || <div className="soft-panel border-dashed p-6 text-center text-sm text-muted-foreground">Không có dữ liệu.</div>}
      </CardContent>
    </Card>
  )
}

function Row({ title, meta, badge, badgeKind }: { title: string; meta: string; badge: string; badgeKind?: React.ComponentProps<typeof StatusBadge>["kind"] }) {
  return <div className="item-row p-3"><div className="flex items-center justify-between gap-2"><p className="font-semibold text-slate-800">{title}</p>{badgeKind ? <StatusBadge kind={badgeKind} status={badge} /> : <Badge variant="secondary">{badge}</Badge>}</div><p className="mt-1 text-sm text-muted-foreground">{meta}</p></div>
}
