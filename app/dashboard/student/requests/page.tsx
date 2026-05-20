"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useLearningRequests } from "@/lib/hooks/use-learning-requests"
import { formatDate, getStatusLabel } from "@/lib/helpers"
import type { LearningRequestStatus } from "@/types"

const statuses: Array<LearningRequestStatus | "all"> = ["all", "new", "consulting", "matched", "trial_scheduled", "active", "completed", "cancelled"]

export default function StudentRequestsPage() {
  const { user } = useAuthContext()
  const { requests } = useLearningRequests(user?.id)
  const [status, setStatus] = useState<LearningRequestStatus | "all">("all")

  const filtered = status === "all" ? requests : requests.filter((request) => request.status === status)

  return (
    <div className="space-y-5">
      <div className="surface-panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Yêu cầu học</h1>
          <p className="text-muted-foreground">Theo dõi trạng thái tư vấn, ghép gia sư và lớp học.</p>
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value as LearningRequestStatus | "all")}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((item) => (
              <SelectItem key={item} value={item}>
                {item === "all" ? "Tất cả trạng thái" : getStatusLabel("learningRequest", item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.length ? filtered.map((request) => (
            <div key={request.id} className="item-row grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{request.subject} · {request.grade}</p>
                  <StatusBadge kind="learningRequest" status={request.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {request.requestCode} · {getStatusLabel("teachingMode", request.teachingMode)} · {request.location || "Online"} · {formatDate(request.createdAt)}
                </p>
                {request.assignedTutorId && <p className="mt-1 text-sm text-primary">Đã gán gia sư: {request.assignedTutorId}</p>}
              </div>
              <Button variant="outline">Xem chi tiết</Button>
            </div>
          )) : (
            <div className="soft-panel border-dashed p-10 text-center text-muted-foreground">
              Chưa có yêu cầu nào theo bộ lọc này.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
