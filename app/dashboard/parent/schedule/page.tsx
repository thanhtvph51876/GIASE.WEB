"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/platform/operational-components"
import { parentService } from "@/lib/services/parent-service"

export default function ParentSchedulePage() {
  const students = useSWR("parent-students", () => parentService.listStudents(), { revalidateOnFocus: false })
  const firstStudentId = students.data?.[0]?.id ? String(students.data[0].id) : ""
  const schedule = useSWR(firstStudentId ? ["parent-schedule", firstStudentId] : null, () => parentService.getStudentSchedule(firstStudentId), { revalidateOnFocus: false })

  if (students.isLoading || schedule.isLoading) return <LoadingSkeleton label="Đang tải lịch học..." />
  if (students.error || schedule.error) return <ErrorState message="Không tải được lịch học." onRetry={() => { students.mutate(); schedule.mutate() }} />
  if (!firstStudentId) return <EmptyState title="Chưa có hồ sơ học sinh" href="/register-student" actionLabel="Tạo yêu cầu học" />
  if (!schedule.data?.length) return <EmptyState title="Chưa có lịch học" />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch học</CardTitle>
        <CardDescription>Lịch học của học sinh đầu tiên trong hộ gia đình.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedule.data.map((item) => (
          <div key={String(item.id)} className="item-row">
            <p className="font-medium">{String(item.subjectName || item.title || "Buổi học")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{[item.tutorName, item.scheduledStart, item.status].filter(Boolean).map(String).join(" · ")}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
