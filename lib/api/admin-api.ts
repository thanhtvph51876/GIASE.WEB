import type { AdminStats, AdminTutorCrm, AdminUserCrm, User } from "@/types"
import { apiPageRequest, apiRequest, type PageRequestParams } from "./client"
import { mapList, mapUser } from "./mappers"

type CountRow = Record<string, string | number> & { count: number }
type RevenueRow = Record<string, string | number> & { revenue?: number; amount?: number }

export const adminApi = {
  overview() {
    return apiRequest<AdminStats>("/admin/reports/overview")
  },
  async reports() {
    const [
      requestsByMonth,
      subjectDistribution,
      tutorStatusDistribution,
      conversionFunnel,
      teachingModeRatio,
      revenue,
      paymentStatusDistribution,
      lowRatingAlerts,
    ] = await Promise.allSettled([
      apiRequest<CountRow[]>("/admin/reports/request-trends"),
      apiRequest<CountRow[]>("/admin/reports/subject-distribution"),
      apiRequest<CountRow[]>("/admin/reports/tutor-status-distribution"),
      apiRequest<CountRow[]>("/admin/reports/conversion-funnel"),
      apiRequest<CountRow[]>("/admin/reports/teaching-mode-distribution"),
      apiRequest<RevenueRow[]>("/admin/reports/revenue"),
      apiRequest<CountRow[]>("/admin/reports/payment-status-distribution"),
      apiRequest<CountRow[]>("/admin/reports/low-rating-alerts"),
    ])

    return {
      requestsByMonth: settledRows(requestsByMonth),
      subjectDistribution: settledRows(subjectDistribution),
      tutorStatusDistribution: settledRows(tutorStatusDistribution),
      conversionFunnel: settledRows(conversionFunnel),
      teachingModeRatio: settledRows(teachingModeRatio),
      revenue: settledRows(revenue),
      paymentStatusDistribution: settledRows(paymentStatusDistribution),
      lowRatingAlerts: settledRows(lowRatingAlerts),
    }
  },
  async users(params?: PageRequestParams) {
    return (await this.usersPage(params)).items
  },
  usersPage(params?: PageRequestParams) {
    return apiPageRequest<User>("/admin/users", { params }, mapUser)
  },
  user(id: string) {
    return apiRequest<User>(`/admin/users/${id}`).then(mapUser)
  },
  userCrm(id: string) {
    return apiRequest<AdminUserCrm>(`/admin/users/${id}/crm`)
  },
  addUserNote(id: string, content: string) {
    return apiRequest(`/admin/users/${id}/notes`, { method: "POST", body: { content } })
  },
  addUserRiskFlag(id: string, body: { level: string; reason: string; note?: string }) {
    return apiRequest(`/admin/users/${id}/risk-flags`, { method: "POST", body })
  },
  resolveUserRiskFlag(userId: string, flagId: string) {
    return apiRequest(`/admin/users/${userId}/risk-flags/${flagId}`, { method: "DELETE" })
  },
  tutorCrm(id: string) {
    return apiRequest<AdminTutorCrm>(`/admin/tutors/${id}/crm`)
  },
  addTutorNote(id: string, content: string) {
    return apiRequest(`/admin/tutors/${id}/notes`, { method: "POST", body: { content } })
  },
  addTutorRiskFlag(id: string, body: { level: string; reason: string; note?: string }) {
    return apiRequest(`/admin/tutors/${id}/risk-flags`, { method: "POST", body })
  },
  resolveTutorRiskFlag(tutorId: string, flagId: string) {
    return apiRequest(`/admin/tutors/${tutorId}/risk-flags/${flagId}`, { method: "DELETE" })
  },
  updateUserStatus(id: string, status: User["status"], reason?: string) {
    return apiRequest<User>(`/admin/users/${id}/status`, { method: "PATCH", body: { status, reason } }).then(mapUser)
  },
  auditLogs(params?: PageRequestParams) {
    return apiRequest("/admin/audit-logs", { params })
  },
  auditLogsPage(params?: PageRequestParams) {
    return apiPageRequest("/admin/audit-logs", { params })
  },
}

function settledRows<T extends Record<string, string | number | undefined>>(result: PromiseSettledResult<T[]>) {
  if (result.status === "fulfilled") return result.value || []
  if (process.env.NODE_ENV !== "production") {
    console.warn("Admin report widget failed", result.reason)
  }
  return []
}
