"use client"

import { useCallback } from "react"
import useSWR from "swr"
import type { LearningRequest, StudentRegistrationFormData, LearningRequestStatus, User } from "@/types"
import type { ApiPagination, PageRequestParams } from "@/lib/api/client"
import { auditLogService, learningRequestService, workflowService } from "@/lib/services"
import { assertPermission, canUpdateLearningRequestStatus } from "@/lib/permissions"
import { retryGet, withPublicTimeout } from "@/lib/public-data"
import { useToast } from "@/hooks/use-toast"

// ============================================
// USE LEARNING REQUESTS HOOK
// Manages learning requests
// ============================================

export function useLearningRequests(userId?: string) {
  const { toast } = useToast()

  // Fetch requests for user
  const {
    data: requests,
    error,
    isLoading,
    mutate,
  } = useSWR(
    userId ? ["learning-requests", userId] : null,
    () => learningRequestService.getRequestsByUser(userId!),
    {
      revalidateOnFocus: false,
    }
  )

  // Create request
  const createRequest = useCallback(
    async (data: StudentRegistrationFormData): Promise<LearningRequest | null> => {
      try {
        const result = await learningRequestService.createLearningRequest(data, userId)

        if (result.success && result.request) {
          mutate()
          toast({
            title: "Yêu cầu đã được gửi",
            description: `Mã yêu cầu: ${result.request.requestCode}. Đội ngũ tư vấn sẽ liên hệ trong thời gian sớm nhất.`,
          })
          return result.request
        }

        toast({
          title: "Gửi yêu cầu thất bại",
          description: result.error,
          variant: "destructive",
        })
        return null
      } catch {
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra, vui lòng thử lại",
          variant: "destructive",
        })
        return null
      }
    },
    [userId, mutate, toast]
  )

  // Cancel request
  const cancelRequest = useCallback(
    async (id: string, reason?: string): Promise<boolean> => {
      try {
        const result = await learningRequestService.cancelRequest(id, reason)

        if (result.success) {
          mutate()
          toast({
            title: "Đã hủy yêu cầu",
          })
          return true
        }

        toast({
          title: "Hủy thất bại",
          description: result.error,
          variant: "destructive",
        })
        return false
      } catch {
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra, vui lòng thử lại",
          variant: "destructive",
        })
        return false
      }
    },
    [mutate, toast]
  )

  return {
    requests: requests || [],
    isLoading,
    error,
    createRequest,
    cancelRequest,
    refresh: mutate,
  }
}

export function useOpenLearningRequests() {
  return useOpenLearningRequestsPage()
}

export function useOpenLearningRequestsPage(params: PageRequestParams = {}) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(["open-learning-requests", params.page || 1, params.pageSize || 24, params.search || "", params.subject || "", params.grade || "", params.location || ""], () => retryGet(() => withPublicTimeout(learningRequestService.getPublicRequestsPage(params), "Yêu cầu học đang mở")), {
    revalidateOnFocus: false,
  })

  const items = (data?.items || []).filter(
    (request) => request.status !== "cancelled" && request.status !== "completed"
  )

  return {
    requests: items,
    pagination: data?.pagination || { page: params.page || 1, pageSize: params.pageSize || 24, total: items.length, totalPages: 1 },
    isLoading,
    isValidating,
    loading: isLoading,
    error,
    refetch: mutate,
    refresh: mutate,
  }
}

export function useTutorLearningRequests(tutorId?: string) {
  const {
    data: requests,
    error,
    isLoading,
    mutate,
  } = useSWR(
    tutorId ? ["learning-requests", "tutor", tutorId] : null,
    () => learningRequestService.getRequestsByTutor(tutorId!),
    { revalidateOnFocus: false }
  )

  return {
    requests: requests || [],
    isLoading,
    loading: isLoading,
    error,
    refetch: mutate,
    refresh: mutate,
  }
}

// ============================================
// USE ADMIN LEARNING REQUESTS HOOK
// For admin dashboard
// ============================================

const emptyPagination: ApiPagination = { page: 1, pageSize: 50, total: 0, totalPages: 1 }

export function useAdminLearningRequests(actor?: User | null, params: PageRequestParams = {}) {
  const { toast } = useToast()

  const {
    data: requests,
    error,
    isLoading,
    mutate,
  } = useSWR(["admin-learning-requests", params.page || 1, params.pageSize || 50, params.status || "", params.search || ""], () => learningRequestService.getAllRequestsPage(params), {
    revalidateOnFocus: false,
  })

  // Update status
  const updateStatus = useCallback(
    async (id: string, status: LearningRequestStatus): Promise<boolean> => {
      try {
        assertPermission(canUpdateLearningRequestStatus(actor))
        const before = requests?.items.find((request) => request.id === id)
        const result = await learningRequestService.updateRequestStatus(id, status)

        if (result.success) {
          if (actor && result.request) {
            await auditLogService.createLog({
              actorId: actor.id,
              actorName: actor.fullName,
              actorRole: actor.role,
              action: "admin.update_learning_request_status",
              entityType: "learningRequest",
              entityId: result.request.id,
              entityName: result.request.requestCode,
              before,
              after: result.request,
              note: `Cập nhật trạng thái thành ${status}`,
            })
          }
          mutate()
          toast({
            title: "Cập nhật thành công",
          })
          return true
        }

        toast({
          title: "Cập nhật thất bại",
          description: result.error,
          variant: "destructive",
        })
        return false
      } catch (error) {
        toast({
          title: "Lỗi",
          description: error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại",
          variant: "destructive",
        })
        return false
      }
    },
    [mutate, toast, actor, requests]
  )

  // Assign tutor
  const assignTutor = useCallback(
    async (requestId: string, tutorId: string): Promise<boolean> => {
      try {
        const result = await workflowService.assignTutorToRequest(requestId, tutorId, actor)
        mutate()
        toast({
          title: "Đã gán gia sư",
          description: `Booking học thử đã được tạo: ${result.booking.id.slice(0, 8)}`,
        })
        return true
      } catch (error) {
        toast({
          title: "Lỗi",
          description: error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại",
          variant: "destructive",
        })
        return false
      }
    },
    [mutate, toast, actor]
  )

  return {
    requests: requests?.items || [],
    pagination: requests?.pagination || emptyPagination,
    isLoading,
    error,
    updateStatus,
    assignTutor,
    refresh: mutate,
  }
}
