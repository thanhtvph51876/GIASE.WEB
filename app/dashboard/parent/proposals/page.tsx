"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { CalendarPlus, CheckCircle2, Eye, FileText, Star, UserRoundCheck, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmReasonDialog, type ReasonOption } from "@/components/dashboard/confirm-reason-dialog"
import { DashboardMetricCard, EmptyState, EntityCard, ErrorState, LoadingSkeleton, PageHero } from "@/components/platform/operational-components"
import { parentService } from "@/lib/services/parent-service"
import { trialBookingService } from "@/lib/services/trial-booking-service"
import { tutorProposalService } from "@/lib/services/tutor-proposal-service"
import { formatCurrency, formatDate } from "@/lib/helpers"
import type { TutorProposal } from "@/types"

type ProposalFilter = "all" | "SENT" | "VIEWED" | "SHORTLISTED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN"

const proposalFilters: Array<{ value: ProposalFilter; label: string }> = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "SENT", label: "Mới gửi" },
  { value: "VIEWED", label: "Đã xem" },
  { value: "SHORTLISTED", label: "Đang cân nhắc" },
  { value: "ACCEPTED", label: "Đã chấp nhận" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "WITHDRAWN", label: "Gia sư đã rút" },
]

const rejectReasons: ReasonOption[] = [
  { value: "PRICE_NOT_SUITABLE", label: "Học phí chưa phù hợp" },
  { value: "SCHEDULE_NOT_SUITABLE", label: "Lịch học chưa phù hợp" },
  { value: "TUTOR_NOT_SUITABLE", label: "Gia sư chưa phù hợp" },
  { value: "FOUND_ANOTHER_TUTOR", label: "Đã chọn gia sư khác" },
  { value: "OTHER", label: "Lý do khác" },
]

