"use client"

import { useState } from "react"
import { TutorApprovalEligibilityPanel } from "@/components/admin/tutor-approval-eligibility"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { usePendingTutors, useTutorApprovalActions } from "@/lib/hooks/use-admin"
import { useTutorApprovalEligibilityMap } from "@/lib/hooks/use-tutor-approval-eligibility"
import { adminService } from "@/lib/services"

export default function AdminTutorApprovalsPage() {
  const { user } = useAuthContext()
  const { tutors, refresh } = usePendingTutors()
  const { eligibilityByTutorId, isLoading: eligibilityLoading, refresh: refreshEligibility } = useTutorApprovalEligibilityMap(tutors.map((tutor) => tutor.id))
  const { approveTutor, rejectTutor } = useTutorApprovalActions(user, refresh)
  const [reason, setReason] = useState("")
  const approve = async (id: string) => {
    await approveTutor(id)
    refreshEligibility()
  }
  const reject = async (id: string) => {
    const ok = await rejectTutor(id, reason || "Hồ sơ chưa đủ thông tin xác minh")
    if (ok) setReason("")
  }
  const requestMoreDocuments = async (id: string) => {
    await adminService.requestTutorUpdate(id, "Vui lòng bổ sung hoặc xác thực lại giấy tờ bắt buộc.", user)
    refresh()
    refreshEligibility()
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
          <CardDescription>{tutors.length} hồ sơ đang cần admin xử lý.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tutors.map((tutor) => {
            const eligibility = eligibilityByTutorId[tutor.id]
            const canApprove = Boolean(eligibility?.eligibleForApproval) && !eligibilityLoading
            return (
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
                  <TutorApprovalEligibilityPanel eligibility={eligibility} loading={eligibilityLoading} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled={!canApprove} title={canApprove ? undefined : "Backend báo hồ sơ chưa đủ điều kiện duyệt"} onClick={() => approve(tutor.id)}>
                    Duyệt hồ sơ
                  </Button>
                  <Button variant="outline" onClick={() => requestMoreDocuments(tutor.id)}>Yêu cầu bổ sung</Button>
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
            )
          })}
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
