import type { Subject } from "@/types"
import { apiRequest } from "./client"

export interface SiteStats {
  totalTutors: number
  totalStudents: number
  completedSessions: number
  satisfactionRate: number
  verifiedTutors: number
  averageRating: number
}

export const emptySiteStats: SiteStats = {
  totalTutors: 0,
  totalStudents: 0,
  completedSessions: 0,
  satisfactionRate: 0,
  verifiedTutors: 0,
  averageRating: 0,
}

export const publicApi = {
  stats() {
    return apiRequest<SiteStats>("/public/stats", { auth: false })
  },
  subjects() {
    return apiRequest<Subject[]>("/catalog/subjects", { auth: false })
  },
}
