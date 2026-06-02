"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ErrorState, LoadingSkeleton } from "@/components/platform/operational-components"
import { useAdminOperations } from "@/lib/hooks/use-admin"
import { hasAdminPermission } from "@/lib/admin/admin-permissions"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { adminOperationService, bookingService, learningRequestService, payoutService } from "@/lib/services"
import type { OperationWorkItem } from "@/lib/services/admin-operation-service"

type QueueRow = Record<string, unknown>
type SeverityFilter = "all" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

const PAGE_SIZE = 20

export default function AdminOperationsPage() {
  const { user } = useAuthContext()
  const { data, error, isLoading, refresh } = useAdminOperations()
  const [search, setSearch] = useState("")
  const [priority, setPriority] = useState<SeverityFilter>("all")
  const [moduleFilter, setModuleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [overdueFilter, setOverdueFilter] = useState("all")
  const [assignedFilter, setAssignedFilter] = useState("all")
  const [createdDate, setCreatedDate] = useState("")
  const [page, setPage] = useState(1)
  const [busyId, setBusyId] = useState<string | null>(null)

  if (isLoading) return <LoadingSkeleton label="Đang tải trung tâm vận hành..." />
  if (error) return <ErrorState message="Không tải được dữ liệu vận hành từ backend." onRetry={() => refresh()} />

  const overview = data?.overview || {}
  const workItems = (data?.workItems?.length ? data.workItems : legacyWorkItems(data)) as OperationWorkItem[]
  const modules = unique(workItems.map((item) => text(item, "module")).filter(Boolean))
  const statuses = unique(workItems.map((item) => text(item, "status")).filter(Boolean))

  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return workItems.filter((item) => {
      const matchesSearch = !needle || searchable(item).includes(needle)
      const matchesPriority = priority === "all" || text(item, "priority") === priority
      const matchesModule = moduleFilter === "all" || text(item, "module") === moduleFilter
      const matchesStatus = statusFilter === "all" || text(item, "status") === statusFilter
      const matchesOverdue = overdueFilter === "all" || Boolean(item.overdue) === (overdueFilter === "overdue")
      const matchesAssigned = assignedFilter === "all" || text(item, "assignedAdminId") === user?.id
      const matchesDate = !createdDate || text(item, "createdAt").slice(0, 10) === createdDate
      return matchesSearch && matchesPriority && matchesModule && matchesStatus && matchesOverdue && matchesAssigned && matchesDate
    })
  }, [assignedFilter, createdDate, moduleFilter, overdueFilter, priority, search, statusFilter, user?.id, workItems])

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visibleItems = filteredItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const highRiskCount = workItems.filter((item) => ["HIGH", "CRITICAL"].includes(text(item, "riskLevel"))).length
  const overdueCount = workItems.filter((item) => item.overdue).length
  const assignedToMeCount = workItems.filter((item) => text(item, "assignedAdminId") === user?.id).length

  const runAction = async (item: OperationWorkItem, action: string, note?: string) => {
    const id = text(item, "relatedId", "id")
    if (!id) return
    setBusyId(`${action}:${id}`)
    try {
      if (action === "booking.complete") await bookingService.completeTrial(id, note || "Admin xử lý từ operations SLA cockpit")
      if (action === "request.rematch") await learningRequestService.rematchRequest(id, note || "Admin rematch từ operations SLA cockpit")
      if (action === "payout.approve") await payoutService.approvePayout(id, user, note || "Admin approve payout từ operations SLA cockpit")
      if (action === "complaint.assign") await adminOperationService.assignDispute(id, { assignedAdminId: user?.id, reason: note || "Nhận xử lý case từ operations" })
      toast.success("Đã xử lý quick action")
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể thực hiện quick action")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Trung tâm vận hành marketplace</h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Cockpit SLA/priority cho matching, booking, verification, payment, payout, quality và complaint.
            </p>
          </div>
          <Button variant="outline" onClick={() => refresh()}>
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-8">
        <Metric label="Request mới" value={numberValue(overview, "newRequests")} icon={BookOpen} />
        <Metric label="Chưa match" value={numberValue(overview, "unmatchedRequests")} icon={AlertTriangle} />
        <Metric label="Quá SLA" value={overdueCount || numberValue(overview, "overdueRequests")} icon={AlertTriangle} tone={overdueCount ? "danger" : "normal"} />
        <Metric label="Rủi ro cao" value={highRiskCount} icon={ShieldCheck} tone={highRiskCount ? "warning" : "normal"} />
        <Metric label="Trial sắp tới" value={numberValue(overview, "upcomingTrialBookings")} icon={CalendarDays} />
        <Metric label="Payment" value={numberValue(overview, "pendingPayments")} icon={CreditCard} />
        <Metric label="Payout" value={numberValue(overview, "pendingPayouts")} icon={Wallet} />
        <Metric label="Của tôi" value={assignedToMeCount} icon={UserCheck} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <CardTitle>Work items cần xử lý</CardTitle>
              <CardDescription>
                {filteredItems.length} việc sau khi lọc. Priority/risk/SLA được backend tính từ dữ liệu vận hành hiện có.
              </CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/complaints">Mở case management</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_150px_180px_180px_150px_160px_150px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} className="pl-9" placeholder="Tìm title, module, action, status..." />
            </div>
            <Select value={priority} onValueChange={(value) => { setPriority(value as SeverityFilter); setPage(1) }}>
              <SelectTrigger><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mọi priority</SelectItem>
                <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
              </SelectContent>
            </Select>
            <Select value={moduleFilter} onValueChange={(value) => { setModuleFilter(value); setPage(1) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mọi module</SelectItem>
                {modules.map((module) => <SelectItem key={module} value={module}>{module}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mọi status</SelectItem>
                {statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={overdueFilter} onValueChange={(value) => { setOverdueFilter(value); setPage(1) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả SLA</SelectItem>
                <SelectItem value="overdue">Quá SLA</SelectItem>
                <SelectItem value="ok">Chưa quá</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assignedFilter} onValueChange={(value) => { setAssignedFilter(value); setPage(1) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả owner</SelectItem>
                <SelectItem value="me">Assigned to me</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={createdDate} onChange={(event) => { setCreatedDate(event.target.value); setPage(1) }} />
          </div>

          <div className="space-y-3">
            {visibleItems.length ? visibleItems.map((item, index) => (
              <WorkItemRow
                key={`${text(item, "itemType")}:${text(item, "id") || index}`}
                item={item}
                busyId={busyId}
                canManageBookings={hasAdminPermission(user, "bookings.manage")}
                canManageMatching={hasAdminPermission(user, "matching.manage")}
                canApprovePayout={hasAdminPermission(user, "payouts.approve")}
                canManageComplaints={hasAdminPermission(user, "complaints.manage")}
                onAction={runAction}
              />
            )) : (
              <div className="soft-panel border-dashed p-8 text-center text-sm text-muted-foreground">
                Không có work item phù hợp bộ lọc.
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-muted-foreground">
            <span>Trang {safePage}/{pageCount}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Trước</Button>
              <Button size="sm" variant="outline" disabled={safePage >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Sau</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function WorkItemRow({
  item,
  busyId,
  canManageBookings,
  canManageMatching,
  canApprovePayout,
  canManageComplaints,
  onAction,
}: {
  item: OperationWorkItem
  busyId: string | null
  canManageBookings: boolean
  canManageMatching: boolean
  canApprovePayout: boolean
  canManageComplaints: boolean
  onAction: (item: OperationWorkItem, action: string, note?: string) => void
}) {
  const itemType = text(item, "itemType")
  const id = text(item, "relatedId", "id")
  const href = text(item, "detailHref") || moduleHref(item)
  const status = text(item, "status")
  const priority = text(item, "priority") || "MEDIUM"
  const riskLevel = text(item, "riskLevel") || "MEDIUM"
  const action = quickActionFor(itemType)
  const actionAllowed =
    (action === "booking.complete" && canManageBookings) ||
    (action === "request.rematch" && canManageMatching) ||
    (action === "payout.approve" && canApprovePayout) ||
    (action === "complaint.assign" && canManageComplaints)
  const actionBusy = Boolean(action && busyId === `${action}:${id}`)

  return (
    <div className={rowClass(item)}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-950">{text(item, "title") || "Work item"}</p>
          <SeverityBadge value={priority} />
          <SeverityBadge value={riskLevel} label="Risk" />
          {item.overdue && <Badge className="border-red-200 bg-red-50 text-red-700" variant="outline">Quá SLA</Badge>}
          {status && <Badge variant="secondary">{status}</Badge>}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {[text(item, "module"), text(item, "itemType"), text(item, "assignedAdmin") ? `Owner: ${text(item, "assignedAdmin")}` : "", slaText(item)].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{text(item, "recommendedAction")}</p>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {action ? (
          <ConfirmReasonDialog
            trigger={<Button size="sm" variant="outline" disabled={!actionAllowed || actionBusy}>{quickActionLabel(action)}</Button>}
            title={quickActionLabel(action)}
            description="Quick action này sẽ gọi backend và ghi audit/permission ở server."
            actionName={quickActionLabel(action)}
            severity={priority === "CRITICAL" ? "danger" : "warning"}
            reasonOptions={[
              { value: "OPS_SLA_ACTION", label: "Xử lý SLA vận hành" },
              { value: "OPS_RISK_ACTION", label: "Xử lý rủi ro" },
              { value: "OTHER", label: "Lý do khác" },
            ]}
            onConfirm={(reason, note) => onAction(item, action, note || reason)}
          />
        ) : null}
        <Button asChild size="sm" variant="outline">
          <Link href={href}>
            Mở chi tiết
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

function Metric({ label, value, icon: Icon, tone = "normal" }: { label: string; value?: unknown; icon: typeof BookOpen; tone?: "normal" | "warning" | "danger" }) {
  return (
    <div className={`metric-tile p-4 ${tone === "warning" ? "border-amber-200 bg-amber-50" : tone === "danger" ? "border-red-200 bg-red-50" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-950">{Number(value || 0).toLocaleString("vi-VN")}</p>
    </div>
  )
}

function SeverityBadge({ value, label }: { value: string; label?: string }) {
  const tone = value === "CRITICAL" ? "border-red-200 bg-red-50 text-red-700" : value === "HIGH" ? "border-amber-200 bg-amber-50 text-amber-700" : value === "LOW" ? "border-slate-200 bg-slate-50 text-slate-600" : "border-blue-200 bg-blue-50 text-blue-700"
  return <Badge className={tone} variant="outline">{label ? `${label}: ${value}` : value}</Badge>
}

function rowClass(item: OperationWorkItem) {
  if (item.overdue || text(item, "priority") === "CRITICAL") return "item-row grid gap-3 border-red-200 bg-red-50/70 md:grid-cols-[1fr_auto] md:items-center"
  if (text(item, "priority") === "HIGH") return "item-row grid gap-3 border-amber-200 bg-amber-50/70 md:grid-cols-[1fr_auto] md:items-center"
  return "item-row grid gap-3 md:grid-cols-[1fr_auto] md:items-center"
}

function quickActionFor(itemType: string) {
  if (itemType === "BOOKING_OVERDUE") return "booking.complete"
  if (itemType === "REQUEST_MATCHING_FAIL") return "request.rematch"
  if (itemType === "PAYOUT_PENDING") return "payout.approve"
  if (itemType === "COMPLAINT_OPEN" || itemType === "COMPLAINT_SLA_OVERDUE") return "complaint.assign"
  return ""
}

function quickActionLabel(action: string) {
  if (action === "booking.complete") return "Mark completed"
  if (action === "request.rematch") return "Rematch"
  if (action === "payout.approve") return "Approve payout"
  if (action === "complaint.assign") return "Nhận case"
  return "Quick action"
}

function legacyWorkItems(data: ReturnType<typeof useAdminOperations>["data"]): OperationWorkItem[] {
  const groups: Array<[string, string, QueueRow[], string, string]> = [
    ["learningRequests", "LEARNING_REQUEST_UNMATCHED", data?.matchingQueue || [], "/admin/learning-requests", "Ghép gia sư cho request."],
    ["bookings", "BOOKING_RISK", data?.bookingRisk || [], "/admin/bookings", "Xử lý booking rủi ro."],
    ["verifications", "VERIFICATION_PENDING", data?.verificationRisk || [], "/admin/verifications", "Review xác minh."],
    ["payments", "PAYMENT_RECONCILIATION", data?.paymentReconciliation || [], "/admin/payments", "Đối soát payment."],
    ["payouts", "PAYOUT_PENDING", data?.payoutQueue || [], "/admin/payouts", "Duyệt payout."],
    ["tutors", "TUTOR_QUALITY_WARNING", data?.tutorQuality || [], "/admin/tutors", "Rà chất lượng tutor."],
    ["complaints", "COMPLAINT_OPEN", data?.disputes || [], "/admin/complaints", "Xử lý complaint."],
  ]
  return groups.flatMap(([module, itemType, rows, href, recommendedAction]) =>
    rows.map((row) => ({
      ...row,
      module,
      itemType,
      title: text(row, "requestCode", "studentName", "fullName", "tutorName", "userName", "email", "id"),
      priority: text(row, "priority") as OperationWorkItem["priority"] || "MEDIUM",
      riskLevel: text(row, "riskLevel") as OperationWorkItem["riskLevel"] || "MEDIUM",
      recommendedAction,
      detailHref: href,
    }))
  )
}

function moduleHref(item: OperationWorkItem) {
  const module = text(item, "module")
  if (module === "learningRequests") return "/admin/learning-requests"
  if (module === "bookings") return "/admin/bookings"
  if (module === "verifications") return "/admin/verifications"
  if (module === "payments") return "/admin/payments"
  if (module === "payouts") return "/admin/payouts"
  if (module === "tutors") return "/admin/tutors"
  if (module === "complaints") return "/admin/complaints"
  return "/admin/operations"
}

function slaText(item: OperationWorkItem) {
  const sla = text(item, "slaDueAt")
  if (!sla) return ""
  return `SLA: ${new Date(sla).toLocaleString("vi-VN")}`
}

function searchable(item: OperationWorkItem) {
  return [
    text(item, "title"),
    text(item, "module"),
    text(item, "itemType"),
    text(item, "status"),
    text(item, "priority"),
    text(item, "riskLevel"),
    text(item, "recommendedAction"),
    text(item, "assignedAdmin"),
  ].join(" ").toLowerCase()
}

function text(item: QueueRow | undefined, ...keys: string[]) {
  if (!item) return ""
  for (const key of keys) {
    const value = item[key]
    if (value !== undefined && value !== null && String(value).trim()) return String(value)
  }
  return ""
}

function numberValue(item: unknown, key: string) {
  const raw = item && typeof item === "object" ? item as Record<string, unknown> : {}
  const value = raw[key]
  return typeof value === "number" ? value : value ? Number(value) || 0 : 0
}

function unique(values: string[]) {
  return [...new Set(values)].sort()
}
