import type { AdminStats, User } from "@/types"
import { apiRequest } from "./client"
import { mapList, mapUser } from "./mappers"

type CountRow = Record<string, string | number> & { count: number }

export const adminApi = {
  overview() {
    return apiRequest<AdminStats>("/admin/reports/overview")
  },
  reports() {
    return Promise.all([
      apiRequest<CountRow[]>("/admin/reports/request-trends"),
      apiRequest<CountRow[]>("/admin/reports/subject-distribution"),
      apiRequest<CountRow[]>("/admin/reports/tutor-status-distribution"),
      apiRequest<CountRow[]>("/admin/reports/conversion-funnel"),
      apiRequest<CountRow[]>("/admin/reports/teaching-mode-distribution"),
    ]).then(([requestsByMonth, subjectDistribution, tutorStatusDistribution, conversionFunnel, teachingModeRatio]) => ({
      requestsByMonth,
      subjectDistribution,
      tutorStatusDistribution,
      conversionFunnel,
      teachingModeRatio,
    }))
  },
  users() {
    return apiRequest<User[]>("/admin/users").then((users) => mapList(users, mapUser))
  },
  auditLogs() {
    return apiRequest("/admin/audit-logs")
  },
}
