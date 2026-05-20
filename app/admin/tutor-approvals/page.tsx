"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { usePendingTutors, useTutorApprovalActions } from "@/lib/hooks/use-admin"

export default function AdminTutorApprovalsPage() {
  const { user } = useAuthContext()
  const { tutors, refresh } = usePendingTutors()
  const { approveTutor, rejectTutor } = useTutorApprovalActions(user, refresh)
  const [reason, setReason] = useState("")
  const approve = (id: string) => approveTutor(id)
  const reject = async (id: string) => {
    const ok = await rejectTutor(id, reason || "Hồ sơ chưa đủ thông tin xác minh")
    if (ok) setReason("")
  }
  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Duyệt hồ sơ gia sư</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Xác minh hồ sơ sinh viên, duyệt gia sư đủ điều kiện hoặc yêu cầu bổ sung minh chứng.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ chờ xử lý</CardTitle>
          <CardDescription>{tutors.length} hồ sơ đang ở trạng thái pending.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tutors.map((tutor) => (
            <div key={tutor.id} className="item-row grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{tutor.fullName}</p>
                  <StatusBadge kind="approval" status={tutor.approvalStatus} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tutor.university} · {tutor.faculty} · {tutor.major}
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {tutor.subjects.join(", ")} · {tutor.grades.slice(0, 4).join(", ")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => approve(tutor.id)}>Duyệt hồ sơ</Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Từ chối</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Lý do từ chối</DialogTitle>
                    </DialogHeader>
                    <Textarea
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Nhập lý do để gia sư biết cần bổ sung gì..."
                    />
                    <Button onClick={() => reject(tutor.id)}>Xác nhận từ chối</Button>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
          {!tutors.length && (
            <div className="soft-panel border-dashed p-10 text-center text-sm text-muted-foreground">
              Không có hồ sơ pending.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
