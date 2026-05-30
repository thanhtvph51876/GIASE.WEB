"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { AlertCircle, CreditCard, Receipt, WalletCards } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardMetricCard, EmptyState, EntityCard, ErrorState, LoadingSkeleton, PaymentStatusBadge, PageHero } from "@/components/platform/operational-components"
import { PaymentQRCodeModal } from "@/components/payment/payment-trust-ui"
import { parentService } from "@/lib/services/parent-service"
import { paymentService } from "@/lib/services"
import { formatCurrency, formatDate } from "@/lib/helpers"
import type { Payment } from "@/types"
import type { PaymentCheckout } from "@/lib/api/payment-api"

type PaymentFilter = "all" | "unpaid" | "paid" | "failed" | "refunded"

export default function ParentPaymentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedStudentId, setSelectedStudentId] = useState(searchParams.get("childId") || "")
  const [filter, setFilter] = useState<PaymentFilter>("all")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [checkout, setCheckout] = useState<PaymentCheckout | null>(null)
  const students = useSWR("parent-students", () => parentService.listStudents(), { revalidateOnFocus: false })
  const payments = useSWR(selectedStudentId ? ["parent-payments", selectedStudentId] : null, () => parentService.getStudentPayments(selectedStudentId), { revalidateOnFocus: false })

  useEffect(() => {
    if (!selectedStudentId && students.data?.[0]?.id) {
      const id = String(students.data[0].id)
      setSelectedStudentId(id)
      router.replace(`/dashboard/parent/payments?childId=${id}`)
    }
  }, [router, selectedStudentId, students.data])

  const rows = useMemo(() => (payments.data || []) as unknown as Payment[], [payments.data])
  const filteredPayments = useMemo(() => {
    if (filter === "all") return rows
    if (filter === "unpaid") return rows.filter((item) => ["pending", "processing", "failed", "expired"].includes(String(item.status)))
    if (filter === "paid") return rows.filter((item) => ["paid", "completed"].includes(String(item.status)))
    if (filter === "refunded") return rows.filter((item) => ["refunded", "partially_refunded"].includes(String(item.status)))
    return rows.filter((item) => String(item.status) === filter)
  }, [filter, rows])
  const paidTotal = rows.filter((item) => ["paid", "completed"].includes(String(item.status))).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const unpaidCount = rows.filter((item) => ["pending", "processing", "failed", "expired"].includes(String(item.status))).length

  const changeStudent = (id: string) => {
    setSelectedStudentId(id)
    router.replace(`/dashboard/parent/payments?childId=${id}`)
  }

  const createCheckout = async (paymentId: string) => {
    setBusyId(paymentId)
    const result = await paymentService.createCheckout(paymentId, "bank_qr")
    setBusyId(null)
    if (result.success && result.checkout) {
      setCheckout(result.checkout)
      toast.success("Đã tạo phiên thanh toán")
      payments.mutate()
    } else {
      toast.error(result.error || "Không thể tạo phiên thanh toán. Tài khoản phụ huynh cần quyền thanh toán cho học sinh này.")
    }
  }

  if (students.isLoading) return <LoadingSkeleton label="Đang tải danh sách học sinh..." />
  if (students.error) return <ErrorState message="Không tải được danh sách học sinh." onRetry={() => students.mutate()} />
  if (!students.data?.length) return <EmptyState title="Chưa có hồ sơ học sinh" href="/register-student" actionLabel="Tạo yêu cầu học" />
  if (payments.isLoading) return <LoadingSkeleton label="Đang tải thanh toán theo học sinh..." />
  if (payments.error) return <ErrorState message="Không tải được thanh toán." onRetry={() => payments.mutate()} />

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Parent finance"
        title="Thanh toán theo từng con"
        description="Chọn học sinh để xem khoản cần thanh toán, trạng thái giao dịch, invoice và receipt."
        icon={WalletCards}
        stats={[
          { label: "Giao dịch", value: rows.length },
          { label: "Cần xử lý", value: unpaidCount },
          { label: "Đã thanh toán", value: formatCurrency(paidTotal) },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Tổng giao dịch" value={rows.length} icon={Receipt} tone="blue" />
        <DashboardMetricCard label="Cần xử lý" value={unpaidCount} icon={AlertCircle} tone={unpaidCount ? "amber" : "emerald"} />
        <DashboardMetricCard label="Đã thanh toán" value={formatCurrency(paidTotal)} icon={CreditCard} tone="emerald" />
      </div>
      <div className="surface-panel grid gap-3 p-4 md:grid-cols-[1fr_220px]">
        <Select value={selectedStudentId} onValueChange={changeStudent}>
          <SelectTrigger><SelectValue placeholder="Chọn học sinh" /></SelectTrigger>
          <SelectContent>
            {students.data.map((student) => (
              <SelectItem key={String(student.id)} value={String(student.id)}>
                {String(student.fullName || student.studentName || "Học sinh")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filter} onValueChange={(value) => setFilter(value as PaymentFilter)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
            <SelectItem value="paid">Đã thanh toán</SelectItem>
            <SelectItem value="failed">Thất bại</SelectItem>
            <SelectItem value="refunded">Hoàn tiền</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredPayments.length ? (
        <div className="space-y-3">
          {filteredPayments.map((payment) => {
            const canPay = ["pending", "processing", "failed", "expired"].includes(String(payment.status))
            return (
              <EntityCard
                key={payment.id}
                title={formatCurrency(Number(payment.amount || 0))}
                subtitle={payment.description || payment.id}
                meta={`${formatDate(payment.createdAt)}${payment.gateway ? ` · ${payment.gateway}` : ""}`}
                icon={CreditCard}
                tone={canPay ? "amber" : payment.status === "failed" ? "rose" : "emerald"}
                badge={<PaymentStatusBadge status={payment.status} />}
                actions={canPay && (
                  <Button size="sm" disabled={busyId === payment.id} onClick={() => createCheckout(payment.id)}>
                    {busyId === payment.id ? "Đang tạo..." : "Thanh toán"}
                  </Button>
                )}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState
          title="Chưa có khoản thanh toán"
          description="Không có giao dịch phù hợp với học sinh và bộ lọc đang chọn. Payment sẽ xuất hiện khi buổi học hoàn thành hoặc admin tạo khoản cần thanh toán."
        />
      )}

      <PaymentQRCodeModal
        checkoutUrl={checkout?.checkoutUrl}
        gateway={checkout?.gateway}
        onOpenChange={(open) => !open && setCheckout(null)}
        open={Boolean(checkout)}
        qrCodeUrl={checkout?.qrCodeUrl}
      />
    </div>
  )
}
