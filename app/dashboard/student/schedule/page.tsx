"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useReviews, useStudentReviews } from "@/lib/hooks/use-reviews"
import { useSchedule } from "@/lib/hooks/use-schedule"
import { formatDateTime } from "@/lib/helpers"
import type { ClassSession, SessionStatus } from "@/types"

export default function StudentSchedulePage() {
  const { user } = useAuthContext()
  const { sessions } = useSchedule({ userId: user?.id || "", role: "student", actor: user })
  const { reviews: studentReviews, refresh: refreshStudentReviews } = useStudentReviews(user?.id)
  const [status, setStatus] = useState<SessionStatus | "all">("all")
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null)
  const [rating, setRating] = useState("5")
  const [content, setContent] = useState("")
  const { createReview } = useReviews(selectedSession?.tutorId)

  const filtered = status === "all" ? sessions : sessions.filter((session) => session.status === status)
  const reviewedSessionIds = new Set(studentReviews.map((review) => review.sessionId).filter(Boolean))
  const upcomingCount = sessions.filter((session) => session.status === "upcoming").length
  const completedCount = sessions.filter((session) => session.status === "completed").length

  const submitReview = async () => {
    if (!selectedSession || !user) return
    const review = await createReview({
      tutorId: selectedSession.tutorId,
      studentId: user.id,
      studentName: user.fullName,
      avatar: user.avatar,
      sessionId: selectedSession.id,
      classId: selectedSession.classId,
      rating: Number(rating),
      content,
      actor: user,
    })
    if (review) {
      setContent("")
      setRating("5")
      setSelectedSession(null)
      refreshStudentReviews()
    }
  }

  return (
    <div className="space-y-5">
      <div className="surface-panel flex flex-col gap-3 border-l-4 border-l-primary p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Lịch học</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Theo dõi các buổi sắp tới, đã hoàn thành và đã hủy.</p>
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value as SessionStatus | "all")}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="upcoming">Sắp tới</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Tổng buổi học" value={sessions.length} />
        <Metric label="Sắp tới" value={upcomingCount} />
        <Metric label="Hoàn thành" value={completedCount} />
      </div>
      <div className="grid gap-4">
        {filtered.length ? filtered.map((session) => (
          <Card key={session.id}>
            <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-semibold">{session.subject} · {session.grade}</p>
                <p className="text-sm text-muted-foreground">
                  {session.tutorName} · {formatDateTime(session.startTime)} · {session.location || "Online"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge kind="session" status={session.status} />
                {session.status === "completed" && (
                  reviewedSessionIds.has(session.id) ? (
                    <Badge variant="secondary">Đã đánh giá</Badge>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedSession(session)}>
                          Đánh giá gia sư
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Đánh giá gia sư</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Số sao</Label>
                            <Select value={rating} onValueChange={setRating}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5].map((star) => <SelectItem key={star} value={String(star)}>{star} sao</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Nội dung đánh giá</Label>
                            <Textarea value={content} onChange={(event) => setContent(event.target.value)} rows={4} placeholder="Chia sẻ cảm nhận sau buổi học..." />
                          </div>
                          <Button onClick={submitReview} disabled={content.trim().length < 10}>Gửi đánh giá</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Chưa có lịch học</CardTitle>
              <CardDescription>Các buổi học thử và buổi học chính thức sẽ xuất hiện tại đây.</CardDescription>
            </CardHeader>
            <CardContent className="pb-10 text-center text-sm text-muted-foreground">Bạn có thể đặt học thử từ trang tìm gia sư.</CardContent>
          </Card>
        )}
      </div>
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
