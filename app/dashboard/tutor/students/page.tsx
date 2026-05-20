"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { formatDateTime } from "@/lib/helpers"
import { useSchedule } from "@/lib/hooks/use-schedule"
import { useTutorProfileByUser } from "@/lib/hooks/use-tutors"

export default function TutorStudentsPage() {
  const { user } = useAuthContext()
  const { tutor } = useTutorProfileByUser(user?.id)
  const { sessions } = useSchedule({ userId: tutor?.id || "", role: "tutor", actor: user })
  const students = Array.from(new Map(sessions.map((session) => [session.studentId, session])).values())
  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Học sinh của tôi</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Danh sách học sinh đã có lịch học.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="metric-tile"><p className="text-sm text-muted-foreground">Tổng học sinh</p><p className="mt-2 text-2xl font-bold text-slate-950">{students.length}</p></div>
        <div className="metric-tile"><p className="text-sm text-muted-foreground">Buổi sắp tới</p><p className="mt-2 text-2xl font-bold text-slate-950">{sessions.filter((session) => session.status === "upcoming").length}</p></div>
        <div className="metric-tile"><p className="text-sm text-muted-foreground">Buổi đã hoàn thành</p><p className="mt-2 text-2xl font-bold text-slate-950">{sessions.filter((session) => session.status === "completed").length}</p></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {students.map((session) => (
          <Card key={session.studentId}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{session.studentName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{session.subject} · {session.grade}</p>
                </div>
                <StatusBadge kind="session" status={session.status} />
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground">
                Buổi gần nhất: <span className="font-medium text-slate-800">{formatDateTime(session.startTime)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!students.length && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Chưa có học sinh</CardTitle>
            <CardDescription>Học sinh sẽ xuất hiện khi bạn có booking/lịch dạy được xác nhận.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
