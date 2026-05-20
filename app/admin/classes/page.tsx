"use client"

import { useState } from "react"
import { BookOpenCheck, CalendarDays, CheckCircle2, GraduationCap, TimerReset } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { DashboardMetricCard, EmptyState, EntityCard, PageHero } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useAdminOperations } from "@/lib/hooks/use-admin"
import { useClasses } from "@/lib/hooks/use-classes"
import { workflowService } from "@/lib/services"
import { formatCurrency, formatDate } from "@/lib/helpers"

export default function AdminClassesPage() {
  const { user } = useAuthContext()
  const { classes, refresh } = useClasses({ role: "admin" })
  const { data, refresh: refreshOperations } = useAdminOperations()
  const [result, setResult] = useState<"active" | "rematch" | "cancelled">("active")
  const [note, setNote] = useState("")
  const [scheduleText, setScheduleText] = useState("")
  const [fee, setFee] = useState("")

  const sessions = data?.sessions || []
  const trialCount = classes.filter((item) => item.status === "trial").length
  const activeCount = classes.filter((item) => item.status === "active").length
  const completedCount = classes.filter((item) => item.status === "completed").length

  const submitTrialResult = async (classId: string, requestId?: string) => {
    if (!requestId) {
      toast.error("Lớp học thử này chưa gắn với yêu cầu học")
      return
    }
    try {
      await workflowService.resolveTrialResult(
        requestId,
        classId,
        {
          result,
          note,
          scheduleText,
          feePerSession: fee ? Number(fee) : undefined,
        },
        user
      )
      toast.success("Đã cập nhật kết quả học thử")
      setNote("")
      setScheduleText("")
      setFee("")
      refresh()
      refreshOperations()
    } catch (error) {
      toast.error("Không thể cập nhật", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại",
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Class operations"
        title="Lớp học"
        description="Theo dõi lớp học thử, lớp chính thức, session liên quan và xử lý kết quả học thử ngay tại console."
        icon={GraduationCap}
        stats={[
          { label: "Tổng lớp", value: classes.length },
          { label: "Học thử", value: trialCount },
          { label: "Đang học", value: activeCount },
          { label: "Hoàn thành", value: completedCount },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <DashboardMetricCard label="Tổng lớp" value={classes.length} icon={BookOpenCheck} tone="blue" />
        <DashboardMetricCard label="Học thử" value={trialCount} icon={TimerReset} tone="amber" />
        <DashboardMetricCard label="Đang học" value={activeCount} icon={CalendarDays} tone="emerald" />
        <DashboardMetricCard label="Hoàn thành" value={completedCount} icon={CheckCircle2} tone="slate" />
      </div>

      {classes.length ? classes.map((item) => {
        const classSessions = sessions.filter((session) => session.classId === item.id)
        return (
          <EntityCard
            key={item.id}
            title={`${item.subject} · ${item.grade}`}
            subtitle={`${item.tutorName} · ${item.studentName}`}
            meta={`${formatCurrency(item.feePerSession)}/buổi · bắt đầu ${formatDate(item.startDate)}`}
            icon={GraduationCap}
            tone={item.status === "active" ? "emerald" : item.status === "trial" ? "amber" : item.status === "cancelled" ? "rose" : "blue"}
            badge={(
              <>
                <StatusBadge kind="class" status={item.status} />
                {item.learningRequestId && <Badge variant="secondary">{item.learningRequestId}</Badge>}
              </>
            )}
            actions={item.status === "trial" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Xác nhận kết quả học thử</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Kết quả học thử</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Select value={result} onValueChange={(value) => setResult(value as "active" | "rematch" | "cancelled")}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Phù hợp, chuyển thành lớp chính thức</SelectItem>
                            <SelectItem value="rematch">Chưa phù hợp, cần gán gia sư khác</SelectItem>
                            <SelectItem value="cancelled">Hủy yêu cầu</SelectItem>
                          </SelectContent>
                        </Select>
                        {result === "active" && (
                          <>
                            <Input value={scheduleText} onChange={(event) => setScheduleText(event.target.value)} placeholder="Lịch học chính thức, ví dụ: Tối thứ 2, 4 19:00-21:00" />
                            <Input value={fee} onChange={(event) => setFee(event.target.value)} type="number" placeholder="Học phí chính thức mỗi buổi" />
                          </>
                        )}
                        <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi chú admin..." />
                      <Button onClick={() => submitTrialResult(item.id, item.learningRequestId)}>Lưu kết quả</Button>
                    </div>
                  </DialogContent>
                </Dialog>
            )}
          >
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{item.scheduleText || "Chưa có lịch chính thức"}</p>
              <div className="grid gap-2 md:grid-cols-2">
                {classSessions.slice(0, 4).map((session) => (
                  <div key={session.id} className="soft-panel bg-white p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <b>{session.isTrial ? "Học thử" : "Buổi học"}</b>
                      <StatusBadge kind="session" status={session.status} />
                    </div>
                    <p className="mt-1 text-muted-foreground">{new Date(session.startTime).toLocaleString("vi-VN")}</p>
                  </div>
                ))}
                {!classSessions.length && <div className="soft-panel border-dashed p-4 text-center text-sm text-muted-foreground">Chưa có buổi học nào trong lớp này.</div>}
              </div>
            </div>
          </EntityCard>
        )
      }) : (
        <EmptyState title="Chưa có lớp học nào" description="Lớp học thử sẽ được tạo khi gia sư chấp nhận booking." />
      )}
    </div>
  )
}
