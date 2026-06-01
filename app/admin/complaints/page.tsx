"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { adminOperationService } from "@/lib/services/admin-operation-service"
import { formatDateTime } from "@/lib/helpers"

type DisputeRow = Record<string, unknown>

export default function AdminComplaintsPage() {
  const { user } = useAuthContext()
  const [disputes, setDisputes] = useState<DisputeRow[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const canUpdateDispute = user?.role === "admin" || user?.role === "system_admin"

  useEffect(() => {
    adminOperationService.disputes().then(setDisputes).catch(() => setDisputes([]))
  }, [])

  const updateDispute = async (item: DisputeRow, status: "IN_REVIEW" | "RESOLVED" | "REJECTED", resolution: string) => {
    const id = text(item, "id")
    if (!id) return
    setBusyId(id)
    try {
      const updated = await adminOperationService.updateDispute(id, { status, resolution })
      setDisputes((current) => current.map((row) => text(row, "id") === id ? updated : row))
      toast.success("Đã cập nhật khiếu nại")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật khiếu nại")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold">Khiếu nại</h1>
        <p className="text-sm text-muted-foreground">Theo dõi dispute queue, xác định đối tượng liên quan và chuyển sang module xử lý phù hợp.</p>
      </div>
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
                <p className="mt-2 text-xs text-muted-foreground">{resolutionHint(item)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ComplaintDetailDialog item={item} />
                <ConfirmReasonDialog
                  trigger={<Button size="sm" variant="outline" disabled={!canUpdateDispute || busyId === text(item, "id")}>Tiếp nhận</Button>}
                  title="Tiếp nhận khiếu nại"
                  description="Chuyển dispute sang IN_REVIEW để ghi nhận admin đã bắt đầu xử lý."
                  actionName="Tiếp nhận"
                  severity="warning"
                  requireReason={false}
                  onConfirm={(reason, note) => updateDispute(item, "IN_REVIEW", note || reason)}
                />
                <ConfirmReasonDialog
                  trigger={<Button size="sm" variant="outline" disabled={!canUpdateDispute || busyId === text(item, "id")}>Đã xử lý</Button>}
                  title="Đánh dấu đã xử lý"
                  description="Chỉ dùng khi đã có kết luận và phương án xử lý rõ ràng."
                  actionName="Resolve"
                  severity="warning"
                  reasonOptions={[
                    { value: "REFUND_OR_ADJUSTMENT_DONE", label: "Đã hoàn tiền/điều chỉnh" },
                    { value: "REMEDIATION_DONE", label: "Đã xử lý học bù/đổi gia sư" },
                    { value: "OTHER", label: "Kết luận khác" },
                  ]}
                  onConfirm={(reason, note) => updateDispute(item, "RESOLVED", note || reason)}
                />
                <ConfirmReasonDialog
                  trigger={<Button size="sm" variant="outline" disabled={!canUpdateDispute || busyId === text(item, "id")}>Từ chối</Button>}
                  title="Từ chối khiếu nại"
                  description="Dùng khi khiếu nại không đủ căn cứ; lý do sẽ lưu vào resolution."
                  actionName="Từ chối"
                  severity="danger"
                  reasonOptions={[
                    { value: "INSUFFICIENT_EVIDENCE", label: "Không đủ căn cứ" },
                    { value: "POLICY_NOT_ELIGIBLE", label: "Không đủ điều kiện theo policy" },
                    { value: "OTHER", label: "Lý do khác" },
                  ]}
                  onConfirm={(reason, note) => updateDispute(item, "REJECTED", note || reason)}
                />
                <Button asChild size="sm" variant="outline">
                  <Link href={targetHref(item)}>
                    Mở module xử lý
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
            </div>
          )) : <EmptyState title="Chưa có khiếu nại mới" description="Queue này dùng /admin/disputes; khi backend có dữ liệu sẽ hiển thị tại đây thay vì empty state tĩnh." />}
        </CardContent>
      </Card>
    </div>
  )
}

function ComplaintDetailDialog({ item }: { item: DisputeRow }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Chi tiết</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{text(item, "title", "subject", "requestCode", "bookingId", "id") || "Dispute"}</DialogTitle>
          <DialogDescription>Thông tin để admin xác định hướng xử lý, module liên quan và trạng thái hiện tại.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Trạng thái" value={text(item, "status", "disputeStatus", "riskLevel") || "open"} />
          <Info label="Mức độ" value={text(item, "priority", "severity", "riskLevel") || "Chưa phân loại"} />
          <Info label="Học viên/phụ huynh" value={text(item, "studentName", "parentName", "studentId", "parentId") || "Không có"} />
          <Info label="Gia sư" value={text(item, "tutorName", "tutorId") || "Không có"} />
          <Info label="Booking" value={text(item, "bookingId") || "Không gắn"} />
          <Info label="Payment" value={text(item, "paymentId") || "Không gắn"} />
          <Info label="Tạo lúc" value={safeDate(text(item, "createdAt"))} />
          <Info label="Cập nhật" value={safeDate(text(item, "updatedAt"))} />
          <div className="rounded-lg border bg-slate-50 p-3 md:col-span-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Hướng xử lý đề xuất</p>
            <p className="mt-1 text-sm leading-6 text-slate-900">{resolutionHint(item)}</p>
          </div>
          <pre className="max-h-56 overflow-auto rounded-lg border bg-slate-950 p-3 text-xs text-slate-50 md:col-span-2">{JSON.stringify(item, null, 2)}</pre>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
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

function targetHref(item: DisputeRow) {
  const paymentId = text(item, "paymentId")
  const payoutId = text(item, "payoutId")
  const bookingId = text(item, "bookingId")
  const classId = text(item, "classId")
  const tutorId = text(item, "tutorId")
  if (paymentId) return `/admin/payments?id=${encodeURIComponent(paymentId)}`
  if (payoutId) return `/admin/payouts?id=${encodeURIComponent(payoutId)}`
  if (bookingId) return `/admin/bookings?id=${encodeURIComponent(bookingId)}`
  if (classId) return `/admin/classes?id=${encodeURIComponent(classId)}`
  if (tutorId) return `/admin/tutors/${encodeURIComponent(tutorId)}`
  return "/admin/operations"
}

function resolutionHint(item: DisputeRow) {
  if (text(item, "paymentId")) return "Ưu tiên đối soát thanh toán/refund, sau đó cập nhật audit và thông báo lại cho phụ huynh."
  if (text(item, "payoutId")) return "Kiểm tra earning item, ngân hàng và trạng thái payout trước khi duyệt/từ chối."
  if (text(item, "bookingId")) return "Kiểm tra booking học thử, no-show, lịch học và quyết định gán lại hoặc hủy."
  if (text(item, "classId")) return "Kiểm tra lớp, session, học phí và trạng thái tạm dừng/hoàn thành/hủy."
  if (text(item, "tutorId")) return "Rà hồ sơ gia sư, review thấp, no-show và cân nhắc yêu cầu cập nhật hoặc khóa."
  return "Phân loại đối tượng liên quan trước, sau đó xử lý tại module tương ứng và dùng audit log để theo dõi."
}

function safeDate(value: string) {
  return value ? formatDateTime(value) : "Không có"
}
