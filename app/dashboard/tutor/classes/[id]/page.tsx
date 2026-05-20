"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState, LoadingSkeleton } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { classService, messageService, scheduleService, workflowService } from "@/lib/services"
import { formatDateTime } from "@/lib/helpers"
import type { Class as LearningClass, ClassSession } from "@/types"

export default function TutorClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuthContext()
  const [learningClass, setLearningClass] = useState<LearningClass | null>(null)
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [classData, sessionData] = await Promise.all([classService.getClassById(id), scheduleService.getSessionsByClass(id)])
    setLearningClass(classData)
    setSessions(sessionData)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [id])

  const complete = async (sessionId: string) => {
    try {
      await workflowService.completeSession(sessionId, user)
      toast.success("Đã đánh dấu buổi học hoàn thành")
      load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể hoàn thành buổi học")
    }
  }

  const openChat = async () => {
    try {
      const conversation = await messageService.createConversation({ type: "class", classId: id })
      router.push(`/dashboard/tutor/messages?conversationId=${conversation.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể mở hội thoại")
    }
  }

  if (loading) return <LoadingSkeleton />
  if (!learningClass) return <EmptyState title="Không tìm thấy lớp" />

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-950">{learningClass.studentName} · {learningClass.subject}</h1>
              <StatusBadge kind="class" status={learningClass.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{learningClass.scheduleText}</p>
          </div>
          <Button variant="outline" onClick={openChat} className="gap-2">
            <MessageSquare className="size-4" />Nhắn tin với học viên
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Buổi học của lớp</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="item-row grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-semibold">{formatDateTime(session.startTime)}</p>
                <p className="text-sm text-muted-foreground">{session.location || "Online"}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge kind="session" status={session.status} />
                {["upcoming", "scheduled"].includes(session.status) && <Button size="sm" onClick={() => complete(session.id)}>Hoàn thành</Button>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
