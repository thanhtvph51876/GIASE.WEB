"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Clock3, Wallet, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { DashboardMetricCard, EmptyState, EntityCard, PageHero } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { payoutService } from "@/lib/services"
import { formatCurrency, formatDate } from "@/lib/helpers"
import type { Payout } from "@/types"

export default function AdminPayoutsPage() {
  const { user } = useAuthContext()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const load = async () => setPayouts(await payoutService.getAllPayouts())
  useEffect(() => { load() }, [])

  const update = async (id: string, status: "paid" | "rejected") => {
    const result = status === "paid" ? await payoutService.approvePayout(id, user) : await payoutService.rejectPayout(id, "Admin từ chối yêu cầu rút tiền", user)
    if (result.success) {
      toast.success("Đã cập nhật payout")
      load()
    } else toast.error(result.error || "Không thể cập nhật payout")
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
          {payouts.map((payout) => (
            <EntityCard
              key={payout.id}
              title={`${payout.tutorName} · ${formatCurrency(payout.amount)}`}
              subtitle={`${payout.bankName || "Ngân hàng"} · ${payout.bankAccount || "Chưa có STK"}`}
              meta={formatDate(payout.requestedAt)}
              icon={payout.status === "rejected" ? XCircle : Wallet}
              tone={payout.status === "rejected" ? "rose" : payout.status === "pending" ? "amber" : payout.status === "paid" || payout.status === "completed" ? "emerald" : "blue"}
              badge={<StatusBadge kind="payout" status={payout.status} />}
              actions={payout.status === "pending" && (
                <>
                  <Button size="sm" onClick={() => update(payout.id, "paid")}>Duyệt</Button>
                  <Button size="sm" variant="outline" onClick={() => update(payout.id, "rejected")}>Từ chối</Button>
                </>
              )}
            >
              {payout.reason && <p className="text-sm text-red-600">{payout.reason}</p>}
            </EntityCard>
          ))}
        </div>
      ) : (
        <EmptyState title="Chưa có payout request" description="Yêu cầu rút tiền sẽ xuất hiện khi gia sư tạo từ màn thu nhập." />
      )}
    </div>
  )
}
