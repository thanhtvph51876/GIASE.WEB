"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState, LoadingSkeleton } from "@/components/platform/operational-components"
import { classService, messageService, scheduleService } from "@/lib/services"
import { formatCurrency, formatDateTime } from "@/lib/helpers"
import type { Class as LearningClass, ClassSession } from "@/types"

export default function StudentClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [learningClass, setLearningClass] = useState<LearningClass | null>(null)
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [classData, sessionData] = await Promise.all([
        classService.getClassById(id),
        scheduleService.getSessionsByClass(id),
      ])
      setLearningClass(classData)
      setSessions(sessionData)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <LoadingSkeleton />
  if (!learningClass) return <EmptyState title="Không tìm thấy lớp học" description="Lớp có thể đã bị hủy hoặc không thuộc tài khoản hiện tại." />

  const openChat = async () => {
    try {
      const conversation = await messageService.createConversation({ type: "class", classId: id })
      router.push(`/dashboard/student/messages?conversationId=${conversation.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể mở hội thoại")
    }
  }

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-950">{learningClass.subject} · {learningClass.grade}</h1>
              <StatusBadge kind="class" status={learningClass.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{learningClass.tutorName} · {learningClass.scheduleText}</p>
          </div>
          <Button variant="outline" onClick={openChat} className="gap-2">
            <MessageSquare className="size-4" />Nhắn tin với gia sư
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="metric-tile"><p className="text-sm text-muted-foreground">Học phí</p><p className="mt-2 text-2xl font-bold">{formatCurrency(learningClass.feePerSession)}</p></div>
        <div className="metric-tile"><p className="text-sm text-muted-foreground">Đã học</p><p className="mt-2 text-2xl font-bold">{learningClass.completedSessions}/{learningClass.totalSessions}</p></div>
        <div className="metric-tile"><p className="text-sm text-muted-foreground">Hình thức</p><p className="mt-2 text-2xl font-bold">{learningClass.mode}</p></div>
      </div>
      <Card>
        <CardHeader><CardTitle>Buổi học</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="item-row flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{formatDateTime(session.startTime)}</p>
                <p className="text-sm text-muted-foreground">{session.location || "Online"}</p>
              </div>
              <StatusBadge kind="session" status={session.status} />
            </div>
          ))}
          {!sessions.length && <p className="text-sm text-muted-foreground">Chưa có buổi học nào.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
