import type { Payout, TutorEarning } from "@/types"
import { apiRequest } from "./client"
import { mapList, mapPayout, mapTutorEarning } from "./mappers"

export interface TutorEarningSummary {
  earnings: TutorEarning[]
  payouts: Payout[]
  availableBalance: number
  pendingBalance: number
  paidBalance: number
  totalEarnings: number
}

function sumByStatus(earnings: TutorEarning[], statuses: TutorEarning["status"][]) {
  return earnings
    .filter((earning) => statuses.includes(earning.status))
    .reduce((sum, earning) => sum + earning.netAmount, 0)
}

export const earningApi = {
  async earnings() {
    return mapList(await apiRequest<TutorEarning[]>("/tutor/earnings"), mapTutorEarning)
  },
  async payouts() {
    return mapList(await apiRequest<Payout[]>("/tutor/payouts"), mapPayout)
  },
  async requestPayout(data: { amount: number; bankName?: string; bankAccount?: string; accountHolder?: string }) {
    return mapPayout(await apiRequest<Payout>("/tutor/payouts", { method: "POST", body: data }))
  },
  async summary(): Promise<TutorEarningSummary> {
    const [earnings, payouts] = await Promise.all([this.earnings(), this.payouts()])
    return {
      earnings,
      payouts,
      availableBalance: sumByStatus(earnings, ["available"]),
      pendingBalance: sumByStatus(earnings, ["pending", "payout_pending"]),
      paidBalance: sumByStatus(earnings, ["paid"]),
      totalEarnings: earnings
        .filter((earning) => earning.status !== "cancelled")
        .reduce((sum, earning) => sum + earning.netAmount, 0),
    }
  },
}
