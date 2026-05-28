"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/platform/operational-components"
import { tutorProposalService } from "@/lib/services/tutor-proposal-service"

export default function ParentProposalsPage() {
  const { data, error, isLoading, mutate } = useSWR("parent-proposals", () => tutorProposalService.getParentProposals(), { revalidateOnFocus: false })
  if (isLoading) return <LoadingSkeleton label="Đang tải proposal từ gia sư..." />
  if (error) return <ErrorState message="Không tải được proposal." onRetry={() => mutate()} />
  if (!data?.length) return <EmptyState title="Chưa có proposal" description="Proposal sẽ xuất hiện khi gia sư gửi đề xuất cho request của con." />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposal từ gia sư</CardTitle>
        <CardDescription>Phụ huynh chọn, accept hoặc reject proposal trước khi tạo trial booking.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((proposal) => (
          <div key={String(proposal.id)} className="item-row">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{String(proposal.tutorName || "Gia sư")}</p>
              <Badge variant="secondary">{String(proposal.status || "")}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{[proposal.subject, proposal.grade, proposal.proposedFee].filter(Boolean).map(String).join(" · ")}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
