"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowRight, Search, ShieldAlert, UserCheck } from "lucide-react"
import { toast } from "sonner"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { AdminPagination, ADMIN_PAGE_SIZE, defaultPagination } from "@/components/admin/admin-pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { hasAdminPermission } from "@/lib/admin/admin-permissions"
import { adminOperationService } from "@/lib/services/admin-operation-service"
import { formatDateTime } from "@/lib/helpers"

type DisputeRow = Record<string, unknown>

export default function AdminComplaintsPage() {
  const { user } = useAuthContext()
  const [disputes, setDisputes] = useState<DisputeRow[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(defaultPagination())
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [slaFilter, setSlaFilter] = useState("all")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const canUpdateDispute = hasAdminPermission(user, "complaints.manage")

  const load = () => {
    setLoading(true)
    adminOperationService.disputesPage({ page, pageSize: ADMIN_PAGE_SIZE })
      .then((result) => {
        setDisputes(result.items)
        setPagination(result.pagination)
      })
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page])

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return disputes.filter((item) => {
      const matchesSearch = !needle || searchable(item).includes(needle)
      const matchesStatus = statusFilter === "all" || text(item, "status") === statusFilter
      const matchesPriority = priorityFilter === "all" || text(item, "priority") === priorityFilter
      const matchesSla = slaFilter === "all" || Boolean(item.overdue) === (slaFilter === "overdue")
      const matchesOwner = ownerFilter === "all" || text(item, "assignedAdminId") === user?.id
      return matchesSearch && matchesStatus && matchesPriority && matchesSla && matchesOwner
    })
  }, [disputes, ownerFilter, priorityFilter, search, slaFilter, statusFilter, user?.id])

  const runAction = async (id: string, action: "assign" | "escalate" | "resolve", reason: string) => {
    setBusyId(`${action}:${id}`)
    try {
      const updated =
        action === "assign"
          ? await adminOperationService.assignDispute(id, { assignedAdminId: user?.id, reason })
          : action === "escalate"
            ? await adminOperationService.escalateDispute(id, { reason })
            : await adminOperationService.resolveDispute(id, { resolutionType: "NO_ACTION", resolutionNote: reason, reason })
      setDisputes((current) => current.map((row) => text(row, "id") === id ? updated : row))
      toast.success("Đã cập nhật complaint case")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật khiếu nại")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold">Complaint case management</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Quản lý complaint/dispute theo owner, SLA, priority, risk, timeline và resolution. Finance/tutor action vẫn phải xử lý qua module chuyên trách.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Case queue</CardTitle>
          <CardDescription>{filtered.length} case trong trang hiện tại sau khi lọc.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_180px_150px_140px_160px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Tìm title, reporter, subject, resolution..." />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mọi status</SelectItem>
                {unique(disputes.map((item) => text(item, "status")).filter(Boolean)).map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mọi priority</SelectItem>
                <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
              </SelectContent>
            </Select>
            <Select value={slaFilter} onValueChange={setSlaFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả SLA</SelectItem>
                <SelectItem value="overdue">Quá SLA</SelectItem>
                <SelectItem value="ok">Chưa quá</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả owner</SelectItem>
                <SelectItem value="me">Assigned to me</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length ? filtered.map((item, index) => {
            const id = text(item, "id")
            const canResolveQuick = ["INVESTIGATING", "PROPOSED_RESOLUTION", "ESCALATED"].includes(text(item, "status"))
            return (
              <div key={id || index} className={rowClass(item)}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{text(item, "title", "subject", "bookingId", "id") || "Complaint"}</p>
                    <Badge variant="secondary">{text(item, "status") || "NEW"}</Badge>
                    <SeverityBadge value={text(item, "priority") || "MEDIUM"} />
                    <SeverityBadge value={text(item, "riskLevel") || "MEDIUM"} label="Risk" />
                    {Boolean(item.overdue) && <Badge className="border-red-200 bg-red-50 text-red-700" variant="outline">Quá SLA</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[text(item, "reporterName", "studentName", "parentName"), text(item, "assignedAdmin") ? `Owner: ${text(item, "assignedAdmin")}` : "Chưa assign", safeDate(text(item, "slaDueAt"))].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{resolutionHint(item)}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <ConfirmReasonDialog
                    trigger={<Button size="sm" variant="outline" disabled={!canUpdateDispute || busyId === `assign:${id}`}><UserCheck className="h-4 w-4" />Nhận case</Button>}
                    title="Nhận xử lý complaint"
                    description="Assign case cho bạn và ghi timeline/audit."
                    actionName="Nhận case"
                    severity="warning"
                    onConfirm={(reason, note) => runAction(id, "assign", note || reason)}
                  />
                  <ConfirmReasonDialog
                    trigger={<Button size="sm" variant="outline" disabled={!canUpdateDispute || busyId === `escalate:${id}`}><ShieldAlert className="h-4 w-4" />Escalate</Button>}
                    title="Escalate complaint"
                    description="Chuyển case sang ESCALATED và đặt priority/risk CRITICAL."
                    actionName="Escalate"
                    severity="danger"
                    onConfirm={(reason, note) => runAction(id, "escalate", note || reason)}
                  />
                  <ConfirmReasonDialog
                    trigger={<Button size="sm" variant="outline" disabled={!canUpdateDispute || !canResolveQuick || busyId === `resolve:${id}`}>Resolve</Button>}
                    title="Resolve complaint"
                    description="Resolve nhanh với resolution type NO_ACTION. Case phức tạp nên mở detail để chọn resolution type."
                    actionName="Resolve"
                    severity="warning"
                    onConfirm={(reason, note) => runAction(id, "resolve", note || reason)}
                  />
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/complaints/${encodeURIComponent(id)}`}>
                      Chi tiết
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertTriangle className={item.overdue ? "h-4 w-4 text-red-500" : "h-4 w-4 text-amber-500"} />
                </div>
              </div>
            )
          }) : <EmptyState title="Không có case phù hợp" description="Đổi bộ lọc hoặc kiểm tra dữ liệu từ `/admin/disputes`." />}
        </CardContent>
      </Card>
      <AdminPagination pagination={pagination} loading={loading} onPageChange={setPage} />
    </div>
  )
}

function SeverityBadge({ value, label }: { value: string; label?: string }) {
  const tone = value === "CRITICAL" ? "border-red-200 bg-red-50 text-red-700" : value === "HIGH" ? "border-amber-200 bg-amber-50 text-amber-700" : value === "LOW" ? "border-slate-200 bg-slate-50 text-slate-600" : "border-blue-200 bg-blue-50 text-blue-700"
  return <Badge className={tone} variant="outline">{label ? `${label}: ${value}` : value}</Badge>
}

function rowClass(item: DisputeRow) {
  if (item.overdue || text(item, "priority") === "CRITICAL") return "item-row grid gap-3 border-red-200 bg-red-50/70 md:grid-cols-[1fr_auto] md:items-center"
  if (text(item, "priority") === "HIGH") return "item-row grid gap-3 border-amber-200 bg-amber-50/70 md:grid-cols-[1fr_auto] md:items-center"
  return "item-row grid gap-3 md:grid-cols-[1fr_auto] md:items-center"
}

function resolutionHint(item: DisputeRow) {
  const resolutionType = text(item, "resolutionType")
  if (resolutionType.includes("REFUND")) return "Case có hướng refund: xử lý tiền tại payment flow với quyền payments.refund."
  if (resolutionType === "TUTOR_SUSPENDED") return "Case có hướng suspend tutor: xử lý tại tutor flow với quyền tutors.suspend."
  if (text(item, "resolutionNote", "resolution")) return text(item, "resolutionNote", "resolution")
  return "Mở chi tiết để xem timeline, note nội bộ, related entity và chọn resolution."
}

function searchable(item: DisputeRow) {
  return [
    text(item, "title"),
    text(item, "subject"),
    text(item, "status"),
    text(item, "priority"),
    text(item, "riskLevel"),
    text(item, "reporterName"),
    text(item, "assignedAdmin"),
    text(item, "resolutionNote", "resolution"),
  ].join(" ").toLowerCase()
}

function text(item: DisputeRow, ...keys: string[]) {
  for (const key of keys) {
    const value = item[key]
    if (value !== undefined && value !== null && String(value).trim()) return String(value)
  }
  return ""
}

function safeDate(value: string) {
  return value ? formatDateTime(value) : "Không có SLA"
}

function unique(values: string[]) {
  return [...new Set(values)].sort()
}
