"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuditLogs } from "@/lib/hooks/use-admin"
import { formatDateTime, getAuditActionLabel, getAuditEntityLabel, getRoleLabel } from "@/lib/helpers"
import { isAdminRole } from "@/lib/permissions"

export default function AdminAuditLogsPage() {
  const { logs } = useAuditLogs()
  const [query, setQuery] = useState("")
  const [action, setAction] = useState("all")
  const [entityType, setEntityType] = useState("all")
  const [actorRole, setActorRole] = useState("all")

  const actions = Array.from(new Set(logs.map((log) => log.action)))
  const entityTypes = Array.from(new Set(logs.map((log) => log.entityType)))
  const actorRoles = Array.from(new Set(logs.map((log) => log.actorRole)))
  const adminLogs = logs.filter((log) => isAdminRole(log.actorRole)).length
  const tutorLogs = logs.filter((log) => log.actorRole === "tutor").length
  const familyLogs = logs.filter((log) => log.actorRole === "student" || log.actorRole === "parent").length

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return logs.filter((log) => {
      if (action !== "all" && log.action !== action) return false
      if (entityType !== "all" && log.entityType !== entityType) return false
      if (actorRole !== "all" && log.actorRole !== actorRole) return false
      if (!keyword) return true
      return `${log.actorName} ${log.action} ${log.entityName || ""} ${log.note || ""}`.toLowerCase().includes(keyword)
    })
  }, [action, actorRole, entityType, logs, query])

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Nhật ký vận hành</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Theo dõi ai đã thao tác gì, lúc nào và trên đối tượng nào.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Tổng thao tác" value={logs.length} />
        <Metric label="Từ admin" value={adminLogs} />
        <Metric label="Từ gia sư" value={tutorLogs} />
        <Metric label="Từ học sinh/phụ huynh" value={familyLogs} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc lịch sử xử lý</CardTitle>
          <CardDescription>{filtered.length} log phù hợp với điều kiện hiện tại.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_220px_180px_160px]">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm người thực hiện, hành động, ghi chú..." />
          <Select value={action} onValueChange={setAction}><SelectTrigger><SelectValue placeholder="Hành động" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả hành động</SelectItem>{actions.map((item) => <SelectItem key={item} value={item}>{getAuditActionLabel(item)}</SelectItem>)}</SelectContent></Select>
          <Select value={entityType} onValueChange={setEntityType}><SelectTrigger><SelectValue placeholder="Đối tượng" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả đối tượng</SelectItem>{entityTypes.map((item) => <SelectItem key={item} value={item}>{getAuditEntityLabel(item)}</SelectItem>)}</SelectContent></Select>
          <Select value={actorRole} onValueChange={setActorRole}><SelectTrigger><SelectValue placeholder="Vai trò" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả vai trò</SelectItem>{actorRoles.map((item) => <SelectItem key={item} value={item}>{getRoleLabel(item)}</SelectItem>)}</SelectContent></Select>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Dòng thời gian thao tác</CardTitle>
          <CardDescription>Lưu lại các thao tác quan trọng trong quá trình điều phối.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Người thực hiện</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Đối tượng</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-slate-900">{log.actorName}</p>
                      <Badge variant="secondary">{getRoleLabel(log.actorRole)}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">{getAuditActionLabel(log.action)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-slate-900">{log.entityName || log.entityId}</p>
                      <p className="text-xs text-muted-foreground">{getAuditEntityLabel(log.entityType)}</p>
                    </div>
                  </TableCell>
                  <TableCell>{log.note || "-"}</TableCell>
                </TableRow>
              ))}
              {!filtered.length && (
                <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Chưa có log phù hợp.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-tile">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  )
}
