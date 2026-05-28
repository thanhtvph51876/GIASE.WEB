import { apiRequest } from "@/lib/api/client"

class TutorPerformanceService {
  getPerformance() {
    return apiRequest<Record<string, number>>("/tutor/performance")
  }
}

export const tutorPerformanceService = new TutorPerformanceService()
