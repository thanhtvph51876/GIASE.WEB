import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/helpers"
import type { TutorApprovalEligibility } from "@/types"

const reasonLabels: Record<string, string> = {
  PROFILE_NOT_SUBMITTED: "Hồ sơ chưa được gửi duyệt",
  IDENTITY_DOCUMENT_MISSING: "Chưa có giấy tờ danh tính",
  IDENTITY_NOT_APPROVED: "Danh tính chưa được duyệt",
  CERTIFICATE_DOCUMENT_MISSING: "Chưa có bằng cấp/chứng chỉ",
  CERTIFICATE_NOT_APPROVED: "Bằng cấp/chứng chỉ chưa được duyệt",
  COMMITMENT_NOT_SIGNED: "Chưa ký bản cam kết",
  COMMITMENT_VERSION_INVALID: "Bản cam kết không đúng phiên bản hiện tại",
  DUPLICATE_DOCUMENT_DETECTED: "Phát hiện giấy tờ trùng tài khoản khác",
  RISK_SCORE_TOO_HIGH: "Risk score vượt ngưỡng 60",
  PROFILE_REJECTED: "Hồ sơ đã bị từ chối",
  PROFILE_SUSPENDED: "Hồ sơ đang bị khóa",
  DOCUMENT_PENDING_REVIEW: "Có giấy tờ đang chờ duyệt",
  DOCUMENT_REJECTED: "Có giấy tờ bị từ chối hoặc cần bổ sung",
  DOCUMENT_EXPIRED: "Có giấy tờ hết hạn",
  NEEDS_MORE_DOCUMENTS: "Hồ sơ đang cần bổ sung giấy tờ",
}

const profileStatusLabels: Record<string, string> = {
  DRAFT: "Bản nháp",
  SUBMITTED: "Đã gửi hồ sơ",
  PENDING_VERIFICATION: "Chờ xác thực giấy tờ",
  NEEDS_MORE_DOCUMENTS: "Cần bổ sung giấy tờ",
  VERIFIED: "Đã đủ điều kiện giấy tờ",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  SUSPENDED: "Đã khóa",
}

export function TutorApprovalEligibilityPanel({
  eligibility,
  loading,
}: {
  eligibility?: TutorApprovalEligibility
  loading?: boolean
}) {
  if (loading) return <p className="mt-3 text-xs font-medium text-muted-foreground">Đang kiểm tra điều kiện duyệt từ backend...</p>
  if (!eligibility) return <p className="mt-3 text-xs font-medium text-amber-700">Chưa tải được điều kiện duyệt từ backend.</p>

  const checklist = [
    { label: "Hồ sơ đã gửi", ok: eligibility.checklist.profileSubmitted },
    { label: "Danh tính đã xác thực", ok: eligibility.checklist.identityApproved },
    { label: "Bằng cấp/chứng chỉ đã xác thực", ok: eligibility.checklist.certificateApproved },
    { label: "Đã ký bản cam kết", ok: eligibility.checklist.commitmentSigned && eligibility.checklist.commitmentVersionValid },
    { label: "Không phát hiện trùng giấy tờ", ok: !eligibility.checklist.duplicateDocumentDetected },
    { label: `Risk score: ${eligibility.riskScore}/100`, ok: eligibility.checklist.riskScoreAcceptable },
  ]

  return (
    <div className="mt-3 space-y-3 rounded-lg border bg-slate-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={eligibility.eligibleForApproval ? "secondary" : "outline"}>
          {eligibility.eligibleForApproval ? "Đủ điều kiện duyệt" : "Chưa đủ điều kiện duyệt"}
        </Badge>
        <Badge variant="outline">{profileStatusLabels[eligibility.profileStatus] || eligibility.profileStatus}</Badge>
        <Badge variant="outline">Risk: {eligibility.riskLevel}</Badge>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {checklist.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            {item.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {eligibility.reasons.length > 0 && (
        <div className="space-y-1 text-sm text-amber-800">
          {eligibility.reasons.map((reason) => (
            <div key={reason} className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>{reasonLabels[reason] || reason}</span>
            </div>
          ))}
        </div>
      )}

      {eligibility.riskBreakdown.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {eligibility.riskBreakdown.map((item) => (
            <Badge key={`${item.reason}-${item.score}`} variant="outline">
              {item.reason}: +{item.score}
            </Badge>
          ))}
        </div>
      )}

      {eligibility.commitment.signedAt && (
        <p className="text-xs text-muted-foreground">
          Cam kết: {eligibility.commitment.version || eligibility.commitment.requiredVersion} · {formatDateTime(eligibility.commitment.signedAt)}
        </p>
      )}
    </div>
  )
}
