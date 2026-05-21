"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleBadge } from "@/components/platform/operational-components"
import { useAdminStudents } from "@/lib/hooks/use-admin"

export default function AdminParentsPage() {
  const { students } = useAdminStudents()
  const parents = students.filter((user) => user.role === "parent")
  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6"><h1 className="text-2xl font-bold">Phụ huynh</h1><p className="text-sm text-muted-foreground">Danh sách tài khoản phụ huynh trong hệ thống.</p></div>
      <Card><CardHeader><CardTitle>{parents.length} phụ huynh</CardTitle></CardHeader><CardContent className="space-y-3">
        {parents.map((parent) => <div key={parent.id} className="item-row flex items-center justify-between"><div><p className="font-semibold">{parent.fullName}</p><p className="text-sm text-muted-foreground">{parent.email} · {parent.phone}</p></div><RoleBadge role={parent.role} /></div>)}
      </CardContent></Card>
    </div>
  )
}
