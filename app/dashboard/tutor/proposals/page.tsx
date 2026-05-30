"use client"

import Link from "next/link"
import useSWR from "swr"
import { FileText, Send, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardMetricCard, EmptyState, EntityCard, ErrorState, LoadingSkeleton, PageHero } from "@/components/platform/operational-components"
import { tutorProposalService } from "@/lib/services/tutor-proposal-service"
import { formatCurrency, formatDate } from "@/lib/helpers"

export default function TutorProposalsPage() {
  const { data, error, isLoading, mutate } = useSWR("tutor-proposals", () => tutorProposalService.getTutorProposals(), { revalidateOnFocus: false })
  const proposals = data || []

  if (isLoading) return <LoadingSkeleton label="Đang tải proposal đã gửi..." />
  if (error) return <ErrorState message="Không tải được proposal đã gửi." onRetry={() => mutate()} />

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Tutor proposals"
        title="Proposal đã gửi"
        description="Theo dõi trạng thái đề xuất đã gửi cho phụ huynh/học sinh và chuẩn bị bước tiếp theo khi proposal được chấp nhận."
        icon={FileText}
        actions={<Button asChild><Link href="/dashboard/tutor/leads">Xem lead phù hợp</Link></Button>}
        stats={[
          { label: "Tổng proposal", value: proposals.length },
          { label: "Đang mở", value: proposals.filter((item) => ["SENT", "VIEWED", "SHORTLISTED"].includes(String(item.status).toUpperCase())).length },
          { label: "Đã chấp nhận", value: proposals.filter((item) => String(item.status).toUpperCase() === "ACCEPTED").length },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Đã gửi" value={proposals.length} icon={Send} tone="blue" />
        <DashboardMetricCard label="Đã chấp nhận" value={proposals.filter((item) => String(item.status).toUpperCase() === "ACCEPTED").length} icon={FileText} tone="emerald" />
        <DashboardMetricCard label="Bị từ chối/rút" value={proposals.filter((item) => ["REJECTED", "WITHDRAWN"].includes(String(item.status).toUpperCase())).length} icon={XCircle} tone="rose" />
      </div>
      {proposals.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {proposals.map((proposal) => (
            <EntityCard
              key={proposal.id}
              title={`${proposal.subject || "Môn học"} · ${proposal.grade || "Lớp học"}`}
              subtitle={proposal.messageToParent || proposal.teachingPlan || "Chưa có lời nhắn"}
              meta={`${proposal.proposedFee ? formatCurrency(Number(proposal.proposedFee)) : "Chưa báo phí"} · ${formatDate(proposal.createdAt || "")}`}
              icon={FileText}
              tone={String(proposal.status).toUpperCase() === "ACCEPTED" ? "emerald" : ["REJECTED", "WITHDRAWN"].includes(String(proposal.status).toUpperCase()) ? "rose" : "blue"}
              badge={<Badge>{statusLabel(proposal.status)}</Badge>}
            >
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <span>Hình thức: {proposal.teachingMode || "Linh hoạt"}</span>
                <span>Request: {proposal.requestCode || proposal.learningRequestId?.slice(0, 8)}</span>
                <span className="sm:col-span-2">Khi phụ huynh chấp nhận, booking học thử sẽ xuất hiện trong mục Booking cần xử lý.</span>
              </div>
            </EntityCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa gửi proposal nào"
          description="Proposal sẽ xuất hiện sau khi bạn gửi đề xuất từ danh sách lead phù hợp."
          actionLabel="Xem lead phù hợp"
          href="/dashboard/tutor/leads"
        />
      )}
    </div>
  )
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    SENT: "Mới gửi",
    VIEWED: "Đã xem",
    SHORTLISTED: "Đang cân nhắc",
    ACCEPTED: "Đã chấp nhận",
    REJECTED: "Đã từ chối",
    WITHDRAWN: "Đã rút",
  }
  return labels[String(status || "").toUpperCase()] || String(status || "Chưa xác định")
}
