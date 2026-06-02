"use client"

import { useState } from "react"
import Link from "next/link"
import { TutorApprovalEligibilityPanel } from "@/components/admin/tutor-approval-eligibility"
import { AdminActionButton } from "@/components/admin/admin-action-button"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { AdminPagination, ADMIN_PAGE_SIZE } from "@/components/admin/admin-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/ui/status-badge"
import { ErrorState, LoadingSkeleton } from "@/components/platform/operational-components"
import { formatCurrency } from "@/lib/helpers"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useTutorApprovalActions } from "@/lib/hooks/use-admin"
import { useTutorApprovalEligibilityMap } from "@/lib/hooks/use-tutor-approval-eligibility"
import { useAllTutors } from "@/lib/hooks/use-tutors"
import { adminService, tutorService } from "@/lib/services"
import { getAdminActionAvailability } from "@/lib/admin/admin-actions"
import { canPerformAdminAction } from "@/lib/admin/admin-permissions"

export default function AdminTutorsPage() {
  const { user } = useAuthContext()
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState("")
  const { tutors, pagination, isLoading, error, refresh } = useAllTutors({ page, pageSize: ADMIN_PAGE_SIZE, search: keyword })
  const { eligibilityByTutorId, isLoading: eligibilityLoading, refresh: refreshEligibility } = useTutorApprovalEligibilityMap(tutors.map((tutor) => tutor.id))
  const { approveTutor, rejectTutor } = useTutorApprovalActions(user, refresh)
  const approve = async (id: string) => {
    await approveTutor(id)
    refreshEligibility()
  }
  const reject = async (id: string, reason: string) => {
    await rejectTutor(id, reason)
    refreshEligibility()
  }
  const requestUpdate = async (id: string, reason: string) => {
    await adminService.requestTutorUpdate(id, reason, user)
    refresh()
    refreshEligibility()
  }
  const suspend = async (id: string, reason: string) => {
    await adminService.suspendTutor(id, reason, user)
    refresh()
  }
  const reactivate = async (id: string) => {
    await adminService.reactivateTutor(id, user)
    refresh()
    refreshEligibility()
  }
  const reviewFirstDocument = async (tutorId: string, documentId: string, status: "approved" | "rejected") => {
    await tutorService.reviewDocument(tutorId, documentId, status, status === "rejected" ? "Giấy tờ chưa rõ, cần tải lại." : undefined)
    refresh()
  }
  const filtered = tutors.filter((tutor) => `${tutor.fullName} ${tutor.subjects.join(" ")} ${tutor.university}`.toLowerCase().includes(keyword.toLowerCase()))
  const approvedCount = tutors.filter((tutor) => tutor.approvalStatus === "approved").length
  const pendingCount = tutors.filter((tutor) => tutor.approvalStatus === "pending").length
  return (
    <div className="space-y-5">
      <AdminTutorsHeader />

      {error ? (
        <ErrorState message="Không tải được danh sách gia sư từ backend." onRetry={() => refresh()} />
      ) : isLoading ? (
        <LoadingSkeleton label="Đang tải danh sách gia sư..." />
      ) : (
        <>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Tổng gia sư" value={pagination.total} />
        <Metric label="Đã duyệt" value={approvedCount} />
        <Metric label="Chờ duyệt" value={pendingCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách gia sư</CardTitle>
          <CardDescription>Lọc theo tên, môn dạy hoặc trường đang theo học.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo tên, môn, trường..." />
          <div className="space-y-3">
            {filtered.map((tutor) => {
              const eligibility = eligibilityByTutorId[tutor.id]
              const approveAvailability = getAdminActionAvailability(user, "tutor", "tutor.approve", tutor.approvalStatus, tutor, { eligibility })
              const rejectAvailability = getAdminActionAvailability(user, "tutor", "tutor.reject", tutor.approvalStatus, tutor)
              const updateAvailability = getAdminActionAvailability(user, "tutor", "tutor.requestUpdate", tutor.approvalStatus, tutor)
              const suspendAvailability = getAdminActionAvailability(user, "tutor", "tutor.suspend", tutor.approvalStatus, tutor)
              const reactivateAvailability = getAdminActionAvailability(user, "tutor", "tutor.reactivate", tutor.approvalStatus, tutor)
              const documentReviewAllowed = canPerformAdminAction(user, "tutor.approve")
              return (
                <div key={tutor.id} className="item-row grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{tutor.fullName}</p>
                      <StatusBadge kind="approval" status={tutor.approvalStatus} />
                      {tutor.verified && <Badge variant="secondary">Đã xác minh</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tutor.subjects.join(", ")} · {formatCurrency(tutor.pricePerHour)}/giờ · {tutor.university}
                    </p>
                    {tutor.documents?.[0] && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Giấy tờ: {tutor.documents[0].fileName} · {tutor.documents[0].status}
                      </p>
                    )}
                    <TutorApprovalEligibilityPanel eligibility={eligibility} loading={eligibilityLoading} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/tutors/${tutor.id}`}>CRM</Link>
                    </Button>
                    <ConfirmReasonDialog
                      trigger={<AdminActionButton size="sm" availability={approveAvailability} disabled={eligibilityLoading}>Duyệt</AdminActionButton>}
                      title="Duyệt hồ sơ gia sư"
                      description="Hồ sơ sẽ được công khai cho học viên nếu backend xác nhận đủ điều kiện."
                      actionName="Duyệt hồ sơ"
                      severity="warning"
                      requireReason={false}
                      onConfirm={() => approve(tutor.id)}
                    />
                    <ConfirmReasonDialog
                      trigger={<AdminActionButton size="sm" variant="outline" availability={updateAvailability}>Yêu cầu bổ sung</AdminActionButton>}
                      title="Yêu cầu gia sư bổ sung hồ sơ"
                      description="Ghi rõ giấy tờ hoặc thông tin còn thiếu để gia sư cập nhật đúng."
                      actionName="Gửi yêu cầu"
                      severity="warning"
                      reasonOptions={[
                        { value: "MISSING_DOCUMENT", label: "Thiếu giấy tờ bắt buộc" },
                        { value: "PROFILE_INCOMPLETE", label: "Thông tin hồ sơ chưa đầy đủ" },
                        { value: "OTHER", label: "Lý do khác" },
                      ]}
                      onConfirm={(reason, note) => requestUpdate(tutor.id, note || reason)}
                    />
                    <ConfirmReasonDialog
                      trigger={<AdminActionButton size="sm" variant="outline" availability={rejectAvailability}>Từ chối</AdminActionButton>}
                      title="Từ chối hồ sơ gia sư"
                      description="Lý do sẽ được gửi cho gia sư và lưu audit."
                      actionName="Từ chối"
                      severity="danger"
                      reasonOptions={[
                        { value: "INVALID_DOCUMENT", label: "Giấy tờ không hợp lệ" },
                        { value: "LOW_TRUST", label: "Rủi ro xác minh cao" },
                        { value: "OTHER", label: "Lý do khác" },
                      ]}
                      onConfirm={(reason, note) => reject(tutor.id, note || reason)}
                    />
                    {tutor.approvalStatus === "suspended" ? (
                      <ConfirmReasonDialog
                        trigger={<AdminActionButton size="sm" variant="outline" availability={reactivateAvailability}>Mở khóa</AdminActionButton>}
                        title="Mở khóa hồ sơ gia sư"
                        description="Hồ sơ có thể quay lại trạng thái hoạt động nếu backend cho phép."
                        actionName="Mở khóa"
                        severity="warning"
                        requireReason={false}
                        onConfirm={() => reactivate(tutor.id)}
                      />
                    ) : (
                      <ConfirmReasonDialog
                        trigger={<AdminActionButton size="sm" variant="destructive" availability={suspendAvailability}>Khóa</AdminActionButton>}
                        title="Khóa hồ sơ gia sư"
                        description="Gia sư sẽ không còn được nhận lớp trong thời gian kiểm tra."
                        actionName="Khóa hồ sơ"
                        severity="danger"
                        requireTypedConfirmation="KHOA"
                        reasonOptions={[
                          { value: "QUALITY_REVIEW", label: "Cần kiểm tra chất lượng" },
                          { value: "POLICY_RISK", label: "Dấu hiệu vi phạm chính sách" },
                          { value: "OTHER", label: "Lý do khác" },
                        ]}
                        onConfirm={(reason, note) => suspend(tutor.id, note || reason)}
                      />
                    )}
                    {documentReviewAllowed && tutor.documents?.[0] && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => reviewFirstDocument(tutor.id, tutor.documents![0].id, "approved")}>Duyệt giấy tờ</Button>
                        <Button size="sm" variant="outline" onClick={() => reviewFirstDocument(tutor.id, tutor.documents![0].id, "rejected")}>Từ chối giấy tờ</Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
            {!filtered.length && <div className="soft-panel border-dashed p-10 text-center text-sm text-muted-foreground">Không tìm thấy gia sư phù hợp.</div>}
          </div>
        </CardContent>
      </Card>
      <AdminPagination pagination={pagination} loading={isLoading} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

function AdminTutorsHeader() {
  return (
    <div className="surface-panel border-l-4 border-l-primary p-6">
      <h1 className="text-2xl font-bold text-slate-950">Quản lý gia sư</h1>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">Tìm kiếm, duyệt, từ chối và theo dõi trạng thái hồ sơ gia sư.</p>
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
