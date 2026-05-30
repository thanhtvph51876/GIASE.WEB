import type { AdminStats, User } from "@/types"
import { apiRequest } from "./client"
import { mapList, mapUser } from "./mappers"

type CountRow = Record<string, string | number> & { count: number }

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
    ] = await Promise.allSettled([
      apiRequest<CountRow[]>("/admin/reports/request-trends"),
      apiRequest<CountRow[]>("/admin/reports/subject-distribution"),
      apiRequest<CountRow[]>("/admin/reports/tutor-status-distribution"),
      apiRequest<CountRow[]>("/admin/reports/conversion-funnel"),
      apiRequest<CountRow[]>("/admin/reports/teaching-mode-distribution"),
    ])

    return {
      requestsByMonth: settledRows(requestsByMonth),
      subjectDistribution: settledRows(subjectDistribution),
      tutorStatusDistribution: settledRows(tutorStatusDistribution),
      conversionFunnel: settledRows(conversionFunnel),
      teachingModeRatio: settledRows(teachingModeRatio),
    }
  },
  users() {
    return apiRequest<User[]>("/admin/users").then((users) => mapList(users, mapUser))
  },
  auditLogs() {
    return apiRequest("/admin/audit-logs")
  },
}

function settledRows(result: PromiseSettledResult<CountRow[]>) {
  if (result.status === "fulfilled") return result.value || []
  if (process.env.NODE_ENV !== "production") {
    console.warn("Admin report widget failed", result.reason)
  }
  return []
}
