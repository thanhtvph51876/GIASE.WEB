"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { MatchingScoreBadge } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useAdminLearningRequests } from "@/lib/hooks/use-learning-requests"
import { useTutors } from "@/lib/hooks/use-tutors"
import { matchingService } from "@/lib/services"
import { formatCurrency, getStatusLabel } from "@/lib/helpers"
import type { LearningRequestStatus } from "@/types"

const statuses: LearningRequestStatus[] = ["new", "consulting", "matched", "trial_scheduled", "trial_completed", "active", "rematch", "completed", "cancelled"]

export default function AdminLearningRequestsPage() {
  const { user } = useAuthContext()
  const { requests, updateStatus, assignTutor, refresh } = useAdminLearningRequests(user)
  const { tutors } = useTutors({ initialFilters: { verified: true }, initialSortBy: "best_match" })
  const [selectedTutor, setSelectedTutor] = useState("")
  const update = async (id: string, status: LearningRequestStatus) => { const ok = await updateStatus(id, status); if (ok) { toast.success("Cập nhật trạng thái thành công"); refresh() } }
  const assign = async (requestId: string) => { if (!selectedTutor) return; const ok = await assignTutor(requestId, selectedTutor); if (ok) { toast.success("Admin gán gia sư thành công"); setSelectedTutor(""); refresh() } }
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
            <div key={request.id} className="item-row grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{request.requestCode} · {request.subject} · {request.grade}</p>
                  <StatusBadge kind="learningRequest" status={request.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {request.studentName} · {request.phone} · {request.location || "Online"} · {request.expectedFee ? formatCurrency(request.expectedFee) : "Chưa nhập học phí"}
                </p>
                {request.assignedTutorId && <p className="mt-1 text-sm font-medium text-primary">Gia sư được gán: {request.assignedTutorId}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">Gán gia sư</Button>
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
                        {tutors
                          .map((tutor) => matchingService.calculateMatchingScore(request, tutor))
                          .filter((match) => match.score >= 30)
                          .sort((a, b) => b.score - a.score)
                          .map((match) => (
                            <SelectItem key={match.tutor.id} value={match.tutor.id}>
                              {match.tutor.fullName} · {match.score}/100 · {match.reasons.slice(0, 2).join(", ")}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <div className="space-y-2">
                      {tutors
                        .map((tutor) => matchingService.calculateMatchingScore(request, tutor))
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 3)
                        .map((match) => (
                          <div key={match.tutor.id} className="soft-panel flex items-center justify-between gap-3 bg-white p-3 text-sm">
                            <div>
                              <p className="font-semibold">{match.tutor.fullName}</p>
                              <p className="text-muted-foreground">{match.reasons.join(", ")}</p>
                            </div>
                            <MatchingScoreBadge score={match.score} />
                          </div>
                        ))}
                    </div>
                    <Button onClick={() => assign(request.id)}>Xác nhận gán</Button>
                  </DialogContent>
                </Dialog>
                <Select value={request.status} onValueChange={(value) => update(request.id, value as LearningRequestStatus)}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => <SelectItem key={status} value={status}>{getStatusLabel("learningRequest", status)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
          {!requests.length && <div className="soft-panel border-dashed p-10 text-center text-sm text-muted-foreground">Chưa có yêu cầu học nào.</div>}
        </CardContent>
      </Card>
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
