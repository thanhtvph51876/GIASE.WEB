"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { DashboardMetricCard } from "@/components/platform/operational-components"
import { scheduleService } from "@/lib/services"
import { formatDateTime } from "@/lib/helpers"
import type { ClassSession } from "@/types"

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const load = async () => setSessions(await scheduleService.getAllSessions())
  useEffect(() => { load() }, [])
  const update = async (id: string, status: "completed" | "student_absent" | "tutor_absent" | "cancelled") => {
    const result = await scheduleService.updateSessionStatus(id, status)
    if (result.success) { toast.success("Đã cập nhật buổi học"); load() } else toast.error(result.error)
  }
  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6"><h1 className="text-2xl font-bold">Buổi học</h1><p className="text-sm text-muted-foreground">Quản lý session toàn hệ thống.</p></div>
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardMetricCard label="Tổng buổi" value={sessions.length} />
        <DashboardMetricCard label="Sắp tới" value={sessions.filter((item) => item.status === "upcoming" || item.status === "scheduled").length} />
        <DashboardMetricCard label="Hoàn thành" value={sessions.filter((item) => item.status === "completed").length} />
        <DashboardMetricCard label="Vắng/hủy" value={sessions.filter((item) => ["cancelled", "student_absent", "tutor_absent"].includes(item.status)).length} />
      </div>
      <Card><CardHeader><CardTitle>Danh sách session</CardTitle></CardHeader><CardContent className="space-y-3">
        {sessions.map((session) => (
          <div key={session.id} className="item-row grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{session.subject} · {session.studentName}</p><StatusBadge kind="session" status={session.status} /></div><p className="text-sm text-muted-foreground">{session.tutorName} · {formatDateTime(session.startTime)}</p></div>
            <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => update(session.id, "completed")}>Hoàn thành</Button><Button size="sm" variant="outline" onClick={() => update(session.id, "student_absent")}>HV vắng</Button><Button size="sm" variant="outline" onClick={() => update(session.id, "tutor_absent")}>GS vắng</Button><Button size="sm" variant="outline" onClick={() => update(session.id, "cancelled")}>Hủy</Button></div>
          </div>
        ))}
      </CardContent></Card>
    </div>
  )
}
