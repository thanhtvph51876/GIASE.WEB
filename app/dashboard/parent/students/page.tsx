"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/platform/operational-components"
import { parentService } from "@/lib/services/parent-service"

export default function ParentStudentsPage() {
  const { data, error, isLoading, mutate } = useSWR("parent-students", () => parentService.listStudents(), { revalidateOnFocus: false })
  if (isLoading) return <LoadingSkeleton label="Đang tải hồ sơ con..." />
  if (error) return <ErrorState message="Không tải được hồ sơ học sinh." onRetry={() => mutate()} />
  if (!data?.length) return <EmptyState title="Chưa có hồ sơ học sinh" actionLabel="Tạo yêu cầu học" href="/register-student" />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hồ sơ học sinh</CardTitle>
        <CardDescription>Danh sách con được liên kết qua GuardianStudentLink.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((student) => (
          <div key={String(student.id)} className="item-row">
            <p className="font-medium">{String(student.fullName || student.studentName || "Học sinh")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{[student.grade, student.schoolName, student.relationship].filter(Boolean).map(String).join(" · ")}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
