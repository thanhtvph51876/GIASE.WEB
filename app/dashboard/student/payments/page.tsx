"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, CreditCard, Receipt, RotateCw, WalletCards } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardMetricCard, EmptyState, EntityCard, LoadingSkeleton, PageHero, PaymentStatusBadge } from "@/components/platform/operational-components"
import {
  PaymentDocumentActions,
  PaymentExpiry,
  PaymentMethodCard,
  PaymentQRCodeModal,
  PaymentQuickFacts,
  SecurePaymentBanner,
  paymentGatewayOptions,
} from "@/components/payment/payment-trust-ui"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { paymentService } from "@/lib/services"
import { formatCurrency, formatDate } from "@/lib/helpers"
import type { Payment } from "@/types"
import type { PaymentCheckout, PaymentSettings } from "@/lib/api/payment-api"

type PaymentFilter = "all" | "pending" | "processing" | "paid" | "failed" | "refunded"

const filterLabels: Record<PaymentFilter, string> = {
  all: "Tất cả",
  failed: "Thất bại",
  paid: "Đã thanh toán",
  pending: "Chờ thanh toán",
  processing: "Đang xử lý",
  refunded: "Hoàn tiền",
}

export default function StudentPaymentsPage() {
  const { user } = useAuthContext()
  const [payments, setPayments] = useState<Payment[]>([])
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [selectedGateway, setSelectedGateway] = useState("mock")
  const [filter, setFilter] = useState<PaymentFilter>("all")
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [checkout, setCheckout] = useState<PaymentCheckout | null>(null)

  const load = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [paymentRows, paymentSettings] = await Promise.all([
        paymentService.getPaymentsByStudent(user.id),
        paymentService.getSettings(),
      ])
      setPayments(paymentRows)
      setSettings(paymentSettings)
      setSelectedGateway(paymentSettings.defaultGateway || paymentSettings.enabledGateways[0] || "mock")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được dữ liệu thanh toán")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  const enabledGateways = settings?.enabledGateways?.length ? settings.enabledGateways : ["mock"]
  const gateways = paymentGatewayOptions.filter((gateway) => enabledGateways.includes(gateway.id))

  const filteredPayments = useMemo(() => {
    if (filter === "all") return payments
    if (filter === "paid") return payments.filter((item) => item.status === "paid" || item.status === "completed")
    if (filter === "refunded") return payments.filter((item) => item.status === "refunded" || item.status === "partially_refunded")
    return payments.filter((item) => item.status === filter)
  }, [filter, payments])

  const paidTotal = payments.filter((item) => item.status === "paid" || item.status === "completed").reduce((sum, item) => sum + item.amount, 0)
  const pendingCount = payments.filter((item) => item.status === "pending" || item.status === "processing" || item.status === "failed").length

  const createCheckout = async (paymentId: string) => {
    setBusyId(paymentId)
    const result = await paymentService.createCheckout(paymentId, selectedGateway)
    setBusyId(null)
    if (result.success && result.checkout) {
      toast.success("Đã tạo phiên thanh toán")
      setCheckout(result.checkout)
      load()
      if (result.checkout.checkoutUrl && !result.checkout.qrCodeUrl && !result.checkout.checkoutUrl.includes("localhost")) {
        window.location.href = result.checkout.checkoutUrl
      }
    } else {
      toast.error(result.error || "Không thể tạo phiên thanh toán")
    }
  }

  const mockPay = async (paymentId: string) => {
    setBusyId(paymentId)
    const result = await paymentService.markAsPaid(paymentId, user)
    setBusyId(null)
    if (result.success) {
      toast.success("Thanh toán demo đã được ghi nhận")
      load()
    } else {
      toast.error(result.error || "Không thể ghi nhận thanh toán demo")
    }
  }

  const refreshStatus = async (paymentId: string) => {
    setBusyId(paymentId)
    const result = await paymentService.refreshPaymentStatus(paymentId)
    setBusyId(null)
    if (result.success) {
      toast.success("Đã cập nhật trạng thái thanh toán")
      load()
    } else {
      toast.error(result.error || "Không kiểm tra được trạng thái")
    }
  }

  const showDocument = async (paymentId: string, type: "invoice" | "receipt") => {
    try {
      const data = type === "invoice" ? await paymentService.getInvoice(paymentId) : await paymentService.getReceipt(paymentId)
      const code = type === "invoice" ? data.invoiceNo : data.receiptNo
      toast.success(`${type === "invoice" ? "Hóa đơn" : "Biên lai"} ${String(code || "")} đã sẵn sàng`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chưa có chứng từ cho giao dịch này")
    }
  }

  if (loading) return <LoadingSkeleton label="Đang tải trung tâm thanh toán..." />

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Student finance"
        title="Thanh toán học phí"
        description="Theo dõi khoản cần thanh toán, tạo phiên checkout an toàn và tải hóa đơn/biên lai sau khi giao dịch thành công."
        icon={WalletCards}
        actions={<Button asChild variant="outline"><a href="/payments/history">Lịch sử</a></Button>}
        stats={[
          { label: "Giao dịch", value: payments.length },
          { label: "Cần xử lý", value: pendingCount },
          { label: "Đã thanh toán", value: formatCurrency(paidTotal) },
        ]}
      />

      <SecurePaymentBanner mode={settings?.paymentMode} />

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Tổng giao dịch" value={payments.length} icon={Receipt} tone="blue" helper="Từ lớp và buổi học" />
        <DashboardMetricCard label="Cần xử lý" value={pendingCount} icon={AlertCircle} tone={pendingCount ? "amber" : "emerald"} helper="Pending, processing hoặc failed" />
        <DashboardMetricCard label="Đã thanh toán" value={formatCurrency(paidTotal)} icon={CheckCircle2} tone="emerald" helper="Đã có thể tải biên lai" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Card className="border-slate-200/80 bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle>Phương thức thanh toán</CardTitle>
              <CardDescription>Chọn gateway trước khi bấm thanh toán. Ở sandbox/production, trạng thái paid chỉ cập nhật sau khi backend xác minh webhook hoặc giao dịch.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {gateways.map((gateway) => (
                <PaymentMethodCard
                  key={gateway.id}
                  active={selectedGateway === gateway.id}
                  disabled={settings?.paymentMode !== "mock" && gateway.id === "mock"}
                  gateway={gateway}
                  onClick={() => setSelectedGateway(gateway.id)}
                />
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(Object.keys(filterLabels) as PaymentFilter[]).map((item) => (
              <Button key={item} size="sm" variant={filter === item ? "default" : "outline"} onClick={() => setFilter(item)}>
                {filterLabels[item]}
              </Button>
            ))}
          </div>

          {filteredPayments.length ? (
            <div className="space-y-3">
              {filteredPayments.map((payment) => {
                const canPay = ["pending", "processing", "failed", "expired"].includes(payment.status)
                const paid = payment.status === "paid" || payment.status === "completed"
                return (
                  <EntityCard
                    key={payment.id}
                    title={formatCurrency(payment.amount)}
                    subtitle={payment.description || payment.id}
                    meta={`${formatDate(payment.createdAt)}${payment.gateway ? ` · ${payment.gateway}` : ""}`}
                    icon={CreditCard}
                    tone={payment.status === "failed" || payment.status === "expired" ? "rose" : canPay ? "amber" : payment.status === "refunded" ? "slate" : "emerald"}
                    badge={<PaymentStatusBadge status={payment.status} />}
                    actions={(
                      <div className="flex flex-wrap items-center gap-2">
                        {payment.expiredAt && <PaymentExpiry expiredAt={payment.expiredAt} />}
                        {canPay && (
                          <Button size="sm" disabled={busyId === payment.id} onClick={() => createCheckout(payment.id)}>
                            {busyId === payment.id ? "Đang tạo..." : "Thanh toán ngay"}
                          </Button>
                        )}
                        {settings?.paymentMode === "mock" && canPay && (
                          <Button size="sm" variant="outline" disabled={busyId === payment.id} onClick={() => mockPay(payment.id)}>
                            Ghi nhận demo
                          </Button>
                        )}
                        {(payment.status === "processing" || payment.status === "pending") && (
                          <Button size="sm" variant="outline" disabled={busyId === payment.id} onClick={() => refreshStatus(payment.id)}>
                            <RotateCw className="h-4 w-4" />
                            Kiểm tra
                          </Button>
                        )}
                        <PaymentDocumentActions
                          disabled={!paid}
                          onInvoice={() => showDocument(payment.id, "invoice")}
                          onReceipt={() => showDocument(payment.id, "receipt")}
                        />
                      </div>
                    )}
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState title="Chưa có giao dịch phù hợp" description="Thử đổi bộ lọc hoặc quay lại sau khi hệ thống tạo học phí cho lớp/buổi học." />
          )}
        </div>

        <PaymentQuickFacts>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="font-semibold text-slate-800">Cần hỗ trợ?</p>
            <p className="mt-1 text-sm text-muted-foreground">Nếu giao dịch bị treo hoặc bị trừ tiền nhưng chưa cập nhật, hãy gửi mã giao dịch cho bộ phận hỗ trợ.</p>
            <Button size="sm" variant="outline" className="mt-3" asChild>
              <a href="/contact">Báo lỗi thanh toán</a>
            </Button>
          </div>
        </PaymentQuickFacts>
      </div>

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
