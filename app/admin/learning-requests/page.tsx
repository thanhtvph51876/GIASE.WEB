"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AdminActionButton } from "@/components/admin/admin-action-button"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { MatchingScoreBadge, RequestStatusTimeline } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useAdminLearningRequests } from "@/lib/hooks/use-learning-requests"
import { learningRequestService } from "@/lib/services"
import { formatCurrency, formatDateTime, getStatusLabel } from "@/lib/helpers"
import type { LearningRequest, LearningRequestStatus, Tutor } from "@/types"
import { getAdminActionAvailability } from "@/lib/admin/admin-actions"

type BackendTutorMatch = {
  tutor: Tutor
  matchingScore?: number
  score?: number
  reasons?: Record<string, unknown> | string[]
}

const quickStatuses: Array<{ status: LearningRequestStatus; label: string }> = [
  { status: "consulting", label: "Bắt đầu tư vấn" },
  { status: "matching", label: "Bắt đầu matching" },
  { status: "closed", label: "Đóng yêu cầu" },
]

export default function AdminLearningRequestsPage() {
  const { user } = useAuthContext()
  const activeId = useSearchParams().get("id")
  const { requests, updateStatus, assignTutor, refresh } = useAdminLearningRequests(user)
  const [selectedTutor, setSelectedTutor] = useState("")
  const [matchesByRequest, setMatchesByRequest] = useState<Record<string, BackendTutorMatch[]>>({})
  const [loadingMatches, setLoadingMatches] = useState<Record<string, boolean>>({})
  const update = async (id: string, status: LearningRequestStatus) => { const ok = await updateStatus(id, status); if (ok) { toast.success("Cập nhật trạng thái thành công"); refresh() } }
  const assign = async (requestId: string) => { if (!selectedTutor) return; const ok = await assignTutor(requestId, selectedTutor); if (ok) { toast.success("Admin gán gia sư thành công"); setSelectedTutor(""); refresh() } }
  const rematch = async (requestId: string, reason: string) => {
    const result = await learningRequestService.rematchRequest(requestId, reason)
    if (result.success) {
      toast.success("Đã đưa yêu cầu vào luồng rematch")
      refresh()
    } else toast.error(result.error)
  }
  const cancel = async (requestId: string, reason: string) => {
    const result = await learningRequestService.cancelRequestByAdmin(requestId, reason)
    if (result.success) {
      toast.success("Đã hủy yêu cầu học")
      refresh()
    } else toast.error(result.error)
  }
  const loadMatches = async (requestId: string) => {
    if (matchesByRequest[requestId] || loadingMatches[requestId]) return
    setLoadingMatches((current) => ({ ...current, [requestId]: true }))
    try {
      const matches = await learningRequestService.getMatchingTutors(requestId) as BackendTutorMatch[]
      setMatchesByRequest((current) => ({ ...current, [requestId]: matches }))
    } catch (error) {
      toast.error("Không tải được matching từ backend", { description: error instanceof Error ? error.message : undefined })
    } finally {
      setLoadingMatches((current) => ({ ...current, [requestId]: false }))
    }
  }
  const needAssign = requests.filter((request) => !request.assignedTutorId || request.status === "new").length
  const activeCount = requests.filter((request) => request.status === "active").length

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Yêu cầu tìm gia sư</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Gán gia sư phù hợp, theo dõi tư vấn và cập nhật trạng thái yêu cầu học.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Tổng yêu cầu" value={requests.length} />
        <Metric label="Cần gán" value={needAssign} />
        <Metric label="Đang học" value={activeCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
          <CardDescription>Thao tác gán gia sư và chuyển trạng thái đều đi qua workflow/service.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className={`item-row grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center ${activeId === request.id ? "border-primary/60 bg-primary/5" : ""}`}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{request.requestCode} · {request.subject} · {request.grade}</p>
                  <StatusBadge kind="learningRequest" status={request.status} />
                  {!request.assignedTutorId && <Badge variant="outline">Cần matching</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {request.studentName} · {request.phone} · {request.location || "Online"} · {request.expectedFee ? formatCurrency(request.expectedFee) : "Chưa nhập học phí"}
                </p>
                {request.assignedTutorId && <p className="mt-1 text-sm font-medium text-primary">Gia sư được gán: {request.assignedTutorId}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <RequestDetailDialog request={request} />
                <Dialog onOpenChange={(open) => { if (open) loadMatches(request.id) }}>
                  <DialogTrigger asChild>
                    <AdminActionButton size="sm" availability={getAdminActionAvailability(user, "learning_request", "learningRequest.assign", request.status, request)}>Gán gia sư</AdminActionButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Chọn gia sư phù hợp</DialogTitle>
                    </DialogHeader>
                    <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn gia sư" />
                      </SelectTrigger>
                      <SelectContent>
                        {(matchesByRequest[request.id] || [])
                          .filter((match) => score(match) >= 30)
                          .map((match) => (
                            <SelectItem key={match.tutor.id} value={match.tutor.id}>
                              {match.tutor.fullName} · {score(match)}/100 · {reasonText(match).slice(0, 2).join(", ")}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <div className="space-y-2">
                      {loadingMatches[request.id] && <p className="soft-panel p-3 text-sm text-muted-foreground">Đang tải matching từ backend...</p>}
                      {(matchesByRequest[request.id] || [])
                        .slice(0, 3)
                        .map((match) => (
                          <div key={match.tutor.id} className="soft-panel flex items-center justify-between gap-3 bg-white p-3 text-sm">
                            <div>
                              <p className="font-semibold">{match.tutor.fullName}</p>
                              <p className="text-muted-foreground">{reasonText(match).join(", ")}</p>
                            </div>
                            <MatchingScoreBadge score={score(match)} />
                          </div>
                        ))}
                      {!loadingMatches[request.id] && !(matchesByRequest[request.id] || []).length && (
                        <p className="soft-panel border-dashed p-3 text-sm text-muted-foreground">Backend chưa trả gợi ý phù hợp.</p>
                      )}
                    </div>
                    <ConfirmReasonDialog
                      trigger={<Button disabled={!selectedTutor}>Xác nhận gán</Button>}
                      title="Gán gia sư và tạo booking học thử"
                      description="Backend sẽ đảm bảo tutor đã được duyệt và không tạo booking trùng."
                      actionName="Gán gia sư"
                      severity="warning"
                      requireReason={false}
                      onConfirm={() => assign(request.id)}
                    />
                  </DialogContent>
                </Dialog>
                {quickStatuses.map((item) => (
                  <AdminActionButton
                    key={item.status}
                    size="sm"
                    variant="outline"
                    availability={getAdminActionAvailability(user, "learning_request", "learningRequest.update", request.status, request)}
                    disabled={request.status === item.status}
                    onClick={() => update(request.id, item.status)}
                  >
                    {item.label}
                  </AdminActionButton>
                ))}
                <ConfirmReasonDialog
                  trigger={<AdminActionButton size="sm" variant="outline" availability={getAdminActionAvailability(user, "learning_request", "learningRequest.rematch", request.status, request)}>Rematch</AdminActionButton>}
                  title="Đưa yêu cầu vào luồng rematch"
                  description="Dùng khi gia sư hiện tại không phù hợp, booking học thử thất bại hoặc phụ huynh muốn đổi gia sư."
                  actionName="Rematch"
                  severity="warning"
                  reasonOptions={[
                    { value: "TRIAL_NOT_FIT", label: "Học thử chưa phù hợp" },
                    { value: "TUTOR_UNAVAILABLE", label: "Gia sư không còn lịch" },
                    { value: "PARENT_REQUEST", label: "Phụ huynh yêu cầu đổi" },
                    { value: "OTHER", label: "Lý do khác" },
                  ]}
                  onConfirm={(reason, note) => rematch(request.id, note || reason)}
                />
                <ConfirmReasonDialog
                  trigger={<AdminActionButton size="sm" variant="outline" availability={getAdminActionAvailability(user, "learning_request", "learningRequest.cancel", request.status, request)}>Hủy</AdminActionButton>}
                  title="Hủy yêu cầu học"
                  description="Yêu cầu sẽ được hủy bằng endpoint admin và lưu lý do vào audit backend."
                  actionName="Hủy yêu cầu"
                  severity="danger"
                  reasonOptions={[
                    { value: "PARENT_CANCELLED", label: "Phụ huynh/học viên hủy" },
                    { value: "NO_RESPONSE", label: "Không liên hệ được" },
                    { value: "OTHER", label: "Lý do khác" },
                  ]}
                  onConfirm={(reason, note) => cancel(request.id, note || reason)}
                />
              </div>
            </div>
          ))}
          {!requests.length && <div className="soft-panel border-dashed p-10 text-center text-sm text-muted-foreground">Chưa có yêu cầu học nào.</div>}
        </CardContent>
      </Card>
    </div>
  )
}

function RequestDetailDialog({ request }: { request: LearningRequest }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Chi tiết</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{request.requestCode} · {request.subject}</DialogTitle>
          <DialogDescription>Thông tin tư vấn, matching và trạng thái xử lý yêu cầu học.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <RequestStatusTimeline status={request.status} />
          <div className="grid gap-3 md:grid-cols-2">
            <Info label="Học viên" value={request.studentName} />
            <Info label="Phụ huynh" value={request.parentName || "Không nhập"} />
            <Info label="Liên hệ" value={[request.phone, request.email].filter(Boolean).join(" · ")} />
            <Info label="Khu vực" value={[request.province, request.district, request.location].filter(Boolean).join(" · ") || "Online"} />
            <Info label="Ngân sách" value={request.expectedFee ? formatCurrency(request.expectedFee) : `${request.budgetMin || 0} - ${request.budgetMax || 0}`} />
            <Info label="Lịch mong muốn" value={request.preferredSchedule || "Chưa nhập"} />
            <Info label="Gia sư được gán" value={request.assignedTutorId || "Chưa gán"} />
            <Info label="Tạo lúc" value={formatDateTime(request.createdAt)} />
          </div>
          <div className="soft-panel bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Mục tiêu / ghi chú</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{request.note || request.goal || "Chưa có ghi chú"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function score(match: BackendTutorMatch) {
  return Number(match.matchingScore ?? match.score ?? 0)
}

function reasonText(match: BackendTutorMatch) {
  if (Array.isArray(match.reasons)) return match.reasons.map(String)
  if (!match.reasons) return []
  return Object.entries(match.reasons)
    .filter(([, value]) => value === true || (typeof value === "number" && value > 0))
    .map(([key]) => getStatusLabel("learningRequest", key))
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-tile">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  )
}