export default function ParentProposalsPage() {
  const studentsQuery = useSWR("parent-students", () => parentService.listStudents(), { revalidateOnFocus: false })
  const proposalsQuery = useSWR("parent-proposals", () => tutorProposalService.getParentProposals(), { revalidateOnFocus: false })
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [status, setStatus] = useState<ProposalFilter>("all")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null)

  const students = studentsQuery.data || []
  const proposals = proposalsQuery.data || []

  useEffect(() => {
    if (!selectedStudentId && students[0]?.id) setSelectedStudentId(String(students[0].id))
  }, [selectedStudentId, students])

  const filteredProposals = useMemo(() => {
    return proposals.filter((proposal) => {
      const belongsToChild = !selectedStudentId || String(proposal.studentProfileId || "") === selectedStudentId
      const statusMatch = status === "all" || normalizeProposalStatus(proposal.status) === status
      return belongsToChild && statusMatch
    })
  }, [proposals, selectedStudentId, status])

  const acceptProposal = async (proposal: TutorProposal, note: string) => {
    setProcessingId(proposal.id)
    try {
      if (normalizeProposalStatus(proposal.status) !== "ACCEPTED") {
        await tutorProposalService.acceptProposal(proposal.id)
      }
      const booking = await trialBookingService.create({ proposalId: proposal.id, note })
      setCreatedBookingId(String(booking.id || ""))
      toast.success("Đã chấp nhận đề xuất và tạo booking học thử")
      await proposalsQuery.mutate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể chấp nhận proposal")
    } finally {
      setProcessingId(null)
    }
  }

  const rejectProposal = async (proposal: TutorProposal, reason: string, note: string) => {
    setProcessingId(proposal.id)
    try {
      const finalReason = reason === "OTHER" ? note : `${reason}${note ? `: ${note}` : ""}`
      await tutorProposalService.rejectProposal(proposal.id, finalReason)
      toast.success("Đã từ chối proposal")
      await proposalsQuery.mutate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể từ chối proposal")
    } finally {
      setProcessingId(null)
    }
  }

  if (studentsQuery.isLoading || proposalsQuery.isLoading) return <LoadingSkeleton label="Đang tải proposal theo học sinh..." />
  if (studentsQuery.error || proposalsQuery.error) {
    return <ErrorState message="Không tải được proposal của phụ huynh." onRetry={() => { studentsQuery.mutate(); proposalsQuery.mutate() }} />
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Parent buyer workflow"
        title="Proposal từ gia sư"
        description="Xem đề xuất, so sánh mức phí/lịch học và chấp nhận để tạo booking học thử cho con."
        icon={FileText}
        actions={<Button asChild variant="outline"><Link href="/dashboard/parent/schedule">Xem lịch của con</Link></Button>}
        stats={[
          { label: "Tổng proposal", value: proposals.length },
          { label: "Đang cân nhắc", value: proposals.filter((item) => ["SENT", "VIEWED", "SHORTLISTED"].includes(normalizeProposalStatus(item.status))).length },
          { label: "Đã chấp nhận", value: proposals.filter((item) => normalizeProposalStatus(item.status) === "ACCEPTED").length },
        ]}
      />

      {createdBookingId && (
        <Card className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">Đã chấp nhận đề xuất và tạo lịch học thử.</p>
                <p className="text-sm text-emerald-700">Mã booking: {createdBookingId.slice(0, 8)}. Gia sư sẽ xác nhận lịch trước khi buổi học diễn ra.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild><Link href="/dashboard/parent/schedule">Xem lịch học thử</Link></Button>
              <Button size="sm" variant="outline" onClick={() => setCreatedBookingId(null)}>Tiếp tục xem đề xuất</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Proposal đang mở" value={proposals.filter((item) => canActOnProposal(item.status)).length} icon={FileText} tone="blue" />
        <DashboardMetricCard label="Đã chấp nhận" value={proposals.filter((item) => normalizeProposalStatus(item.status) === "ACCEPTED").length} icon={CheckCircle2} tone="emerald" />
        <DashboardMetricCard label="Đã từ chối" value={proposals.filter((item) => normalizeProposalStatus(item.status) === "REJECTED").length} icon={XCircle} tone="rose" />
      </div>

      <div className="surface-panel grid gap-3 p-4 md:grid-cols-[1fr_220px]">
        <Select value={selectedStudentId || "all"} onValueChange={(value) => setSelectedStudentId(value === "all" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn học sinh" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả học sinh</SelectItem>
            {students.map((student) => (
              <SelectItem key={String(student.id)} value={String(student.id)}>
                {String(student.fullName || student.studentName || "Học sinh")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(value) => setStatus(value as ProposalFilter)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {proposalFilters.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filteredProposals.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              onAccept={(note) => acceptProposal(proposal, note)}
              onReject={(reason, note) => rejectProposal(proposal, reason, note)}
              processing={processingId === proposal.id}
              proposal={proposal}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa có đề xuất nào"
          description="Khi có gia sư phù hợp gửi proposal cho request của con, đề xuất sẽ xuất hiện tại đây."
          actionLabel="Tạo yêu cầu học"
          href="/register-student"
        />
      )}
    </div>
  )
}

function ProposalCard({
  proposal,
  processing,
  onAccept,
  onReject,
}: {
  proposal: TutorProposal
  processing: boolean
  onAccept: (note: string) => void
  onReject: (reason: string, note: string) => void
}) {
  const status = normalizeProposalStatus(proposal.status)
  const actionable = canActOnProposal(status)
  const tutorName = proposal.tutorName || "Gia sư"
  const proposedFee = Number(proposal.proposedFee || proposal.trialFee || 0)
  const schedule = stringifySchedule(proposal.availableSlots) || proposal.proposedStartDate || "Trao đổi thêm"

  return (
    <EntityCard
      title={tutorName}
      subtitle={`${proposal.subject || "Môn học"} · ${proposal.grade || "Lớp học"}`}
      meta={`${proposedFee ? formatCurrency(proposedFee) : "Chưa báo phí"} · ${proposal.teachingMode || "Hình thức linh hoạt"} · ${formatDate(proposal.createdAt || "")}`}
      icon={UserRoundCheck}
      tone={status === "ACCEPTED" ? "emerald" : status === "REJECTED" || status === "WITHDRAWN" ? "rose" : "blue"}
      badge={<ProposalStatusBadge status={status} />}
      actions={(
        <>
          <Dialog>
            <DialogTrigger asChild><Button size="sm" variant="outline"><Eye className="mr-2 h-4 w-4" />Chi tiết</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Chi tiết proposal</DialogTitle></DialogHeader>
              <ProposalDetail proposal={proposal} schedule={schedule} />
            </DialogContent>
          </Dialog>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/tutors/${proposal.tutorId}`}>Hồ sơ gia sư</Link>
          </Button>
          {actionable && (
            <>
              <ConfirmReasonDialog
                confirmLabel="Chấp nhận và tạo học thử"
                description="Hệ thống sẽ chấp nhận proposal và tạo booking học thử. Nếu bấm nhiều lần, backend sẽ trả về booking hiện có thay vì tạo trùng."
                loading={processing}
                noteLabel="Ghi chú lịch học thử"
                onConfirm={(_, note) => onAccept(note)}
                title="Xác nhận chấp nhận proposal"
                trigger={<Button size="sm" disabled={processing}><CalendarPlus className="mr-2 h-4 w-4" />Chấp nhận</Button>}
              />
              <ConfirmReasonDialog
                confirmLabel="Từ chối proposal"
                description="Proposal bị từ chối sẽ không thể dùng để tạo booking học thử."
                loading={processing}
                onConfirm={onReject}
                reasonLabel="Lý do từ chối"
                reasons={rejectReasons}
                requireReason
                title="Xác nhận từ chối proposal"
                trigger={<Button size="sm" variant="outline" disabled={processing}>Từ chối</Button>}
              />
            </>
          )}
        </>
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <Avatar className="h-12 w-12">
          <AvatarImage src={proposal.tutorAvatar} />
          <AvatarFallback>{tutorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2 text-sm text-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Đã qua nền tảng</Badge>
            <Badge variant="outline"><Star className="mr-1 h-3.5 w-3.5 fill-amber-400 text-amber-400" />Review sẽ hiển thị khi backend trả về</Badge>
          </div>
          <p><b>Lịch đề xuất:</b> {schedule}</p>
          {proposal.messageToParent && <p className="leading-6">{proposal.messageToParent}</p>}
          {proposal.teachingPlan && <p className="leading-6 text-muted-foreground">{proposal.teachingPlan}</p>}
        </div>
      </div>
    </EntityCard>
  )
}

function ProposalDetail({ proposal, schedule }: { proposal: TutorProposal; schedule: string }) {
  return (
    <div className="grid gap-3 text-sm sm:grid-cols-2">
      <Detail label="Gia sư" value={proposal.tutorName || proposal.tutorId} />
      <Detail label="Trạng thái" value={normalizeProposalStatus(proposal.status)} />
      <Detail label="Môn/lớp" value={[proposal.subject, proposal.grade].filter(Boolean).join(" · ")} />
      <Detail label="Học phí" value={proposal.proposedFee ? formatCurrency(Number(proposal.proposedFee)) : "Chưa có"} />
      <Detail label="Hình thức" value={proposal.teachingMode || "Chưa có"} />
      <Detail label="Lịch đề xuất" value={schedule} />
      <Detail label="Kinh nghiệm liên quan" value={proposal.relevantExperience || "Chưa nhập"} />
      <Detail label="Kết quả kỳ vọng" value={proposal.expectedOutcome || "Chưa nhập"} />
      <div className="sm:col-span-2">
        <Detail label="Lời nhắn" value={proposal.messageToParent || proposal.teachingPlan || "Gia sư chưa để lại lời nhắn."} />
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value || "Chưa có"}</p>
    </div>
  )
}

function ProposalStatusBadge({ status }: { status: string }) {
  const label: Record<string, string> = {
    SENT: "Mới gửi",
    VIEWED: "Đã xem",
    SHORTLISTED: "Đang cân nhắc",
    ACCEPTED: "Đã chấp nhận",
    REJECTED: "Đã từ chối",
    WITHDRAWN: "Gia sư đã rút",
  }
  const variant = status === "ACCEPTED" ? "default" : status === "REJECTED" || status === "WITHDRAWN" ? "destructive" : "secondary"
  return <Badge variant={variant}>{label[status] || status}</Badge>
}

function normalizeProposalStatus(status?: string) {
  return String(status || "").toUpperCase()
}

function canActOnProposal(status?: string) {
  return ["SENT", "VIEWED", "SHORTLISTED"].includes(normalizeProposalStatus(status))
}

function stringifySchedule(value: unknown) {
  if (!value) return ""
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? item : JSON.stringify(item)).join(", ")
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}
