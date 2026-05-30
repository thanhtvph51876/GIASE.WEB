"use client"

import { useState } from "react"
import { TutorApprovalEligibilityPanel } from "@/components/admin/tutor-approval-eligibility"
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

export default function AdminTutorsPage() {
  const { user } = useAuthContext()
  const { tutors, isLoading, error, refresh } = useAllTutors()
  const { eligibilityByTutorId, isLoading: eligibilityLoading, refresh: refreshEligibility } = useTutorApprovalEligibilityMap(tutors.map((tutor) => tutor.id))
  const { approveTutor, rejectTutor } = useTutorApprovalActions(user, refresh)
  const [keyword, setKeyword] = useState("")
  const approve = async (id: string) => {
    await approveTutor(id)
    refreshEligibility()
  }
  const reject = async (id: string) => {
    await rejectTutor(id, "Cần bổ sung minh chứng hồ sơ")
    refreshEligibility()
  }
  const requestUpdate = async (id: string) => {
    await adminService.requestTutorUpdate(id, "Vui lòng bổ sung giấy tờ và mô tả kinh nghiệm dạy học.", user)
    refresh()
    refreshEligibility()
  }
  const suspend = async (id: string) => {
    await adminService.suspendTutor(id, "Tạm khóa hồ sơ để kiểm tra chất lượng phản hồi.", user)
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
        <Metric label="Tổng gia sư" value={tutors.length} />
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
              const canApprove = Boolean(eligibility?.eligibleForApproval) && !eligibilityLoading
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
                    <Button size="sm" disabled={!canApprove} title={canApprove ? undefined : "Backend báo hồ sơ chưa đủ điều kiện duyệt"} onClick={() => approve(tutor.id)}>
                      Duyệt
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => requestUpdate(tutor.id)}>Yêu cầu bổ sung</Button>
                    <Button size="sm" variant="outline" onClick={() => reject(tutor.id)}>Từ chối</Button>
                    {tutor.approvalStatus === "suspended" ? (
                      <Button size="sm" variant="outline" onClick={() => reactivate(tutor.id)}>Mở khóa</Button>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => suspend(tutor.id)}>Khóa</Button>
                    )}
                    {tutor.documents?.[0] && (
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
