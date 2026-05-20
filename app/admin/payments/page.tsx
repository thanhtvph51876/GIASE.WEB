"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, CreditCard, History, ReceiptText, RefreshCw, ShieldAlert, WalletCards } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardMetricCard, EmptyState, EntityCard, LoadingSkeleton, PageHero, PaymentStatusBadge } from "@/components/platform/operational-components"
import { SecurePaymentBanner, TransactionTimeline } from "@/components/payment/payment-trust-ui"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { paymentService } from "@/lib/services"
import { formatCurrency, formatDate } from "@/lib/helpers"
import type { Payment } from "@/types"
import type { PaymentRefund, PaymentSettings, PaymentTransaction, PaymentWebhookEvent } from "@/lib/api/payment-api"

type FinanceTab = "payments" | "transactions" | "webhooks" | "refunds"

export default function AdminPaymentsPage() {
  const { user } = useAuthContext()
  const [payments, setPayments] = useState<Payment[]>([])
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [webhooks, setWebhooks] = useState<PaymentWebhookEvent[]>([])
  const [refunds, setRefunds] = useState<PaymentRefund[]>([])
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [tab, setTab] = useState<FinanceTab>("payments")
  const [gatewayFilter, setGatewayFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [paymentRows, txRows, webhookRows, refundRows, paymentSettings] = await Promise.all([
        paymentService.getAllPayments(),
        paymentService.getPaymentTransactions(),
        paymentService.getWebhookEvents(),
        paymentService.getRefunds(),
        paymentService.getSettings(),
      ])
      setPayments(paymentRows)
      setTransactions(txRows)
      setWebhooks(webhookRows)
      setRefunds(refundRows)
      setSettings(paymentSettings)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được dữ liệu payment ops")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const update = async (id: string, action: "paid" | "failed" | "refunded") => {
    setBusyId(id)
    const result =
      action === "paid"
        ? await paymentService.markAsPaid(id, user)
        : action === "failed"
          ? await paymentService.markAsFailed(id, user)
          : await paymentService.refundPayment(id, user)
    setBusyId(null)
    if (result.success) {
      toast.success("Đã cập nhật thanh toán")
      load()
    } else toast.error(result.error || "Không thể cập nhật")
  }

  const gatewayOptions = useMemo(() => {
    const values = Array.from(new Set(payments.map((item) => item.gateway).filter(Boolean))) as string[]
    return ["all", ...values]
  }, [payments])

  const visiblePayments = gatewayFilter === "all" ? payments : payments.filter((item) => item.gateway === gatewayFilter)
  const paid = payments.filter((item) => item.status === "paid" || item.status === "completed")
  const riskWebhooks = webhooks.filter((item) => !item.signatureValid || Boolean(item.processingError))

  if (loading) return <LoadingSkeleton label="Đang tải payment operation console..." />

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Finance ops"
        title="Payment Operation Console"
        description="Quản lý thanh toán, transaction, webhook, refund và audit vận hành tài chính theo kiến trúc gateway-ready."
        icon={WalletCards}
        actions={<Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" />Làm mới</Button>}
        stats={[
          { label: "Tổng giao dịch", value: payments.length },
          { label: "Đã thanh toán", value: paid.length },
          { label: "Webhook cần xem", value: riskWebhooks.length },
          { label: "Doanh thu", value: formatCurrency(paid.reduce((sum, item) => sum + item.amount, 0)) },
        ]}
      />

      <SecurePaymentBanner mode={settings?.paymentMode} />

      <div className="grid gap-4 md:grid-cols-4">
        <DashboardMetricCard label="Tổng giao dịch" value={payments.length} icon={ReceiptText} tone="blue" />
        <DashboardMetricCard label="Đã thanh toán" value={paid.length} icon={CheckCircle2} tone="emerald" />
        <DashboardMetricCard label="Webhook rủi ro" value={riskWebhooks.length} icon={ShieldAlert} tone={riskWebhooks.length ? "rose" : "emerald"} />
        <DashboardMetricCard label="Doanh thu" value={formatCurrency(paid.reduce((sum, item) => sum + item.amount, 0))} icon={CreditCard} tone="slate" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {(["payments", "transactions", "webhooks", "refunds"] as FinanceTab[]).map((item) => (
            <Button key={item} size="sm" variant={tab === item ? "default" : "outline"} onClick={() => setTab(item)}>
              {item === "payments" ? "Payments" : item === "transactions" ? "Transactions" : item === "webhooks" ? "Webhook events" : "Refunds"}
            </Button>
          ))}
        </div>
        {tab === "payments" && (
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
            value={gatewayFilter}
            onChange={(event) => setGatewayFilter(event.target.value)}
          >
            {gatewayOptions.map((gateway) => (
              <option key={gateway} value={gateway}>{gateway === "all" ? "Tất cả gateway" : gateway}</option>
            ))}
          </select>
        )}
      </div>

      {tab === "payments" && (
        visiblePayments.length ? (
          <div className="space-y-3">
            {visiblePayments.map((payment) => (
              <EntityCard
                key={payment.id}
                title={formatCurrency(payment.amount)}
                subtitle={`${payment.description || payment.id}${payment.gateway ? ` · ${payment.gateway}` : ""}`}
                meta={formatDate(payment.createdAt)}
                icon={CreditCard}
                tone={payment.status === "failed" || payment.status === "expired" ? "rose" : payment.status === "pending" || payment.status === "processing" ? "amber" : payment.status === "refunded" ? "slate" : "emerald"}
                badge={<PaymentStatusBadge status={payment.status} />}
                actions={(
                  <>
                    <Button size="sm" disabled={busyId === payment.id} onClick={() => update(payment.id, "paid")}>Đối soát paid</Button>
                    <Button size="sm" variant="outline" disabled={busyId === payment.id} onClick={() => update(payment.id, "failed")}>Báo lỗi</Button>
                    <Button size="sm" variant="outline" disabled={busyId === payment.id} onClick={() => update(payment.id, "refunded")}>Hoàn tiền</Button>
                  </>
                )}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="Chưa có giao dịch" description="Thanh toán sẽ xuất hiện khi hệ thống tạo lớp hoặc buổi học có học phí." />
        )
      )}

      {tab === "transactions" && (
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle>Gateway transactions</CardTitle>
            <CardDescription>Mỗi checkout hoặc webhook thành công đều có transaction để đối soát.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.length ? transactions.map((tx) => (
              <div key={tx.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">{tx.gateway} · {tx.gatewayOrderId || "Không có order id"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{tx.gatewayTransactionId || "Chưa có mã giao dịch gateway"}</p>
                  </div>
                  <PaymentStatusBadge status={tx.status === "success" ? "paid" : tx.status} />
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                  <span>{formatCurrency(tx.amount)}</span>
                  <span>{tx.currency}</span>
                  <span>{formatDate(tx.createdAt)}</span>
                </div>
              </div>
            )) : <EmptyState title="Chưa có transaction" description="Transaction được tạo khi user tạo checkout hoặc gateway gửi webhook." />}
          </CardContent>
        </Card>
      )}

      {tab === "webhooks" && (
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle>Webhook event viewer</CardTitle>
            <CardDescription>Theo dõi chữ ký, idempotency và lỗi xử lý từ gateway.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {webhooks.length ? webhooks.map((event) => (
              <div key={event.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">{event.gateway} · {event.eventId || "Không có event id"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{event.gatewayOrderId || event.gatewayTransactionId || "Không có mã gateway"}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${event.signatureValid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {event.signatureValid ? "Signature valid" : "Signature invalid"}
                    </span>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${event.processed ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"}`}>
                      {event.processed ? "Processed" : "Pending"}
                    </span>
                  </div>
                </div>
                <TransactionTimeline
                  items={[
                    { label: "Received", value: formatDate(event.receivedAt), tone: "info" },
                    { label: event.signatureValid ? "Signature verified" : "Signature failed", value: event.processingError, tone: event.signatureValid ? "success" : "danger" },
                    { label: event.processed ? "Processed idempotently" : "Waiting for processing", value: event.processedAt ? formatDate(event.processedAt) : undefined, tone: event.processed ? "success" : "warning" },
                  ]}
                />
              </div>
            )) : <EmptyState title="Chưa có webhook" description="Gateway webhook sẽ được lưu raw payload tại đây để debug an toàn." />}
          </CardContent>
        </Card>
      )}

      {tab === "refunds" && (
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle>Refund management</CardTitle>
            <CardDescription>Theo dõi hoàn tiền toàn phần/một phần và mã refund từ gateway.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {refunds.length ? refunds.map((refund) => (
              <div key={refund.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                <div>
                  <p className="font-bold text-slate-950">{formatCurrency(refund.amount)}</p>
                  <p className="text-sm text-muted-foreground">{refund.reason || refund.gatewayRefundId || refund.paymentId}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <History className="h-4 w-4" />
                  {formatDate(refund.createdAt)}
                </div>
              </div>
            )) : <EmptyState title="Chưa có refund" description="Các yêu cầu hoàn tiền sẽ xuất hiện sau khi admin xử lý giao dịch." />}
          </CardContent>
        </Card>
      )}

      {riskWebhooks.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <div className="flex gap-2 font-semibold"><AlertTriangle className="h-5 w-5" />Có webhook cần kiểm tra</div>
          <p className="mt-1 text-sm">Một số event có chữ ký không hợp lệ hoặc lỗi xử lý. Hãy mở tab Webhook events để xem chi tiết trước khi đối soát thủ công.</p>
        </div>
      )}
    </div>
  )
}
