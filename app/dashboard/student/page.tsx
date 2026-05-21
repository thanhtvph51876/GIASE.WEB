"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, Calendar, Heart, ShieldCheck, Star, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { TutorCard } from "@/components/tutor"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useClasses } from "@/lib/hooks/use-classes"
import { useLearningRequests } from "@/lib/hooks/use-learning-requests"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { useSchedule } from "@/lib/hooks/use-schedule"
import { useFavorites, useTutors } from "@/lib/hooks/use-tutors"
import { useStudentVerifications } from "@/lib/hooks/use-verifications"
import { formatDateTime } from "@/lib/helpers"

export default function StudentDashboardPage() {
  const { user } = useAuthContext()
  const { requests, isLoading: requestsLoading } = useLearningRequests(user?.id)
  const { sessions, isLoading: sessionsLoading } = useSchedule({ userId: user?.id || "", role: "student", actor: user })
  const { favoriteTutors: favorites } = useFavorites(user?.id)
  const { notifications } = useNotifications(user?.id)
  const { classes } = useClasses({ userId: user?.id, role: "student" })
  const { latest: verification } = useStudentVerifications(Boolean(user))
  const { tutors: recommendedTutors } = useTutors({
    initialFilters: { verified: true },
    initialSortBy: "rating_desc",
  })
  const loading = requestsLoading || sessionsLoading

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-lg" />)}
        </div>
      </div>
    )
  }

  const upcomingSessions = sessions.filter((session) => session.status === "upcoming")
  const activeTutors = new Set(classes.filter((item) => item.status === "active" || item.status === "trial").map((item) => item.tutorId)).size

  return (
    <div className="space-y-6">
      <div className="surface-panel overflow-hidden border-l-4 border-l-primary p-6">
        <p className="text-sm font-semibold text-primary">Xin chào, {user?.fullName}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Đồng hành cùng phụ huynh trong hành trình học tập của con</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Theo dõi yêu cầu học, lịch học sắp tới và các gia sư phù hợp ngay trong dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Yêu cầu đã gửi" value={requests.length} icon={BookOpen} />
        <Stat title="Gia sư đang học" value={activeTutors} icon={Users} />
        <Stat title="Buổi học sắp tới" value={upcomingSessions.length} icon={Calendar} />
        <Stat title="Gia sư đã lưu" value={favorites.length} icon={Heart} />
      </div>

      <Card className="border-slate-200">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">Xác thực học sinh</p>
                <StatusBadge kind="verification" status={verification?.status || "draft"} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {verification?.status === "approved"
                  ? "Tài khoản đã được duyệt xác thực."
                  : verification?.status === "pending_review"
                    ? "Hồ sơ đang chờ admin duyệt."
                    : verification?.rejectReason || "Hoàn tất thẻ sinh viên để mở các thao tác nhạy cảm."}
              </p>
            </div>
          </div>
          <Button asChild variant={verification?.status === "approved" ? "outline" : "default"}>
            <Link href="/dashboard/student/verification">{verification?.status === "approved" ? "Xem hồ sơ" : "Xác thực ngay"}</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Yêu cầu học gần đây</CardTitle>
              <CardDescription>Trạng thái được đồng bộ từ service layer.</CardDescription>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/dashboard/student/requests">
                Xem tất cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.slice(0, 4).length ? requests.slice(0, 4).map((request) => (
              <div key={request.id} className="item-row flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{request.subject} · {request.grade}</p>
                  <p className="text-sm text-muted-foreground">{request.requestCode} · {request.preferredSchedule || "Linh hoạt"}</p>
                </div>
                <StatusBadge kind="learningRequest" status={request.status} />
              </div>
            )) : (
              <Empty text="Bạn chưa có yêu cầu học nào." href="/register-student" action="Tạo yêu cầu học" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch học sắp tới</CardTitle>
            <CardDescription>Các buổi học sắp tới đã được gia sư hoặc admin xác nhận.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingSessions.slice(0, 4).length ? upcomingSessions.slice(0, 4).map((session) => (
              <div key={session.id} className="item-row">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{session.subject}</p>
                  <StatusBadge kind="teachingMode" status={session.mode} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{session.tutorName} · {formatDateTime(session.startTime)}</p>
              </div>
            )) : (
              <Empty text="Chưa có buổi học sắp tới." href="/tutors" action="Tìm gia sư" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Gia sư đề xuất</CardTitle>
            <CardDescription>Dựa trên rating cao và hồ sơ đã xác minh.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {recommendedTutors.slice(0, 3).map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} variant="compact" />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông báo hệ thống</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.slice(0, 5).length ? notifications.slice(0, 5).map((item) => (
              <div key={item.id} className="item-row p-3">
                <div className="flex items-center gap-2">
                  {!item.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  <p className="font-medium">{item.title}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">Chưa có thông báo mới.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tiến độ học tập</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {["Hoàn thành bài tập", "Mức độ chuyên cần", "Điểm mục tiêu"].map((label, index) => (
            <div key={label} className="soft-panel bg-white p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <p className="font-medium">{label}</p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${[72, 88, 64][index]}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ title, value, icon: Icon }: { title: string; value: number; icon: typeof BookOpen }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function Empty({ text, href, action }: { text: string; href: string; action: string }) {
  return (
    <div className="soft-panel border-dashed p-6 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
      <Button asChild className="mt-3" size="sm">
        <Link href={href}>{action}</Link>
      </Button>
    </div>
  )
}
