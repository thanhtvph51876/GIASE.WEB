"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAdminStudents } from "@/lib/hooks/use-admin"

export default function AdminStudentsPage() {
  const { students: users } = useAdminStudents()
  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Quản lý học sinh/phụ huynh</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Danh sách tài khoản learner trong hệ thống.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tài khoản learner</CardTitle>
          <CardDescription>{users.length} học sinh/phụ huynh đang có trong hệ thống.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="item-row flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{user.fullName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{user.email} · {user.phone}</p>
              </div>
              <StatusBadge kind="user" status={user.status} />
            </div>
          ))}
          {!users.length && <div className="soft-panel border-dashed p-10 text-center text-sm text-muted-foreground">Chưa có tài khoản learner.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
