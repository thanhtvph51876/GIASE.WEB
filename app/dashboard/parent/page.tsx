"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { BookOpen, Calendar, CreditCard, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardMetricCard, EmptyState, ErrorState, LoadingSkeleton } from "@/components/platform/operational-components"
import { parentService } from "@/lib/services/parent-service"

type AnyRecord = Record<string, unknown>

export default function ParentDashboardPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const studentsQuery = useSWR("parent-students", () => parentService.listStudents(), { revalidateOnFocus: false })
  const dashboardQuery = useSWR(
    selectedStudentId ? ["parent-student-dashboard", selectedStudentId] : null,
    () => parentService.getStudentDashboard(selectedStudentId),
    { revalidateOnFocus: false }
  )

  const students = studentsQuery.data || []
  useEffect(() => {
    if (!selectedStudentId && students[0]?.id) setSelectedStudentId(String(students[0].id))
  }, [selectedStudentId, students])

  const dashboard = dashboardQuery.data || {}
  const paymentSummary = (dashboard.paymentSummary || {}) as AnyRecord
  const progress = (dashboard.progress || {}) as AnyRecord
  const upcomingLessons = useMemo(() => Array.isArray(dashboard.upcomingLessons) ? dashboard.upcomingLessons as AnyRecord[] : [], [dashboard.upcomingLessons])
  const latestReports = useMemo(() => Array.isArray(progress.latestReports) ? progress.latestReports as AnyRecord[] : [], [progress.latestReports])

  if (studentsQuery.isLoading) return <LoadingSkeleton label="Đang tải hồ sơ học sinh..." />
  if (studentsQuery.error) return <ErrorState message="Không tải được danh sách học sinh của phụ huynh." onRetry={() => studentsQuery.mutate()} />
  if (!students.length) {
    return (
      <EmptyState
        title="Chưa có hồ sơ học sinh"
        description="Phụ huynh cần tạo hồ sơ cho từng con trước khi tạo request, theo dõi lịch học và thanh toán."
        actionLabel="Tạo yêu cầu học"
        href="/register-student"
      />
    )
  }
  if (dashboardQuery.isLoading) return <LoadingSkeleton label="Đang tải dashboard theo học sinh..." />
  if (dashboardQuery.error) return <ErrorState message="Không tải được dashboard của học sinh đã chọn." onRetry={() => dashboardQuery.mutate()} />

  return (
    <div className="space-y-6">
      <div className="surface-panel grid gap-4 border-l-4 border-l-primary p-6 lg:grid-cols-[1fr_280px] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-primary">Dashboard phụ huynh</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Quản lý học tập, proposal và thanh toán theo từng con</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Dữ liệu được lấy từ API parent-student, quyền truy cập kiểm tra qua GuardianStudentLink ở backend.
          </p>
        </div>
        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn học sinh" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={String(student.id)} value={String(student.id)}>
                {String(student.fullName || student.studentName || "Học sinh")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardMetricCard label="Request đang mở" value={num(dashboard.openRequests)} icon={BookOpen} />
        <DashboardMetricCard label="Proposal chờ duyệt" value={num(dashboard.pendingProposals)} icon={FileText} tone="amber" />
        <DashboardMetricCard label="Trial cần xác nhận" value={num(dashboard.trialBookingsNeedConfirmation)} icon={Calendar} tone="rose" />
        <DashboardMetricCard label="Payment pending" value={num(paymentSummary.pending)} icon={CreditCard} tone="blue" />
        <DashboardMetricCard label="Lớp active" value={num(progress.activeClasses)} icon={Users} tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Lịch học sắp tới</CardTitle>
            <CardDescription>Theo dõi từng buổi học của học sinh đang chọn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingLessons.length ? upcomingLessons.slice(0, 5).map((lesson) => (
              <Row
                key={String(lesson.id)}
                title={String(lesson.subjectName || lesson.title || "Buổi học")}
                meta={[lesson.tutorName, lesson.scheduledStart, lesson.status].filter(Boolean).map(String).join(" · ")}
              />
            )) : <EmptyInline text="Chưa có lịch học." />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Báo cáo gia sư</CardTitle>
            <CardDescription>Nhận xét sau buổi học và tiến độ gần nhất.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestReports.length ? latestReports.slice(0, 5).map((report) => (
              <Row
                key={String(report.id)}
                title={String(report.classTitle || "Báo cáo buổi học")}
                meta={[report.sessionSummary, report.homeworkNote, report.createdAt].filter(Boolean).map(String).join(" · ")}
              />
            )) : <EmptyInline text="Chưa có báo cáo học tập." />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hành động nhanh</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild><Link href="/register-student">Tạo request mới</Link></Button>
          <Button asChild variant="outline"><Link href="/dashboard/parent/proposals">Xem proposal</Link></Button>
          <Button asChild variant="outline"><Link href="/dashboard/parent/payments">Thanh toán</Link></Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="item-row">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{meta || "Chưa có thông tin bổ sung"}</p>
    </div>
  )
}

function EmptyInline({ text }: { text: string }) {
  return <div className="soft-panel border-dashed p-6 text-center text-sm text-muted-foreground">{text}</div>
}

function num(value: unknown) {
  return Number(value || 0)
}
