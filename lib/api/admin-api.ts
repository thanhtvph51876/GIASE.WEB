import type { AdminStats, User } from "@/types"
import { apiRequest } from "./client"
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
  users() {
    return apiRequest<User[]>("/admin/users").then((users) => mapList(users, mapUser))
  },
  user(id: string) {
    return apiRequest<User>(`/admin/users/${id}`).then(mapUser)
  },
  updateUserStatus(id: string, status: User["status"], reason?: string) {
    return apiRequest<User>(`/admin/users/${id}/status`, { method: "PATCH", body: { status, reason } }).then(mapUser)
  },
  auditLogs() {
    return apiRequest("/admin/audit-logs")
  },
}

function settledRows<T extends Record<string, string | number | undefined>>(result: PromiseSettledResult<T[]>) {
  if (result.status === "fulfilled") return result.value || []
  if (process.env.NODE_ENV !== "production") {
    console.warn("Admin report widget failed", result.reason)
  }
  return []
}
