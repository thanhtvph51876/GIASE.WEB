import type { Review, User } from "@/types"
import { reviewApi } from "@/lib/api/review-api"

interface CreateReviewData {
  tutorId: string
  studentId?: string
  studentName: string
  avatar?: string
  sessionId?: string
  classId?: string
  rating: number
  content: string
  actor?: User | null
}

class ReviewService {
  async createReview(data: CreateReviewData) {
    try {
      const review = await reviewApi.create(data)
      return { success: true, review }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể tạo đánh giá" }
    }
  }

  async hasReviewForSession(sessionId: string): Promise<boolean> {
    const reviews = await this.getAllReviews()
    return reviews.some((review) => review.sessionId === sessionId)
  }

  async getReviewsByTutor(tutorId: string): Promise<Review[]> {
    return reviewApi.byTutor(tutorId)
  }

  async getReviewsByStudent(studentId: string): Promise<Review[]> {
    const reviews = await reviewApi.list()
    return reviews.filter((review) => review.studentId === studentId)
  }

  async getAverageRating(tutorId: string): Promise<{ average: number; count: number }> {
    const reviews = await this.getReviewsByTutor(tutorId)
    if (!reviews.length) return { average: 0, count: 0 }
    return {
      average: Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10,
      count: reviews.length,
    }
  }

  async getAllReviews(): Promise<Review[]> {
    return reviewApi.adminList()
  }

  async getRecentReviews(limit: number = 5): Promise<Review[]> {
    return (await this.getAllReviews()).slice(0, limit)
  }

  async deleteReview(id: string) {
    try {
      await reviewApi.status(id, "hide")
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể ẩn đánh giá" }
    }
  }

  async showReview(id: string) {
    try {
      const review = await reviewApi.status(id, "show")
      return { success: true, review }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể hiện đánh giá" }
    }
  }

  async flagReview(id: string) {
    try {
      const review = await reviewApi.status(id, "flag")
      return { success: true, review }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể gắn cờ đánh giá" }
    }
  }
}

export const reviewService = new ReviewService()
