import type { LearningRequest, Tutor } from "@/types"
import { tutorService } from "./tutor-service"

export interface TutorMatchResult {
  tutor: Tutor
  score: number
  reasons: string[]
}

class MatchingService {
  calculateMatchingScore(request: LearningRequest, tutor: Tutor): TutorMatchResult {
    const reasons: string[] = []
    let score = 0

    if (tutor.subjects.includes(request.subject)) {
      score += 30
      reasons.push("Trùng môn học")
    }

    if (tutor.grades.includes(request.grade)) {
      score += 20
      reasons.push("Trùng cấp lớp")
    }

    const locationMatch =
      request.teachingMode === "online" ||
      tutor.teachingModes === "online" ||
      tutor.teachingModes === "both" ||
      Boolean(request.location && tutor.locations.includes(request.location))
    if (locationMatch) {
      score += 15
      reasons.push(request.teachingMode === "online" ? "Phù hợp học online" : "Gần khu vực")
    }

    if (!request.expectedFee || tutor.pricePerHour <= request.expectedFee) {
      score += 10
      reasons.push("Trong khoảng học phí")
    }

    if (request.preferredSchedule && tutor.availableSlots.length > 0) {
      score += 10
      reasons.push("Có lịch rảnh phù hợp")
    }

    const ratingScore = Math.min(10, Math.round((tutor.rating / 5) * 10))
    score += ratingScore
    if (ratingScore >= 8) reasons.push("Rating cao")

    const responseScore = Math.min(5, Math.round((tutor.responseRate / 100) * 5))
    score += responseScore
    if (responseScore >= 4) reasons.push("Phản hồi nhanh")

    return { tutor, score: Math.min(100, score), reasons }
  }

  async getSuggestedTutors(request: LearningRequest, limit = 8): Promise<TutorMatchResult[]> {
    const tutors = await tutorService.getAllTutors()
    return tutors
      .filter((tutor) => tutor.approvalStatus === "approved" && tutor.verified)
      .map((tutor) => this.calculateMatchingScore(request, tutor))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }
}

export const matchingService = new MatchingService()
