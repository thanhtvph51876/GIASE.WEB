"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/platform/operational-components"
import { adminOperationService } from "@/lib/services/admin-operation-service"

type DisputeRow = Record<string, unknown>

export default function AdminComplaintsPage() {
  const [disputes, setDisputes] = useState<DisputeRow[]>([])

  useEffect(() => {
    adminOperationService.disputes().then(setDisputes).catch(() => setDisputes([]))
  }, [])

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6"><h1 className="text-2xl font-bold">Khiếu nại</h1><p className="text-sm text-muted-foreground">Theo dõi và xử lý phản ánh trong quá trình vận hành.</p></div>
      <Card>
        <CardHeader><CardTitle>Complaint / dispute queue</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {disputes.length ? disputes.map((item, index) => (
            <div key={String(item.id || index)} className="item-row grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{text(item, "title", "subject", "requestCode", "bookingId", "id") || "Dispute"}</p>
                  <Badge variant="secondary">{text(item, "status", "disputeStatus", "riskLevel") || "open"}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[text(item, "studentName", "parentName", "tutorName"), text(item, "priority", "severity"), text(item, "createdAt", "updatedAt")].filter(Boolean).join(" · ")}
                </p>
              </div>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          )) : <EmptyState title="Chưa có khiếu nại mới" description="Queue này dùng /admin/disputes; khi backend có dữ liệu sẽ hiển thị tại đây thay vì empty state tĩnh." />}
        </CardContent>
      </Card>
    </div>
  )
}

function text(item: DisputeRow, ...keys: string[]) {
  for (const key of keys) {
    const value = item[key]
    if (value !== undefined && value !== null && String(value).trim()) return String(value)
  }
  return ""
}
