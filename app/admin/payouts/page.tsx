"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Clock3, Wallet, XCircle } from "lucide-react"
import { toast } from "sonner"
import { AdminActionButton } from "@/components/admin/admin-action-button"
import { AdminPagination, defaultPagination, ADMIN_PAGE_SIZE } from "@/components/admin/admin-pagination"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { DashboardMetricCard, EmptyState, EntityCard, PageHero } from "@/components/platform/operational-components"
import { getAdminActionAvailability } from "@/lib/admin/admin-actions"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { payoutService } from "@/lib/services"
import { formatCurrency, formatDate } from "@/lib/helpers"
import type { Payout } from "@/types"

export default function AdminPayoutsPage() {
  const { user } = useAuthContext()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(defaultPagination())
  const [loading, setLoading] = useState(false)
  const [detailById, setDetailById] = useState<Record<string, Payout>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const load = async (targetPage = page) => {
    setLoading(true)
    try {
      const result = await payoutService.getAllPayoutsPage({ page: targetPage, pageSize: ADMIN_PAGE_SIZE })
      setPayouts(result.items)
      setPagination(result.pagination)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được payout")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load(page) }, [page])

  const update = async (id: string, status: "paid" | "rejected", reason: string) => {
    setBusyId(id)
    try {
      const result =
        status === "paid"
          ? await payoutService.approvePayout(id, user, reason)
          : await payoutService.rejectPayout(id, reason, user)
      if (result.success) {
        toast.success("Đã cập nhật payout")
        load(page)
      } else toast.error(result.error || "Không thể cập nhật payout")
    } finally {
      setBusyId(null)
    }
  }

  const loadDetail = async (id: string) => {
    if (detailById[id]) return
    const payout = await payoutService.getPayoutById(id)
    if (payout) setDetailById((current) => ({ ...current, [id]: payout }))
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Payout ops"
        title="Payout gia sư"
        description="Duyệt, từ chối và theo dõi yêu cầu rút tiền của gia sư với audit log đi kèm."
        icon={Wallet}
        stats={[
          { label: "Tổng payout", value: pagination.total },
          { label: "Chờ duyệt", value: payouts.filter((item) => item.status === "pending").length },
          { label: "Đã chi trả", value: payouts.filter((item) => item.status === "paid" || item.status === "completed").length },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Tổng payout" value={pagination.total} icon={Wallet} tone="blue" />
        <DashboardMetricCard label="Chờ duyệt" value={payouts.filter((item) => item.status === "pending").length} icon={Clock3} tone="amber" />
        <DashboardMetricCard label="Đã chi trả" value={payouts.filter((item) => item.status === "paid" || item.status === "completed").length} icon={CheckCircle2} tone="emerald" />
      </div>
      {payouts.length ? (
        <div className="space-y-3">
          {payouts.map((payout) => {
            const approveAvailability = getAdminActionAvailability(user, "payout", "payout.approve", payout.status, payout)
            const rejectAvailability = getAdminActionAvailability(user, "payout", "payout.reject", payout.status, payout)
            const needsTypedConfirmation = payout.amount >= 5_000_000
            return (
              <EntityCard
                key={payout.id}
                title={`${payout.tutorName} · ${formatCurrency(payout.amount)}`}
                subtitle={`${payout.bankName || "Ngân hàng"} · ${payout.bankAccount || "Chưa có STK"} · ${payout.accountHolder || "Chưa có chủ tài khoản"}`}
                meta={formatDate(payout.requestedAt)}
                icon={payout.status === "rejected" ? XCircle : Wallet}
                tone={payout.status === "rejected" ? "rose" : payout.status === "pending" ? "amber" : payout.status === "paid" || payout.status === "completed" ? "emerald" : "blue"}
                badge={<StatusBadge kind="payout" status={payout.status} />}
                actions={(
                  <>
                    <PayoutDetailDialog payout={detailById[payout.id] || payout} onOpen={() => loadDetail(payout.id)} />
                    <ConfirmReasonDialog
                      trigger={<AdminActionButton size="sm" disabled={busyId === payout.id} availability={approveAvailability}>Duyệt</AdminActionButton>}
                      title="Duyệt payout"
                      description="Hãy xác nhận thông tin ngân hàng, earning items đã lock và đối soát số tiền trước khi duyệt."
                      actionName="Duyệt payout"
                      severity={needsTypedConfirmation ? "danger" : "warning"}
                      requireTypedConfirmation={needsTypedConfirmation ? "DUYET" : undefined}
                      reasonOptions={[
                        { value: "BANK_VERIFIED", label: "Đã kiểm tra ngân hàng và số tiền" },
                        { value: "LEDGER_RECONCILED", label: "Đã đối soát ledger/earning items" },
                        { value: "OTHER", label: "Ghi chú khác" },
                      ]}
                      onConfirm={(reason, note) => update(payout.id, "paid", note || reason)}
                    />
                    <ConfirmReasonDialog
                      trigger={<AdminActionButton size="sm" variant="outline" disabled={busyId === payout.id} availability={rejectAvailability}>Từ chối</AdminActionButton>}
                      title="Từ chối payout"
                      description="Earning items liên quan sẽ được release theo policy backend."
                      actionName="Từ chối"
                      severity="danger"
                      reasonOptions={[
                        { value: "INVALID_BANK_INFO", label: "Thông tin ngân hàng không hợp lệ" },
                        { value: "RISK_REVIEW", label: "Cần kiểm tra rủi ro" },
                        { value: "OTHER", label: "Lý do khác" },
                      ]}
                      onConfirm={(reason, note) => update(payout.id, "rejected", note || reason)}
                    />
                  </>
                )}
              >
                {payout.reason && <p className="text-sm text-red-600">{payout.reason}</p>}
              </EntityCard>
            )
          })}
        </div>
      ) : (
        <EmptyState title="Chưa có payout request" description="Yêu cầu rút tiền sẽ xuất hiện khi gia sư tạo từ màn thu nhập." />
      )}
      <AdminPagination pagination={pagination} loading={loading} onPageChange={setPage} />
    </div>
  )
}

function PayoutDetailDialog({ payout, onOpen }: { payout: Payout; onOpen: () => void }) {
  return (
    <Dialog onOpenChange={(open) => { if (open) onOpen() }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Chi tiết</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{payout.tutorName} · {formatCurrency(payout.amount)}</DialogTitle>
          <DialogDescription>Kiểm tra người nhận, thông tin ngân hàng, trạng thái và lý do trước khi duyệt/từ chối.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Payout ID" value={payout.id} />
          <Info label="Tutor ID" value={payout.tutorId} />
          <Info label="Trạng thái" value={payout.status} />
          <Info label="Số tiền" value={formatCurrency(payout.amount)} />
          <Info label="Ngân hàng" value={payout.bankName || "Chưa có"} />
          <Info label="Số tài khoản" value={payout.bankAccount || "Chưa có"} />
          <Info label="Chủ tài khoản" value={payout.accountHolder || "Chưa có"} />
          <Info label="Ngày yêu cầu" value={formatDate(payout.requestedAt)} />
          <div className="rounded-lg border bg-slate-50 p-3 md:col-span-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Lý do / ghi chú</p>
            <p className="mt-1 text-sm leading-6 text-slate-900">{payout.reason || "Chưa có ghi chú"}</p>
          </div>
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
