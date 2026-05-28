import { apiRequest } from "@/lib/api/client"

type OperationRow = Record<string, unknown>
type OperationOverview = Record<string, number>

function numberAlias(source: OperationRow, ...keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === "number") return value
    if (typeof value === "string" && value.trim() !== "") return Number(value)
  }
  return 0
}

function normalizeOverview(source: OperationRow): OperationOverview {
  return {
    ...source,
    newRequests: numberAlias(source, "newRequests"),
    unmatchedRequests: numberAlias(source, "unmatchedRequests"),
    overdueRequests: numberAlias(source, "overdueRequests"),
    upcomingTrialBookings: numberAlias(source, "upcomingTrialBookings", "trialUpcoming"),
    noShowBookings: numberAlias(source, "noShowBookings", "noShow"),
    pendingPayments: numberAlias(source, "pendingPayments", "paymentPending"),
    pendingPayouts: numberAlias(source, "pendingPayouts", "payoutPending"),
    pendingVerifications: numberAlias(source, "pendingVerifications", "verificationPending"),
    pendingDisputes: numberAlias(source, "pendingDisputes", "disputePending"),
  } as OperationOverview
}

class AdminOperationService {
  async overview() {
    return normalizeOverview(await apiRequest<OperationRow>("/admin/operations/overview"))
  }

  matchingQueue() {
    return apiRequest<OperationRow[]>("/admin/operations/matching-queue")
  }

  bookingRisk() {
    return apiRequest<OperationRow[]>("/admin/operations/booking-risk")
  }

  verificationRisk() {
    return apiRequest<OperationRow[]>("/admin/operations/verification-risk")
  }

  paymentReconciliation() {
    return apiRequest<OperationRow[]>("/admin/operations/payment-reconciliation")
  }

  payoutQueue() {
    return apiRequest<OperationRow[]>("/admin/operations/payout-queue")
  }

  tutorQuality() {
    return apiRequest<OperationRow[]>("/admin/operations/tutor-quality")
  }

  disputes() {
    return apiRequest<OperationRow[]>("/admin/disputes")
  }
}

export const adminOperationService = new AdminOperationService()
