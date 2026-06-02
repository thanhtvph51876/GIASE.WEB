"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock, FileText, ShieldAlert, UserCheck } from "lucide-react"
import { toast } from "sonner"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ErrorState, LoadingSkeleton } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { hasAdminPermission } from "@/lib/admin/admin-permissions"
import { adminOperationService } from "@/lib/services/admin-operation-service"
import { formatDateTime } from "@/lib/helpers"

type CaseRow = Record<string, unknown>

const CASE_STATUSES = [
  "NEW",
  "ASSIGNED",
  "INVESTIGATING",
  "WAITING_PARENT",
  "WAITING_TUTOR",
  "PROPOSED_RESOLUTION",
  "RESOLVED",
  "CLOSED",
  "ESCALATED",
  "REJECTED",
]

const RESOLUTION_TYPES = [
  "NO_ACTION",
  "WARNING",
  "REFUND",
  "PARTIAL_REFUND",
  "COMPENSATION",
  "TUTOR_SUSPENDED",
  "BOOKING_CANCELLED",
  "CLASS_CANCELLED",
  "OTHER",
]

export default function AdminComplaintDetailPage() {
  const params = useParams<{ id: string }>()
  const { user } = useAuthContext()
  const [item, setItem] = useState<CaseRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState("")
  const [status, setStatus] = useState("")
  const [resolutionType, setResolutionType] = useState("NO_ACTION")
  const [resolutionNote, setResolutionNote] = useState("")
  const canManage = hasAdminPermission(user, "complaints.manage")
  const id = params.id

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const result = await adminOperationService.dispute(id)
      setItem(result)
      setStatus(text(result, "status") || "NEW")
      setResolutionType(text(result, "resolutionType") || "NO_ACTION")
      setResolutionNote(text(result, "resolutionNote", "resolution"))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const run = async (action: () => Promise<CaseRow>, success: string) => {
    setBusy(true)
    try {
      const result = await action()
      setItem(result)
      toast.success(success)
      setNote("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể cập nhật case")
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <LoadingSkeleton label="Đang tải complaint case..." />
  if (error || !item) return <ErrorState message="Không tải được chi tiết complaint." onRetry={load} />

  const overdue = Boolean(item.overdue)
  const relatedHref = targetHref(item)

  return (
    <div className="space-y-5">
      <div className={`surface-panel border-l-4 p-6 ${overdue ? "border-l-red-500 bg-red-50/50" : "border-l-primary"}`}>
        <Button asChild variant="ghost" size="sm" className="mb-3 px-0">
          <Link href="/admin/complaints">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-950">{text(item, "title", "subject", "id") || "Complaint case"}</h1>
              <Badge variant="secondary">{text(item, "status")}</Badge>
              <SeverityBadge value={text(item, "priority") || "MEDIUM"} />
              <SeverityBadge value={text(item, "riskLevel") || "MEDIUM"} label="Risk" />
              {overdue && <Badge className="border-red-200 bg-red-50 text-red-700" variant="outline">Quá SLA</Badge>}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {text(item, "description", "reason") || "Case cần điều tra thêm."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ConfirmReasonDialog
              trigger={<Button variant="outline" disabled={!canManage || busy}><UserCheck className="h-4 w-4" />Nhận case</Button>}
              title="Nhận xử lý complaint"
              description="Case sẽ được assign cho bạn và ghi timeline/audit."
              actionName="Nhận case"
              severity="warning"
              onConfirm={(reason, detail) => run(() => adminOperationService.assignDispute(id, { assignedAdminId: user?.id, reason: detail || reason }), "Đã nhận case")}
            />
            <ConfirmReasonDialog
              trigger={<Button variant="outline" disabled={!canManage || busy}><ShieldAlert className="h-4 w-4" />Escalate</Button>}
              title="Escalate complaint"
              description="Case sẽ chuyển sang ESCALATED, priority/risk CRITICAL."
              actionName="Escalate"
              severity="danger"
              onConfirm={(reason, detail) => run(() => adminOperationService.escalateDispute(id, { reason: detail || reason }), "Đã escalate case")}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin case</CardTitle>
              <CardDescription>Reporter, target, entity liên quan và SLA.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Info label="Reporter" value={text(item, "reporterName", "reporterEmail", "reporterId") || "Không có"} />
              <Info label="Target user" value={text(item, "targetUserName", "targetUserId") || "Không có"} />
              <Info label="Owner" value={text(item, "assignedAdmin", "assignedAdminId") || "Chưa assign"} />
              <Info label="Related" value={`${text(item, "relatedType") || "BOOKING"} · ${text(item, "relatedId", "bookingId")}`} />
              <Info label="SLA due" value={safeDate(text(item, "slaDueAt"))} />
              <Info label="Created" value={safeDate(text(item, "createdAt"))} />
              <Button asChild variant="outline" className="md:col-span-2">
                <Link href={relatedHref}>Mở entity liên quan</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Lịch sử xử lý case từ backend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {array(item.timeline).length ? array(item.timeline).map((event, index) => (
                <div key={text(event, "id") || index} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-slate-950">{text(event, "eventType") || "EVENT"}</p>
                    {text(event, "statusFrom") && <Badge variant="outline">{`${text(event, "statusFrom")} -> ${text(event, "statusTo")}`}</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{safeDate(text(event, "createdAt"))} · {text(event, "actorName", "actorRole")}</p>
                  {text(event, "note") && <p className="mt-2 text-sm leading-6 text-slate-700">{text(event, "note")}</p>}
                </div>
              )) : <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">Chưa có timeline event.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal notes</CardTitle>
              <CardDescription>Ghi chú nội bộ, không hiển thị cho user public.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {array(item.notes).map((entry, index) => (
                <div key={text(entry, "id") || index} className="rounded-lg border bg-slate-50 p-3">
                  <p className="text-sm leading-6 text-slate-900">{text(entry, "content")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{safeDate(text(entry, "createdAt"))} · {text(entry, "createdByName", "createdBy")}</p>
                </div>
              ))}
              {!array(item.notes).length && <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">Chưa có ghi chú nội bộ.</p>}
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Thêm ghi chú nội bộ..." disabled={!canManage || busy} />
              <Button disabled={!canManage || busy || !note.trim()} onClick={() => run(() => adminOperationService.addDisputeNote(id, { content: note.trim() }), "Đã thêm ghi chú")}>
                <FileText className="h-4 w-4" />
                Thêm note
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Action panel</CardTitle>
              <CardDescription>Đổi trạng thái theo state machine và ghi audit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus} disabled={!canManage || busy}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CASE_STATUSES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <ConfirmReasonDialog
                trigger={<Button className="w-full" disabled={!canManage || busy || status === text(item, "status")}>Cập nhật status</Button>}
                title="Cập nhật trạng thái complaint"
                description="Backend sẽ kiểm tra state transition và ghi timeline/audit."
                actionName="Cập nhật"
                severity="warning"
                onConfirm={(reason, detail) => run(() => adminOperationService.updateDispute(id, { status: status as any, reason: detail || reason }), "Đã cập nhật status")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resolution</CardTitle>
              <CardDescription>Không tự sửa tiền hoặc khóa tutor; resolution chỉ ghi kết luận, finance/tutor action phải qua flow riêng.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Resolution type</label>
                <Select value={resolutionType} onValueChange={setResolutionType} disabled={!canManage || busy}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{RESOLUTION_TYPES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Textarea value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} rows={5} placeholder="Kết luận xử lý..." disabled={!canManage || busy} />
              {resolutionType.includes("REFUND") && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Resolution refund cần xử lý tiền qua màn payment với quyền `payments.refund`.
                </div>
              )}
              {resolutionType === "TUTOR_SUSPENDED" && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Suspend tutor phải thực hiện qua màn gia sư với quyền `tutors.suspend`.
                </div>
              )}
              <ConfirmReasonDialog
                trigger={<Button className="w-full" disabled={!canManage || busy || !resolutionNote.trim()}><CheckCircle2 className="h-4 w-4" />Resolve</Button>}
                title="Resolve complaint"
                description="Case sẽ chuyển RESOLVED, ghi resolution và audit."
                actionName="Resolve"
                severity="warning"
                onConfirm={(reason, detail) => run(() => adminOperationService.resolveDispute(id, { resolutionType, resolutionNote: resolutionNote.trim(), reason: detail || reason }), "Đã resolve case")}
              />
              <ConfirmReasonDialog
                trigger={<Button variant="outline" className="w-full" disabled={!canManage || busy}>Close case</Button>}
                title="Close complaint"
                description="Chỉ close khi case đã xử lý xong và không còn follow-up."
                actionName="Close"
                severity="warning"
                onConfirm={(reason, detail) => run(() => adminOperationService.closeDispute(id, { reason: detail || reason }), "Đã close case")}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value || "Không có"}</p>
    </div>
  )
}

function SeverityBadge({ value, label }: { value: string; label?: string }) {
  const tone = value === "CRITICAL" ? "border-red-200 bg-red-50 text-red-700" : value === "HIGH" ? "border-amber-200 bg-amber-50 text-amber-700" : value === "LOW" ? "border-slate-200 bg-slate-50 text-slate-600" : "border-blue-200 bg-blue-50 text-blue-700"
  return <Badge className={tone} variant="outline">{label ? `${label}: ${value}` : value}</Badge>
}

function targetHref(item: CaseRow) {
  const relatedType = text(item, "relatedType")
  const relatedId = text(item, "relatedId", "bookingId")
  if (relatedType === "PAYMENT") return `/admin/payments?id=${encodeURIComponent(relatedId)}`
  if (relatedType === "PAYOUT") return `/admin/payouts?id=${encodeURIComponent(relatedId)}`
  if (relatedType === "CLASS") return `/admin/classes/${encodeURIComponent(relatedId)}`
  if (relatedType === "SESSION") return `/admin/sessions?id=${encodeURIComponent(relatedId)}`
  if (relatedType === "TUTOR") return `/admin/tutors/${encodeURIComponent(relatedId)}`
  if (relatedType === "USER") return `/admin/students?id=${encodeURIComponent(relatedId)}`
  return `/admin/bookings/${encodeURIComponent(text(item, "bookingId", "relatedId"))}`
}

function text(item: CaseRow | undefined, ...keys: string[]) {
  if (!item) return ""
  for (const key of keys) {
    const value = item[key]
    if (value !== undefined && value !== null && String(value).trim()) return String(value)
  }
  return ""
}

function array(value: unknown): CaseRow[] {
  return Array.isArray(value) ? value as CaseRow[] : []
}

function safeDate(value: string) {
  return value ? formatDateTime(value) : "Không có"
}
