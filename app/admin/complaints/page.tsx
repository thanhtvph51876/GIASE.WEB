"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/platform/operational-components"

export default function AdminComplaintsPage() {
  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6"><h1 className="text-2xl font-bold">Khiếu nại</h1><p className="text-sm text-muted-foreground">Theo dõi và xử lý phản ánh trong quá trình vận hành.</p></div>
      <Card><CardHeader><CardTitle>Complaint queue</CardTitle></CardHeader><CardContent><EmptyState title="Chưa có khiếu nại mới" description="Review thấp và liên hệ khẩn sẽ được nâng cấp thành complaint ở phase sau." /></CardContent></Card>
    </div>
  )
}
