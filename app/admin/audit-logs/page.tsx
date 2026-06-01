"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminPagination, ADMIN_PAGE_SIZE, defaultPagination } from "@/components/admin/admin-pagination"
import { auditLogService } from "@/lib/services"
import { formatDateTime, getAuditActionLabel, getAuditEntityLabel, getRoleLabel } from "@/lib/helpers"
import { isAdminRole } from "@/lib/permissions"
import type { AuditLog } from "@/types"

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(defaultPagination())
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [action, setAction] = useState("all")
  const [entityType, setEntityType] = useState("all")
  const [actorRole, setActorRole] = useState("all")
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  useEffect(() => {
    setLoading(true)
    auditLogService.getAllLogsPage({ page, pageSize: ADMIN_PAGE_SIZE })
      .then((result) => {
        setLogs(result.items as AuditLog[])
        setPagination(result.pagination)
      })
      .finally(() => setLoading(false))
  }, [page])

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
                <TableHead className="text-right">Chi tiết</TableHead>
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
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelectedLog(log)}>Mở</Button>
                  </TableCell>
                </TableRow>
              ))}
              {!filtered.length && (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Chưa có log phù hợp.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AdminPagination pagination={pagination} loading={loading} onPageChange={setPage} />
      <AuditLogDetailDialog log={selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)} />
    </div>
  )
}

function AuditLogDetailDialog({ log, onOpenChange }: { log: AuditLog | null; onOpenChange: (open: boolean) => void }) {
  const metadata = log?.metadata || {}
  const requestId = String(metadata.requestId || metadata.request_id || "-")
  const ip = String(metadata.ip || metadata.ipAddress || metadata.remoteAddress || "-")
  const userAgent = String(metadata.userAgent || metadata.user_agent || "-")

  return (
    <Dialog open={!!log} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chi tiết audit</DialogTitle>
          <DialogDescription>Metadata phục vụ điều tra sự cố, đối soát action nhạy cảm và truy vết request.</DialogDescription>
        </DialogHeader>
        {log && (
          <div className="space-y-4">
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <Info label="Actor" value={`${log.actorName} · ${getRoleLabel(log.actorRole)}`} />
              <Info label="Action" value={getAuditActionLabel(log.action)} />
              <Info label="Entity" value={`${getAuditEntityLabel(log.entityType)} · ${log.entityName || log.entityId}`} />
              <Info label="Thời gian" value={formatDateTime(log.createdAt)} />
              <Info label="Request ID" value={requestId} />
              <Info label="IP" value={ip} />
              <Info label="User agent" value={userAgent} className="md:col-span-2" />
              <Info label="Ghi chú" value={log.note || log.description || "-"} className="md:col-span-2" />
            </div>
            <JsonBlock title="Metadata" value={metadata} />
            <div className="grid gap-3 md:grid-cols-2">
              <JsonBlock title="Before" value={log.before} />
              <JsonBlock title="After" value={log.after} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50 p-3 ${className || ""}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-slate-900">{value}</p>
    </div>
  )
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-950 p-3 text-slate-100">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5">
        {value === undefined ? "-" : JSON.stringify(value, null, 2)}
      </pre>
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
