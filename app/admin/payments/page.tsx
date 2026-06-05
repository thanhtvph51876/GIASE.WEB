"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, CreditCard, History, ReceiptText, RefreshCw, ShieldAlert, WalletCards } from "lucide-react"
import { toast } from "sonner"
import { AdminActionButton } from "@/components/admin/admin-action-button"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { AdminPagination, ADMIN_PAGE_SIZE, defaultPagination } from "@/components/admin/admin-pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DashboardMetricCard, EmptyState, EntityCard, LoadingSkeleton, PageHero, PaymentStatusBadge } from "@/components/platform/operational-components"
import { SecurePaymentBanner, TransactionTimeline } from "@/components/payment/payment-trust-ui"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value"
import { paymentService } from "@/lib/services"
import { formatCurrency, formatDate } from "@/lib/helpers"
import type { Payment } from "@/types"
import type { PaymentRefund, PaymentSettings, PaymentTransaction, PaymentWebhookEvent } from "@/lib/api/payment-api"
import { getAdminActionAvailability } from "@/lib/admin/admin-actions"

type FinanceTab = "payments" | "transactions" | "webhooks" | "refunds"

const statusOptionsByTab: Record<FinanceTab, string[]> = {
  payments: ["all", "pending", "processing", "paid", "completed", "failed", "expired", "refunded", "partially_refunded", "cancelled"],
  transactions: ["all", "created", "pending", "success", "failed", "cancelled", "expired", "refunded"],
  webhooks: ["all", "processed", "pending", "failed"],
  refunds: ["all", "pending", "processing", "succeeded", "failed", "cancelled"],
}

