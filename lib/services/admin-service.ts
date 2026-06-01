import type { AdminStats, LearningRequest, Tutor, User } from "@/types"
import type { PageRequestParams } from "@/lib/api/client"
import { adminApi } from "@/lib/api/admin-api"
import { tutorService } from "./tutor-service"
import { learningRequestService } from "./learning-request-service"

class AdminService {
  async getDashboardStats(): Promise<AdminStats> {
    return adminApi.overview()
  }

  async getPendingTutors(): Promise<Tutor[]> {
    return tutorService.getPendingTutors()
  }

  async approveTutor(tutorId: string, actor?: User | null): Promise<{ success: boolean; error?: string }> {
    const result = await tutorService.approveTutor(tutorId)
    return { success: result.success, error: result.error }
  }

  async rejectTutor(tutorId: string, reason: string, actor?: User | null): Promise<{ success: boolean; error?: string }> {
    const result = await tutorService.rejectTutor(tutorId, reason)
    return { success: result.success, error: result.error }
  }

  async requestTutorUpdate(tutorId: string, note: string, actor?: User | null): Promise<{ success: boolean; error?: string }> {
    const result = await tutorService.requestTutorUpdate(tutorId, note, actor)
    return { success: result.success, error: result.error }
  }

  async suspendTutor(tutorId: string, reason: string, actor?: User | null): Promise<{ success: boolean; error?: string }> {
    const result = await tutorService.suspendTutor(tutorId, reason, actor)
    return { success: result.success, error: result.error }
  }

  async reactivateTutor(tutorId: string, actor?: User | null): Promise<{ success: boolean; error?: string }> {
    const result = await tutorService.reactivateTutor(tutorId, actor)
    return { success: result.success, error: result.error }
  }

  async getAllLearningRequests(): Promise<LearningRequest[]> {
    return learningRequestService.getAllRequests()
  }

  async assignTutorToRequest(requestId: string, tutorId: string): Promise<{ success: boolean; error?: string }> {
    const result = await learningRequestService.assignTutor(requestId, tutorId)
    return { success: result.success, error: result.error }
  }

  async getReportsData() {
    return adminApi.reports()
  }

  async getTopRatedTutors(limit: number = 5): Promise<Tutor[]> {
    const tutors = await tutorService.getAllTutors()
    return tutors
      .filter((tutor) => tutor.approvalStatus === "approved")
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
  }

  async getAllUsers(): Promise<User[]> {
    return adminApi.users()
  }

  getUsersPage(params?: PageRequestParams) {
    return adminApi.usersPage(params)
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await adminApi.user(id)
    } catch {
      return null
    }
  }

  async updateUserStatus(id: string, status: User["status"], reason?: string) {
    try {
      const user = await adminApi.updateUserStatus(id, status, reason)
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật trạng thái tài khoản" }
    }
  }

  async getStudents(): Promise<User[]> {
    const users = await this.getAllUsers()
    return users.filter((user) => user.role === "student" || user.role === "parent")
  }
}

export const adminService = new AdminService()
