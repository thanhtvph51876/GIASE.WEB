import { apiPageRequest, apiRequest, type PageRequestParams } from "@/lib/api/client"

type OperationRow = Record<string, unknown>
type OperationOverview = Record<string, number>
export type OperationWorkItem = OperationRow & {
  id?: string
  module?: string
  itemType?: string
  title?: string
  status?: string
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  slaDueAt?: string
  overdue?: boolean
  recommendedAction?: string
  detailHref?: string
  assignedAdmin?: string
  assignedAdminId?: string
  relatedType?: string
  relatedId?: string
}

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

  workItems() {
    return apiRequest<OperationWorkItem[]>("/admin/operations/work-items")
  }

  async disputes(params?: PageRequestParams) {
    return (await this.disputesPage(params)).items
  }

  disputesPage(params?: PageRequestParams) {
    return apiPageRequest<OperationRow>("/admin/disputes", { params })
  }

  dispute(id: string) {
    return apiRequest<OperationRow>(`/admin/disputes/${id}`)
  }

  updateDispute(id: string, data: {
    status?: "NEW" | "ASSIGNED" | "INVESTIGATING" | "WAITING_PARENT" | "WAITING_TUTOR" | "PROPOSED_RESOLUTION" | "RESOLVED" | "CLOSED" | "ESCALATED" | "REJECTED" | "OPEN" | "IN_REVIEW"
    resolution?: string
    resolutionType?: string
    resolutionNote?: string
    priority?: string
    riskLevel?: string
    reason?: string
    note?: string
  }) {
    return apiRequest<OperationRow>(`/admin/disputes/${id}`, { method: "PATCH", body: data })
  }

  assignDispute(id: string, data: { assignedAdminId?: string; reason?: string; note?: string }) {
    return apiRequest<OperationRow>(`/admin/disputes/${id}/assign`, { method: "POST", body: data })
  }

  addDisputeNote(id: string, data: { content: string }) {
    return apiRequest<OperationRow>(`/admin/disputes/${id}/notes`, { method: "POST", body: data })
  }

  addDisputeTimeline(id: string, data: { eventType?: string; note?: string; reason?: string }) {
    return apiRequest<OperationRow>(`/admin/disputes/${id}/timeline`, { method: "POST", body: data })
  }

  resolveDispute(id: string, data: { resolutionType: string; resolutionNote: string; reason?: string }) {
    return apiRequest<OperationRow>(`/admin/disputes/${id}/resolve`, { method: "POST", body: data })
  }

  closeDispute(id: string, data: { reason?: string; note?: string }) {
    return apiRequest<OperationRow>(`/admin/disputes/${id}/close`, { method: "POST", body: data })
  }

  escalateDispute(id: string, data: { reason?: string; note?: string }) {
    return apiRequest<OperationRow>(`/admin/disputes/${id}/escalate`, { method: "POST", body: data })
  }
}

export const adminOperationService = new AdminOperationService()
