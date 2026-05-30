"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { CalendarDays, Clock3, GraduationCap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { DashboardMetricCard, EmptyState, ErrorState, LoadingSkeleton, PageHero } from "@/components/platform/operational-components"
import { parentService } from "@/lib/services/parent-service"
import { formatDateTime } from "@/lib/helpers"

export default function ParentSchedulePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedStudentId, setSelectedStudentId] = useState(searchParams.get("childId") || "")
  const students = useSWR("parent-students", () => parentService.listStudents(), { revalidateOnFocus: false })
  const schedule = useSWR(selectedStudentId ? ["parent-schedule", selectedStudentId] : null, () => parentService.getStudentSchedule(selectedStudentId), { revalidateOnFocus: false })

  useEffect(() => {
    if (!selectedStudentId && students.data?.[0]?.id) {
      const id = String(students.data[0].id)
      setSelectedStudentId(id)
      router.replace(`/dashboard/parent/schedule?childId=${id}`)
    }
  }, [router, selectedStudentId, students.data])

  const items = useMemo(() => schedule.data || [], [schedule.data])
  const upcoming = items.filter((item) => !["completed", "cancelled"].includes(String(item.status || "").toLowerCase())).length
  const completed = items.filter((item) => String(item.status || "").toLowerCase() === "completed").length

  const changeStudent = (id: string) => {
    setSelectedStudentId(id)
    router.replace(`/dashboard/parent/schedule?childId=${id}`)
  }

  if (students.isLoading) return <LoadingSkeleton label="Đang tải danh sách học sinh..." />
  if (students.error) return <ErrorState message="Không tải được danh sách học sinh." onRetry={() => students.mutate()} />
  if (!students.data?.length) return <EmptyState title="Chưa có hồ sơ học sinh" href="/register-student" actionLabel="Tạo yêu cầu học" />
  if (schedule.isLoading) return <LoadingSkeleton label="Đang tải lịch học theo học sinh..." />
  if (schedule.error) return <ErrorState message="Không tải được lịch học." onRetry={() => schedule.mutate()} />

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Parent schedule"
        title="Lịch học của con"
        description="Chọn từng học sinh để xem lịch học, lớp và buổi học tương ứng. Dữ liệu được phân quyền bằng GuardianStudentLink."
        icon={CalendarDays}
        stats={[
          { label: "Tổng buổi", value: items.length },
          { label: "Cần theo dõi", value: upcoming },
          { label: "Đã hoàn thành", value: completed },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Tổng buổi" value={items.length} icon={CalendarDays} tone="blue" />
        <DashboardMetricCard label="Cần theo dõi" value={upcoming} icon={Clock3} tone={upcoming ? "amber" : "emerald"} />
        <DashboardMetricCard label="Đã hoàn thành" value={completed} icon={GraduationCap} tone="emerald" />
      </div>
      <div className="surface-panel max-w-lg p-4">
        <Select value={selectedStudentId} onValueChange={changeStudent}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn học sinh" />
          </SelectTrigger>
          <SelectContent>
            {students.data.map((student) => (
              <SelectItem key={String(student.id)} value={String(student.id)}>
                {String(student.fullName || student.studentName || "Học sinh")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {items.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Lịch học</CardTitle>
            <CardDescription>Lịch của học sinh đang chọn, không trộn dữ liệu giữa các con.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={String(item.id)} className="item-row grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="font-medium">{String(item.subjectName || item.title || "Buổi học")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[item.tutorName, formatMaybeDate(item.scheduledStart), item.location || item.meetingUrl || "Online"].filter(Boolean).map(String).join(" · ")}
                  </p>
                </div>
                <StatusBadge kind="session" status={String(item.status || "scheduled")} />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <EmptyState title="Chưa có lịch học cho học sinh này" description="Khi proposal được chấp nhận và booking học thử được xác nhận, lịch học sẽ xuất hiện tại đây." />
      )}
    </div>
  )
}

function formatMaybeDate(value: unknown) {
  if (!value) return ""
  try {
    return formatDateTime(String(value))
  } catch {
    return String(value)
  }
}
