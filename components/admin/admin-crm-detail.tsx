"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Flag, RefreshCw, ShieldAlert, StickyNote } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/ui/status-badge"
import { ErrorState, LoadingSkeleton } from "@/components/platform/operational-components"
import { hasAdminPermission } from "@/lib/admin/admin-permissions"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { formatCurrency, formatDateTime } from "@/lib/helpers"
import { adminService } from "@/lib/services"
import type { AdminRiskFlag, AdminTutorCrm, AdminUserCrm } from "@/types"

type CrmEntity = "student" | "parent" | "tutor"
type CrmData = AdminUserCrm | AdminTutorCrm

const entityLabels: Record<CrmEntity, string> = {
  student: "học sinh",
  parent: "phụ huynh",
  tutor: "gia sư",
}

export function AdminCrmDetail({ id, entity, backHref }: { id: string; entity: CrmEntity; backHref: string }) {
  const { user: actor } = useAuthContext()
  const canManageCrm = hasAdminPermission(actor, "crm.manage")
  const [data, setData] = useState<CrmData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [riskLevel, setRiskLevel] = useState("MEDIUM")
  const [riskReason, setRiskReason] = useState("")
  const [riskNote, setRiskNote] = useState("")
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setData(entity === "tutor" ? await adminService.getTutorCrm(id) : await adminService.getUserCrm(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được CRM detail")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id, entity])

  const profileName = useMemo(() => {
    if (!data) return ""
    return isTutorCrm(data) ? data.tutor.fullName : data.user.fullName
  }, [data])

  const addNote = async () => {
    if (!note.trim()) return
    setBusy(true)
    try {
      if (entity === "tutor") await adminService.addTutorNote(id, note.trim())
      else await adminService.addUserNote(id, note.trim())
      setNote("")
      toast.success("Đã lưu ghi chú nội bộ")
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không lưu được ghi chú")
    } finally {
      setBusy(false)
    }
  }

  const addRiskFlag = async () => {
    if (!riskReason.trim()) return
    setBusy(true)
    try {
      const body = { level: riskLevel, reason: riskReason.trim(), note: riskNote.trim() || undefined }
      if (entity === "tutor") await adminService.addTutorRiskFlag(id, body)
      else await adminService.addUserRiskFlag(id, body)
      setRiskReason("")
      setRiskNote("")
      toast.success("Đã gắn cờ rủi ro")
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không gắn được cờ rủi ro")
    } finally {
      setBusy(false)
    }
  }

  const resolveRiskFlag = async (flag: AdminRiskFlag) => {
    setBusy(true)
    try {
      if (entity === "tutor") await adminService.resolveTutorRiskFlag(id, flag.id)
      else await adminService.resolveUserRiskFlag(id, flag.id)
      toast.success("Đã xử lý cờ rủi ro")
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không xử lý được cờ rủi ro")
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <LoadingSkeleton label="Đang tải CRM detail..." />
  if (error || !data) return <ErrorState message={error || "Không có dữ liệu CRM"} onRetry={load} />

  const tutor = isTutorCrm(data) ? data.tutor : null
  const account = data.user

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
              <Link href={backHref}><ArrowLeft /> Quay lại</Link>
            </Button>
            <h1 className="text-2xl font-bold text-slate-950">CRM {entityLabels[entity]}: {profileName}</h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Hồ sơ vận hành gồm lịch sử request, booking, lớp, thanh toán, complaint, note và risk flag.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw /> Tải lại
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin chính</CardTitle>
            <CardDescription>{account.email} · {account.phone || "Chưa có SĐT"}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Info label="User ID" value={account.id} />
            <Info label="Role" value={account.role} />
            <Info label="Trạng thái tài khoản" value={<StatusBadge kind="user" status={account.status} />} />
            {tutor && <Info label="Tutor ID" value={tutor.id} />}
            {tutor && <Info label="Trạng thái hồ sơ" value={<StatusBadge kind="approval" status={tutor.approvalStatus} />} />}
            {tutor && <Info label="Rating" value={`${tutor.rating || 0} (${tutor.reviewCount || 0} đánh giá)`} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chỉ số vận hành</CardTitle>
            <CardDescription>Các số liệu backend tổng hợp cho hồ sơ này.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {Object.entries(data.summary || {}).map(([key, value]) => (
              <Metric key={key} label={metricLabel(key)} value={metricValue(key, value)} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldAlert className="size-5" /> Risk flags</CardTitle>
            <CardDescription>Cờ manual lưu DB và cờ derived do backend tính từ complaint/refund/status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {data.riskFlags.map((flag) => (
                <div key={`${flag.source}-${flag.id}`} className="rounded-lg border bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={riskTone(flag.level)}>{flag.level}</Badge>
                      <p className="font-semibold text-slate-900">{flag.reason}</p>
                      <Badge variant="secondary">{flag.source === "derived" ? "Derived" : "Manual"}</Badge>
                    </div>
                    {canManageCrm && flag.active && flag.source !== "derived" && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => resolveRiskFlag(flag)}>Xử lý</Button>
                    )}
                  </div>
                  {flag.note && <p className="mt-2 text-sm text-muted-foreground">{flag.note}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">{flag.createdByName || "Backend"} · {safeDate(flag.createdAt)}</p>
                </div>
              ))}
              {!data.riskFlags.length && <EmptyLine text="Chưa có risk flag." />}
            </div>

            {canManageCrm && (
              <div className="space-y-2 rounded-lg border p-3">
                <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
                  <select className="h-10 rounded-lg border bg-white px-3 text-sm" value={riskLevel} onChange={(event) => setRiskLevel(event.target.value)}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                  <Input value={riskReason} onChange={(event) => setRiskReason(event.target.value)} placeholder="Lý do, ví dụ PAYMENT_REVIEW" />
                </div>
                <Textarea value={riskNote} onChange={(event) => setRiskNote(event.target.value)} rows={3} placeholder="Ghi chú risk flag..." />
                <Button size="sm" disabled={busy || !riskReason.trim()} onClick={addRiskFlag}><Flag /> Gắn cờ</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><StickyNote className="size-5" /> Ghi chú nội bộ</CardTitle>
            <CardDescription>Chỉ dùng trong admin, có audit khi thêm note mới.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {canManageCrm && (
              <div className="space-y-2">
                <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Nhập ghi chú chăm sóc, kiểm tra, rủi ro..." />
                <Button size="sm" disabled={busy || !note.trim()} onClick={addNote}>Lưu ghi chú</Button>
              </div>
            )}
            <div className="space-y-2">
              {data.notes.map((item) => (
                <div key={item.id} className="rounded-lg border bg-slate-50 p-3">
                  <p className="text-sm text-slate-900">{item.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{item.createdByName || "Admin"} · {safeDate(item.createdAt)}</p>
                </div>
              ))}
              {!data.notes.length && <EmptyLine text="Chưa có ghi chú nội bộ." />}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <RecordSection title="Learning requests" items={data.learningRequests} statusKind="learningRequest" primaryKey="requestCode" secondaryKey="subject" />
        <RecordSection title="Bookings" items={data.bookings} statusKind="booking" primaryKey="studentName" secondaryKey="preferredTime" />
        <RecordSection title="Classes" items={data.classes} statusKind="class" primaryKey="title" secondaryKey="subject" />
        <RecordSection title="Sessions" items={data.sessions} statusKind="session" primaryKey="subject" secondaryKey="startTime" />
        <RecordSection title="Payments" items={data.payments} statusKind="payment" primaryKey="description" amountKey="amount" />
        <RecordSection title="Refunds" items={data.refunds} primaryKey="reason" amountKey="amount" />
        {isTutorCrm(data) && <RecordSection title="Payouts" items={data.payouts} statusKind="payout" primaryKey="tutorName" amountKey="amount" />}
        {isTutorCrm(data) && <RecordSection title="Earnings" items={data.earnings} statusKind="earning" primaryKey="status" amountKey="netAmount" />}
        <ComplaintSection items={data.complaints} />
        <RecordSection title="Reviews" items={data.reviews} statusKind="review" primaryKey="content" secondaryKey="rating" />
        <RecordSection title="Conversations" items={data.conversations} primaryKey="title" secondaryKey="lastMessage" />
        <RecordSection title="Audit gần đây" items={data.auditLogs} primaryKey="action" secondaryKey="description" />
      </div>
    </div>
  )
}

function isTutorCrm(data: CrmData): data is AdminTutorCrm {
  return "tutor" in data
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <div className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-950">{value}</p>
    </div>
  )
}

function RecordSection({
  title,
  items,
  statusKind,
  primaryKey,
  secondaryKey,
  amountKey,
}: {
  title: string
  items: unknown[]
  statusKind?: Parameters<typeof StatusBadge>[0]["kind"]
  primaryKey: string
  secondaryKey?: string
  amountKey?: string
}) {
  const rows = items.map((item) => (item && typeof item === "object" ? (item as Record<string, unknown>) : {}))
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{rows.length} bản ghi gần nhất.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.slice(0, 8).map((item, index) => (
          <div key={String(item.id || index)} className="rounded-lg border bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">{displayValue(item[primaryKey]) || displayValue(item.id) || "Bản ghi"}</p>
              {statusKind && item.status ? <StatusBadge kind={statusKind} status={String(item.status)} /> : item.status ? <Badge variant="outline">{String(item.status)}</Badge> : null}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {secondaryKey && item[secondaryKey] !== undefined && <span>{displayValue(item[secondaryKey])}</span>}
              {amountKey && item[amountKey] !== undefined && <span>{formatCurrency(Number(item[amountKey] || 0))}</span>}
              <span>{safeDate(String(item.createdAt || item.updatedAt || ""))}</span>
            </div>
          </div>
        ))}
        {!rows.length && <EmptyLine text="Chưa có dữ liệu." />}
      </CardContent>
    </Card>
  )
}

function ComplaintSection({ items }: { items: AdminUserCrm["complaints"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complaints</CardTitle>
        <CardDescription>Khiếu nại liên quan hồ sơ này, chỉ phản ánh case và không tự mutate finance/tutor.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.slice(0, 8).map((item) => (
          <div key={item.id} className="rounded-lg border bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">{item.title || item.reason || item.id}</p>
              <StatusBadge kind="dispute" status={item.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.description || item.resolutionNote || "Chưa có mô tả"}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">Priority {item.priority || "N/A"}</Badge>
              <Badge variant="outline">Risk {item.riskLevel || "N/A"}</Badge>
              {item.assignedAdminName && <span>Owner: {item.assignedAdminName}</span>}
              <span>{safeDate(item.createdAt)}</span>
            </div>
          </div>
        ))}
        {!items.length && <EmptyLine text="Chưa có complaint." />}
      </CardContent>
    </Card>
  )
}

function EmptyLine({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">{text}</div>
}

function metricLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase())
}

function metricValue(key: string, value: unknown) {
  if (typeof value === "number" && /(amount|revenue|paid)/i.test(key)) return formatCurrency(value)
  if (typeof value === "number") return new Intl.NumberFormat("vi-VN").format(value)
  return value === undefined || value === null || value === "" ? "0" : String(value)
}

function displayValue(value: unknown) {
  if (value === undefined || value === null || value === "") return ""
  if (Array.isArray(value)) return value.join(", ")
  if (typeof value === "object") return ""
  return String(value)
}

function safeDate(value?: string) {
  if (!value) return "Chưa có thời gian"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : formatDateTime(date)
}

function riskTone(level: string) {
  if (level === "CRITICAL" || level === "HIGH") return "border-red-200 bg-red-50 text-red-700"
  if (level === "MEDIUM") return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-emerald-200 bg-emerald-50 text-emerald-700"
}
