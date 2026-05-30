"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { BookOpen, CheckCircle2, FileText, Loader2, Send, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmReasonDialog } from "@/components/dashboard/confirm-reason-dialog"
import { DashboardMetricCard, EmptyState, EntityCard, ErrorState, LoadingSkeleton, PageHero } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { tutorProposalService } from "@/lib/services/tutor-proposal-service"
import { tutorService } from "@/lib/services"
import { useTutorProfileByUser } from "@/lib/hooks/use-tutors"
import { formatCurrency, formatDate } from "@/lib/helpers"
import type { TutorLead } from "@/types"

type LeadFilter = "all" | "not_sent" | "sent"

export default function TutorLeadsPage() {
  const { user } = useAuthContext()
  const { tutor } = useTutorProfileByUser(user?.id)
  const leadsQuery = useSWR("tutor-leads", () => tutorProposalService.getTutorLeads(), { revalidateOnFocus: false })
  const proposalsQuery = useSWR("tutor-proposals", () => tutorProposalService.getTutorProposals(), { revalidateOnFocus: false })
  const eligibilityQuery = useSWR(user ? "my-tutor-approval-eligibility" : null, () => tutorService.getMyApprovalEligibility(), { revalidateOnFocus: false })
  const [filter, setFilter] = useState<LeadFilter>("all")
  const [activeLead, setActiveLead] = useState<TutorLead | null>(null)
  const [price, setPrice] = useState("")
  const [schedule, setSchedule] = useState("")
  const [teachingMode, setTeachingMode] = useState("ONLINE")
  const [message, setMessage] = useState("")
  const [trialFee, setTrialFee] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const leads = leadsQuery.data || []
  const sentRequestIds = useMemo(() => new Set((proposalsQuery.data || []).map((item) => item.learningRequestId)), [proposalsQuery.data])
  const approvedTutor = tutor?.approvalStatus === "approved"
  const eligible = approvedTutor
  const reasons = eligibilityQuery.data?.reasons || []

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const sent = Boolean(lead.proposalId || lead.proposalStatus || sentRequestIds.has(lead.id))
      if (filter === "sent") return sent
      if (filter === "not_sent") return !sent
      return true
    })
  }, [filter, leads, sentRequestIds])

  const openProposal = (lead: TutorLead) => {
    setActiveLead(lead)
    setPrice("")
    setSchedule(String(lead.preferredSchedule || ""))
    setTeachingMode(normalizeMode(lead.learningMode || lead.teachingMode))
    setMessage("")
    setTrialFee("")
  }

  const submitProposal = async () => {
    if (!activeLead) return
    const fee = Number(price)
    if (!fee || fee <= 0) {
      toast.error("Học phí đề xuất phải lớn hơn 0")
      return
    }
    if (!schedule.trim()) {
      toast.error("Vui lòng nhập lịch dạy đề xuất")
      return
    }
    if (!message.trim() || message.trim().length > 1200) {
      toast.error("Lời nhắn bắt buộc và tối đa 1200 ký tự")
      return
    }
    setSubmitting(true)
    try {
      await tutorProposalService.createProposal(activeLead.id, {
        proposedFee: fee,
        feeUnit: "PER_SESSION",
        teachingMode,
        availableSlots: [{ label: schedule.trim() }],
        teachingPlan: message.trim(),
        messageToParent: message.trim(),
        trialSessionType: "TRIAL",
        trialFee: trialFee ? Number(trialFee) : undefined,
      })
      toast.success("Đã gửi proposal cho phụ huynh")
      setActiveLead(null)
      await Promise.all([leadsQuery.mutate(), proposalsQuery.mutate()])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể gửi proposal")
    } finally {
      setSubmitting(false)
    }
  }

  if (leadsQuery.isLoading || proposalsQuery.isLoading || eligibilityQuery.isLoading) return <LoadingSkeleton label="Đang tải lead phù hợp..." />
  if (leadsQuery.error) return <ErrorState message="Không tải được lead phù hợp." onRetry={() => leadsQuery.mutate()} />

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Tutor marketplace"
        title="Lead phù hợp"
        description="Xem nhu cầu học phù hợp với hồ sơ và gửi proposal. Thông tin liên hệ nhạy cảm của phụ huynh/học sinh không hiển thị ở màn này."
        icon={BookOpen}
        actions={<Button asChild variant="outline"><Link href="/dashboard/tutor/proposals">Proposal đã gửi</Link></Button>}
        stats={[
          { label: "Lead", value: leads.length },
          { label: "Chưa gửi", value: leads.filter((item) => !item.proposalId && !sentRequestIds.has(item.id)).length },
          { label: "Đã gửi", value: leads.filter((item) => item.proposalId || sentRequestIds.has(item.id)).length },
        ]}
      />
      {!eligible && (
        <Card className="border-amber-200 bg-amber-50 text-amber-800">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">Bạn chưa thể gửi proposal.</p>
                <p className="text-sm text-amber-700">
                  {approvedTutor ? "Backend đang kiểm tra điều kiện hồ sơ." : "Bạn cần được admin duyệt hồ sơ trước khi gửi đề xuất."}
                  {reasons.length ? ` ${reasons.join("; ")}` : ""}
                </p>
              </div>
            </div>
            <Button asChild><Link href="/dashboard/tutor/verification">Hoàn tất xác thực</Link></Button>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Tổng lead" value={leads.length} icon={BookOpen} tone="blue" />
        <DashboardMetricCard label="Có thể gửi" value={leads.filter((item) => !item.proposalId && !sentRequestIds.has(item.id)).length} icon={Send} tone="emerald" />
        <DashboardMetricCard label="Đã gửi proposal" value={leads.filter((item) => item.proposalId || sentRequestIds.has(item.id)).length} icon={CheckCircle2} tone="amber" />
      </div>
      <div className="surface-panel max-w-xs p-4">
        <Select value={filter} onValueChange={(value) => setFilter(value as LeadFilter)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lead</SelectItem>
            <SelectItem value="not_sent">Chưa gửi proposal</SelectItem>
            <SelectItem value="sent">Đã gửi proposal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filteredLeads.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredLeads.map((lead) => {
            const sent = Boolean(lead.proposalId || lead.proposalStatus || sentRequestIds.has(lead.id))
            return (
              <EntityCard
                key={lead.id}
                title={`${lead.subject || lead.subjectName || "Môn học"} · ${lead.grade || lead.gradeName || "Lớp học"}`}
                subtitle={[lead.location || [lead.province, lead.district].filter(Boolean).join(", "), lead.learningMode || lead.teachingMode, lead.preferredSchedule].filter(Boolean).join(" · ")}
                meta={`${lead.requestCode || lead.id.slice(0, 8)} · ${formatDate(lead.createdAt || "")}`}
                icon={FileText}
                tone={sent ? "emerald" : "blue"}
                badge={sent ? <Badge>Đã gửi đề xuất</Badge> : <Badge variant="secondary">Chưa gửi</Badge>}
                actions={!sent && (
                  <Dialog open={activeLead?.id === lead.id} onOpenChange={(open) => !open && setActiveLead(null)}>
                    <DialogTrigger asChild>
                      <Button disabled={!eligible} onClick={() => openProposal(lead)}>Gửi proposal</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader><DialogTitle>Gửi proposal cho lead</DialogTitle></DialogHeader>
                      <ProposalForm
                        fee={price}
                        message={message}
                        onFeeChange={setPrice}
                        onMessageChange={setMessage}
                        onScheduleChange={setSchedule}
                        onTeachingModeChange={setTeachingMode}
                        onTrialFeeChange={setTrialFee}
                        schedule={schedule}
                        submitting={submitting}
                        teachingMode={teachingMode}
                        trialFee={trialFee}
                      />
                      <ConfirmReasonDialog
                        confirmLabel="Gửi proposal"
                        description="Proposal sẽ được gửi cho phụ huynh và lưu lịch sử xử lý."
                        loading={submitting}
                        noteLabel="Ghi chú nội bộ tùy chọn"
                        onConfirm={() => submitProposal()}
                        title="Xác nhận gửi proposal"
                        trigger={<Button disabled={submitting}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Gửi đề xuất</Button>}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              >
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <span>Ngân sách: {formatBudget(lead.budgetMin, lead.budgetMax)}</span>
                  <span>Trạng thái request: {lead.status || "new"}</span>
                  <span className="sm:col-span-2">Thông tin liên hệ được ẩn cho đến khi proposal/booking được xác nhận.</span>
                </div>
              </EntityCard>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title="Hiện chưa có nhu cầu học phù hợp"
          description="Hãy cập nhật môn học, khu vực, lịch rảnh và hoàn tất xác thực để nhận thêm lead chất lượng."
          actionLabel="Cập nhật hồ sơ"
          href="/dashboard/tutor/profile"
        />
      )}
    </div>
  )
}

function ProposalForm({
  fee,
  schedule,
  teachingMode,
  message,
  trialFee,
  submitting,
  onFeeChange,
  onScheduleChange,
  onTeachingModeChange,
  onMessageChange,
  onTrialFeeChange,
}: {
  fee: string
  schedule: string
  teachingMode: string
  message: string
  trialFee: string
  submitting: boolean
  onFeeChange: (value: string) => void
  onScheduleChange: (value: string) => void
  onTeachingModeChange: (value: string) => void
  onMessageChange: (value: string) => void
  onTrialFeeChange: (value: string) => void
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2"><Label>Học phí đề xuất/buổi</Label><Input disabled={submitting} type="number" value={fee} onChange={(event) => onFeeChange(event.target.value)} /></div>
      <div className="space-y-2"><Label>Học phí học thử</Label><Input disabled={submitting} type="number" value={trialFee} onChange={(event) => onTrialFeeChange(event.target.value)} placeholder="Có thể bằng 0 nếu miễn phí" /></div>
      <div className="space-y-2"><Label>Hình thức</Label><Select value={teachingMode} onValueChange={onTeachingModeChange} disabled={submitting}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ONLINE">Online</SelectItem><SelectItem value="OFFLINE">Offline</SelectItem><SelectItem value="HYBRID">Linh hoạt</SelectItem></SelectContent></Select></div>
      <div className="space-y-2"><Label>Lịch đề xuất</Label><Input disabled={submitting} value={schedule} onChange={(event) => onScheduleChange(event.target.value)} placeholder="Tối thứ 2/4/6, 19:00-20:30" /></div>
      <div className="space-y-2 md:col-span-2"><Label>Lời nhắn cho phụ huynh</Label><Textarea disabled={submitting} rows={5} value={message} onChange={(event) => onMessageChange(event.target.value)} placeholder="Nêu kinh nghiệm, phương pháp dạy, kế hoạch học thử và kỳ vọng sau vài buổi..." /></div>
    </div>
  )
}

function normalizeMode(value?: string) {
  const raw = String(value || "").toLowerCase()
  if (raw === "offline") return "OFFLINE"
  if (raw === "both" || raw === "hybrid") return "HYBRID"
  return "ONLINE"
}

function formatBudget(min?: number, max?: number) {
  if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`
  if (max) return `Tối đa ${formatCurrency(max)}`
  if (min) return `Từ ${formatCurrency(min)}`
  return "Trao đổi thêm"
}
