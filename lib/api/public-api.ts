import { apiRequest } from "./client"

export interface SiteStats {
  totalTutors: number
  totalStudents: number
  completedSessions: number
  satisfactionRate: number
  verifiedTutors: number
  averageRating: number
}

export const publicApi = {
  stats() {
    return apiRequest<SiteStats>("/public/stats", { auth: false })
  },
}
