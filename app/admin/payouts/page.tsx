"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Clock3, Wallet, XCircle } from "lucide-react"
import { toast } from "sonner"
import { AdminActionButton } from "@/components/admin/admin-action-button"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
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
  const [busyId, setBusyId] = useState<string | null>(null)
  const load = async () => setPayouts(await payoutService.getAllPayouts())
  useEffect(() => { load() }, [])

  const update = async (id: string, status: "paid" | "rejected", reason: string) => {
    setBusyId(id)
    try {
      const result =
        status === "paid"
          ? await payoutService.approvePayout(id, user, reason)
          : await payoutService.rejectPayout(id, reason, user)
      if (result.success) {
        toast.success("Đã cập nhật payout")
        load()
      } else toast.error(result.error || "Không thể cập nhật payout")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Payout ops"
        title="Payout gia sư"
        description="Duyệt, từ chối và theo dõi yêu cầu rút tiền của gia sư với audit log đi kèm."
        icon={Wallet}
        stats={[
          { label: "Tổng payout", value: payouts.length },
          { label: "Chờ duyệt", value: payouts.filter((item) => item.status === "pending").length },
          { label: "Đã chi trả", value: payouts.filter((item) => item.status === "paid" || item.status === "completed").length },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Tổng payout" value={payouts.length} icon={Wallet} tone="blue" />
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
    </div>
  )
}
