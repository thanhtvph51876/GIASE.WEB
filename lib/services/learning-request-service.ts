import type { LearningRequest, LearningRequestStatus, StudentRegistrationFormData } from "@/types"
import type { PageRequestParams } from "@/lib/api/client"
import { learningRequestApi } from "@/lib/api/learning-request-api"

class LearningRequestService {
  async createLearningRequest(data: StudentRegistrationFormData, userId?: string) {
    try {
      const request = userId ? await learningRequestApi.create(data) : await learningRequestApi.createPublic(data)
      return { success: true, request }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể tạo yêu cầu học" }
    }
  }

  async getRequestsByUser(_userId: string): Promise<LearningRequest[]> {
    return learningRequestApi.studentList()
  }

  async getPublicRequests(): Promise<LearningRequest[]> {
    return learningRequestApi.publicList()
  }

  getPublicRequestsPage(params?: PageRequestParams) {
    return learningRequestApi.publicListPage(params)
  }

  async getAllRequests(): Promise<LearningRequest[]> {
    return learningRequestApi.adminList()
  }

  getAllRequestsPage(params?: PageRequestParams) {
    return learningRequestApi.adminListPage(params)
  }

  async getRequestsByStatus(status: LearningRequestStatus): Promise<LearningRequest[]> {
    const requests = await this.getAllRequests()
    return requests.filter((request) => request.status === status)
  }

  async getRequestById(id: string): Promise<LearningRequest | null> {
    try {
      return await learningRequestApi.get(id)
    } catch {
      return null
    }
  }

  async updateRequestStatus(id: string, status: LearningRequestStatus) {
    try {
      const request = await learningRequestApi.updateStatus(id, status)
      return { success: true, request }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật trạng thái" }
    }
  }

  async changeStatus(id: string, status: LearningRequestStatus) {
    return this.updateRequestStatus(id, status)
  }

  async updateRequest(id: string, payload: Partial<LearningRequest>) {
    try {
      const request = await learningRequestApi.update(id, payload)
      return { success: true, request }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật yêu cầu" }
    }
  }

  async assignTutor(requestId: string, tutorId: string) {
    try {
      const request = await learningRequestApi.assignTutor(requestId, tutorId)
      return { success: true, request }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể gán gia sư" }
    }
  }

  async assignTutorWithBooking(requestId: string, tutorId: string) {
    try {
      const result = await learningRequestApi.assignTutorWithBooking(requestId, tutorId)
      return { success: true, request: result.learningRequest, booking: result.booking }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể gán gia sư" }
    }
  }

  async getMatchingTutors(requestId: string) {
    return learningRequestApi.matchingTutors(requestId)
  }

  async getAdminRequestById(id: string): Promise<LearningRequest | null> {
    try {
      return await learningRequestApi.adminGet(id)
    } catch {
      return null
    }
  }

  async rematchRequest(id: string, reason?: string) {
    try {
      const request = await learningRequestApi.rematch(id, reason)
      return { success: true, request }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể đưa yêu cầu vào luồng rematch" }
    }
  }

  async getRequestsByTutor(_tutorId: string): Promise<LearningRequest[]> {
    return learningRequestApi.list()
  }

  async getNewRequestsCount(): Promise<number> {
    const requests = await this.getAllRequests()
    return requests.filter((request) => request.status === "new").length
  }

  async cancelRequest(id: string, reason?: string) {
    try {
      const request = await learningRequestApi.cancel(id, reason)
      return { success: true, request }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể hủy yêu cầu" }
    }
  }

  async cancelRequestByAdmin(id: string, reason?: string) {
    try {
      const request = await learningRequestApi.adminCancel(id, reason)
      return { success: true, request }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể hủy yêu cầu bằng quyền admin" }
    }
  }
}

export const learningRequestService = new LearningRequestService()
