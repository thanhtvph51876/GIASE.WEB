import { adminService } from "./admin-service"
import { earningApi } from "@/lib/api/earning-api"
import { bookingService } from "./booking-service"
import { classService } from "./class-service"
import { paymentService } from "./payment-service"
import { reviewService } from "./review-service"
import { scheduleService } from "./schedule-service"

class DashboardStatsService {
  getAdminStats() {
    return adminService.getDashboardStats()
  }

  async getStudentStats(userId: string) {
    const [classes, sessions, payments, bookings] = await Promise.all([
      classService.getClassesByStudent(userId),
      scheduleService.getSessionsByStudent(userId),
      paymentService.getPaymentsByStudent(userId),
      bookingService.getBookingsByUser(userId),
    ])
    return {
      activeClasses: classes.filter((item) => item.status === "active" || item.status === "trial").length,
      upcomingSessions: sessions.filter((item) => item.status === "upcoming" || item.status === "scheduled").length,
      pendingPayments: payments.filter((item) => item.status === "pending" || item.status === "failed").length,
      trialBookings: bookings.length,
      paidAmount: payments
        .filter((item) => item.status === "paid" || item.status === "completed")
        .reduce((sum, item) => sum + item.amount, 0),
    }
  }

  async getTutorStats(tutorId: string) {
    const [classes, sessions, earnings, reviews] = await Promise.all([
      classService.getClassesByTutor(tutorId),
      scheduleService.getSessionsByTutor(tutorId),
      earningApi.summary(),
      reviewService.getReviewsByTutor(tutorId),
    ])
    return {
      activeClasses: classes.filter((item) => item.status === "active" || item.status === "trial").length,
      upcomingSessions: sessions.filter((item) => item.status === "upcoming" || item.status === "scheduled").length,
      completedSessions: sessions.filter((item) => item.status === "completed").length,
      monthlyIncome: earnings.totalEarnings,
      averageRating: reviews.length
        ? Math.round((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length) * 10) / 10
        : 0,
    }
  }
}

export const dashboardStatsService = new DashboardStatsService()
