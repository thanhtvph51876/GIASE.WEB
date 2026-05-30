"use client"

import { TutorApprovalEligibilityPanel } from "@/components/admin/tutor-approval-eligibility"
import { AdminActionButton } from "@/components/admin/admin-action-button"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { usePendingTutors, useTutorApprovalActions } from "@/lib/hooks/use-admin"
import { useTutorApprovalEligibilityMap } from "@/lib/hooks/use-tutor-approval-eligibility"
import { adminService } from "@/lib/services"
import { getAdminActionAvailability } from "@/lib/admin/admin-actions"

export default function AdminTutorApprovalsPage() {
  const { user } = useAuthContext()
  const { tutors, refresh } = usePendingTutors()
  const { eligibilityByTutorId, isLoading: eligibilityLoading, refresh: refreshEligibility } = useTutorApprovalEligibilityMap(tutors.map((tutor) => tutor.id))
  const { approveTutor, rejectTutor } = useTutorApprovalActions(user, refresh)
  const approve = async (id: string) => {
    await approveTutor(id)
    refreshEligibility()
  }
  const reject = async (id: string, reason: string) => {
    await rejectTutor(id, reason)
  }
  const requestMoreDocuments = async (id: string, reason: string) => {
    await adminService.requestTutorUpdate(id, reason, user)
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
            const approveAvailability = getAdminActionAvailability(user, "tutor", "tutor.approve", tutor.approvalStatus, tutor, { eligibility })
            const updateAvailability = getAdminActionAvailability(user, "tutor", "tutor.requestUpdate", tutor.approvalStatus, tutor)
            const rejectAvailability = getAdminActionAvailability(user, "tutor", "tutor.reject", tutor.approvalStatus, tutor)
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
                  <ConfirmReasonDialog
                    trigger={<AdminActionButton availability={approveAvailability} disabled={eligibilityLoading}>Duyệt hồ sơ</AdminActionButton>}
                    title="Duyệt hồ sơ gia sư"
                    description="Checklist phải đạt đủ điều kiện trước khi duyệt."
                    actionName="Duyệt hồ sơ"
                    severity="warning"
                    requireReason={false}
                    onConfirm={() => approve(tutor.id)}
                  />
                  <ConfirmReasonDialog
                    trigger={<AdminActionButton variant="outline" availability={updateAvailability}>Yêu cầu bổ sung</AdminActionButton>}
                    title="Yêu cầu bổ sung hồ sơ"
                    description="Ghi rõ giấy tờ hoặc thông tin cần bổ sung."
                    actionName="Gửi yêu cầu"
                    severity="warning"
                    reasonOptions={[
                      { value: "MISSING_IDENTITY", label: "Thiếu giấy tờ danh tính" },
                      { value: "MISSING_CERTIFICATE", label: "Thiếu bằng cấp/chứng chỉ" },
                      { value: "MISSING_COMMITMENT", label: "Chưa ký cam kết" },
                      { value: "OTHER", label: "Lý do khác" },
                    ]}
                    onConfirm={(reason, note) => requestMoreDocuments(tutor.id, note || reason)}
                  />
                  <ConfirmReasonDialog
                    trigger={<AdminActionButton variant="outline" availability={rejectAvailability}>Từ chối</AdminActionButton>}
                    title="Từ chối hồ sơ"
                    description="Lý do sẽ được gửi cho gia sư và lưu audit."
                    actionName="Từ chối"
                    severity="danger"
                    reasonOptions={[
                      { value: "INVALID_DOCUMENT", label: "Giấy tờ không hợp lệ" },
                      { value: "RISK_TOO_HIGH", label: "Risk score quá cao" },
                      { value: "OTHER", label: "Lý do khác" },
                    ]}
                    onConfirm={(reason, note) => reject(tutor.id, note || reason)}
                  />
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