export default function AdminPaymentsPage() {
  const { user } = useAuthContext()
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentPage, setPaymentPage] = useState(1)
  const [paymentPagination, setPaymentPagination] = useState(defaultPagination())
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [transactionPage, setTransactionPage] = useState(1)
  const [transactionPagination, setTransactionPagination] = useState(defaultPagination())
  const [webhooks, setWebhooks] = useState<PaymentWebhookEvent[]>([])
  const [webhookPage, setWebhookPage] = useState(1)
  const [webhookPagination, setWebhookPagination] = useState(defaultPagination())
  const [refunds, setRefunds] = useState<PaymentRefund[]>([])
  const [refundPage, setRefundPage] = useState(1)
  const [refundPagination, setRefundPagination] = useState(defaultPagination())
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [tab, setTab] = useState<FinanceTab>("payments")
  const [gatewayFilter, setGatewayFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search, 300)

  const load = async () => {
    setLoading(true)
    try {
      const gateway = gatewayFilter === "all" ? undefined : gatewayFilter
      const activeStatus = (target: FinanceTab) => (tab === target && statusFilter !== "all" ? statusFilter : undefined)
      const activeSearch = (target: FinanceTab) => (tab === target ? debouncedSearch : undefined)
      const [paymentRows, txRows, webhookRows, refundRows, paymentSettings] = await Promise.all([
        paymentService.getAllPaymentsPage({ page: paymentPage, pageSize: ADMIN_PAGE_SIZE, gateway, status: activeStatus("payments"), search: activeSearch("payments") }),
        paymentService.getPaymentTransactionsPage({ page: transactionPage, pageSize: ADMIN_PAGE_SIZE, gateway, status: activeStatus("transactions"), search: activeSearch("transactions") }),
        paymentService.getWebhookEventsPage({ page: webhookPage, pageSize: ADMIN_PAGE_SIZE, gateway, status: activeStatus("webhooks"), search: activeSearch("webhooks") }),
        paymentService.getRefundsPage({ page: refundPage, pageSize: ADMIN_PAGE_SIZE, status: activeStatus("refunds"), search: activeSearch("refunds") }),
        paymentService.getSettings(),
      ])
      setPayments(paymentRows.items)
      setPaymentPagination(paymentRows.pagination)
      setTransactions(txRows.items)
      setTransactionPagination(txRows.pagination)
      setWebhooks(webhookRows.items)
      setWebhookPagination(webhookRows.pagination)
      setRefunds(refundRows.items)
      setRefundPagination(refundRows.pagination)
      setSettings(paymentSettings)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được dữ liệu payment ops")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPaymentPage(1)
    setTransactionPage(1)
    setWebhookPage(1)
    setRefundPage(1)
  }, [gatewayFilter, statusFilter, debouncedSearch])

  useEffect(() => { load() }, [paymentPage, transactionPage, webhookPage, refundPage, gatewayFilter, statusFilter, debouncedSearch, tab])

  const update = async (id: string, action: "paid" | "failed" | "refunded", reason?: string) => {
    setBusyId(id)
    try {
      const result =
        action === "paid"
          ? await paymentService.markAsPaid(id, user, reason)
          : action === "failed"
            ? await paymentService.markAsFailed(id, user, reason)
            : await paymentService.refundPayment(id, user, reason)
      if (result.success) {
        toast.success("Đã cập nhật thanh toán")
        load()
      } else toast.error(result.error || "Không thể cập nhật")
    } finally {
      setBusyId(null)
    }
  }

  const gatewayOptions = useMemo(() => {
    const values = Array.from(new Set([
      ...(settings?.enabledGateways || []),
      ...payments.map((item) => item.gateway).filter(Boolean),
      ...transactions.map((item) => item.gateway).filter(Boolean),
      ...webhooks.map((item) => item.gateway).filter(Boolean),
    ])) as string[]
    return ["all", ...values]
  }, [payments, settings?.enabledGateways, transactions, webhooks])

  const currentPagination =
    tab === "payments" ? paymentPagination : tab === "transactions" ? transactionPagination : tab === "webhooks" ? webhookPagination : refundPagination
  const setCurrentPage =
    tab === "payments" ? setPaymentPage : tab === "transactions" ? setTransactionPage : tab === "webhooks" ? setWebhookPage : setRefundPage
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
          { label: "Tổng giao dịch", value: paymentPagination.total },
          { label: "Đã thanh toán", value: paid.length },
          { label: "Webhook cần xem", value: riskWebhooks.length },
          { label: "Doanh thu", value: formatCurrency(paid.reduce((sum, item) => sum + item.amount, 0)) },
        ]}
      />

      <SecurePaymentBanner mode={settings?.paymentMode} />

      <div className="grid gap-4 md:grid-cols-4">
        <DashboardMetricCard label="Tổng giao dịch" value={paymentPagination.total} icon={ReceiptText} tone="blue" />
        <DashboardMetricCard label="Đã thanh toán" value={paid.length} icon={CheckCircle2} tone="emerald" />
        <DashboardMetricCard label="Webhook rủi ro" value={riskWebhooks.length} icon={ShieldAlert} tone={riskWebhooks.length ? "rose" : "emerald"} />
        <DashboardMetricCard label="Doanh thu" value={formatCurrency(paid.reduce((sum, item) => sum + item.amount, 0))} icon={CreditCard} tone="slate" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {(["payments", "transactions", "webhooks", "refunds"] as FinanceTab[]).map((item) => (
            <Button key={item} size="sm" variant={tab === item ? "default" : "outline"} onClick={() => {
              setTab(item)
              setStatusFilter("all")
            }}>
              {item === "payments" ? "Payments" : item === "transactions" ? "Transactions" : item === "webhooks" ? "Webhook events" : "Refunds"}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {statusOptionsByTab[tab].map((status) => (
              <option key={status} value={status}>{status === "all" ? "Tất cả trạng thái" : status}</option>
            ))}
          </select>
          {tab !== "refunds" && (
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
          <Input
            className="h-9 w-64 max-w-full"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm payment/order/refund..."
          />
        </div>
      </div>

      {tab === "payments" && (
        payments.length ? (
          <div className="space-y-3">
            {payments.map((payment) => (
              (() => {
                const markPaidAvailability = getAdminActionAvailability(user, "payment", "payment.markPaid", payment.status, payment)
                const markFailedAvailability = getAdminActionAvailability(user, "payment", "payment.markFailed", payment.status, payment)
                const refundAvailability = getAdminActionAvailability(user, "payment", "payment.refund", payment.status, payment)
                return (
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
                    <ConfirmReasonDialog
                      trigger={<AdminActionButton size="sm" disabled={busyId === payment.id} availability={markPaidAvailability}>Đối soát paid</AdminActionButton>}
                      title="Ghi nhận thanh toán thủ công"
                      description="Chỉ thực hiện sau khi đã đối soát order, amount và currency với gateway hoặc sao kê."
                      actionName="Ghi nhận paid"
                      severity="warning"
                      reasonOptions={[
                        { value: "BANK_RECONCILED", label: "Đã đối soát sao kê ngân hàng" },
                        { value: "GATEWAY_CONFIRMED", label: "Gateway xác nhận ngoài webhook" },
                        { value: "OTHER", label: "Lý do khác" },
                      ]}
                      onConfirm={(reason, note) => update(payment.id, "paid", note || reason)}
                    />
                    <ConfirmReasonDialog
                      trigger={<AdminActionButton size="sm" variant="outline" disabled={busyId === payment.id} availability={markFailedAvailability}>Báo lỗi</AdminActionButton>}
                      title="Ghi nhận thanh toán thất bại"
                      description="Người dùng sẽ thấy trạng thái thất bại và có thể tạo phiên thanh toán mới."
                      actionName="Báo lỗi"
                      severity="warning"
                      reasonOptions={[
                        { value: "GATEWAY_FAILED", label: "Gateway báo thất bại" },
                        { value: "EXPIRED_RECONCILIATION", label: "Quá hạn đối soát" },
                        { value: "OTHER", label: "Lý do khác" },
                      ]}
                      onConfirm={(reason, note) => update(payment.id, "failed", note || reason)}
                    />
                    <ConfirmReasonDialog
                      trigger={<AdminActionButton size="sm" variant="outline" disabled={busyId === payment.id} availability={refundAvailability}>Hoàn tiền</AdminActionButton>}
                      title="Hoàn tiền giao dịch"
                      description={`Mặc định hoàn toàn bộ ${formatCurrency(payment.amount)}. Backend sẽ chặn nếu vượt refundable amount.`}
                      actionName="Hoàn tiền"
                      severity="danger"
                      requireTypedConfirmation="HOAN TIEN"
                      reasonOptions={[
                        { value: "CLASS_CANCELLED", label: "Lớp/buổi học bị hủy" },
                        { value: "CUSTOMER_REQUEST", label: "Khách hàng yêu cầu hoàn tiền" },
                        { value: "OTHER", label: "Lý do khác" },
                      ]}
                      onConfirm={(reason, note) => update(payment.id, "refunded", note || reason)}
                    />
                  </>
                )}
              />
                )
              })()
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

      <AdminPagination pagination={currentPagination} loading={loading} onPageChange={setCurrentPage} />
    </div>
  )
}
