"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useSchedule } from "@/lib/hooks/use-schedule"
import { useTutorProfileByUser } from "@/lib/hooks/use-tutors"
import { formatDateTime } from "@/lib/helpers"

export default function TutorSchedulePage() {
  const { user } = useAuthContext()
  const { tutor } = useTutorProfileByUser(user?.id)
  const { sessions, completeSession } = useSchedule({ userId: tutor?.id || "", role: "tutor", actor: user })
  const upcomingCount = sessions.filter((session) => session.status === "upcoming").length
  const completedCount = sessions.filter((session) => session.status === "completed").length
  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Lịch dạy</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Danh sách buổi dạy của bạn.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Tổng buổi dạy" value={sessions.length} />
        <Metric label="Sắp tới" value={upcomingCount} />
        <Metric label="Hoàn thành" value={completedCount} />
      </div>
      {sessions.length ? sessions.map((session) => (
        <Card key={session.id}>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-900">{session.subject} · {session.studentName}</p>
              <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(session.startTime)} · {session.location || "Online"}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge kind="session" status={session.status} />
              {session.status === "upcoming" && <Button size="sm" variant="outline" onClick={() => completeSession(session.id)}>Hoàn thành</Button>}
            </div>
          </CardContent>
        </Card>
      )) : (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Chưa có lịch dạy</CardTitle>
            <CardDescription>Booking được chấp nhận sẽ tạo lịch dạy tại đây.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-tile">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  )
}
