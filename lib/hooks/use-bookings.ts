"use client"

import { useCallback } from "react"
import useSWR from "swr"
import type { TrialBooking, TrialBookingFormData, Tutor, User } from "@/types"
import { bookingService, workflowService } from "@/lib/services"
import type { TrialScheduleInput } from "@/lib/services/workflowService"
import { useToast } from "@/hooks/use-toast"

// ============================================
// USE BOOKINGS HOOK
// Manages trial bookings
// ============================================

interface UseBookingsOptions {
  userId?: string
  tutorId?: string
  user?: User | null
  tutorProfile?: Tutor | null
  role?: "student" | "tutor"
}

export function useBookings(options: UseBookingsOptions = {}) {
  const { userId, tutorId, role = "student", user, tutorProfile } = options
  const { toast } = useToast()

  // Fetch bookings based on role
  const {
    data: bookings,
    error,
    isLoading,
    mutate,
  } = useSWR(
    role === "tutor" && tutorId
      ? ["bookings-tutor", tutorId]
      : userId
      ? ["bookings-user", userId]
      : null,
    () =>
      role === "tutor" && tutorId
        ? bookingService.getBookingsByTutor(tutorId)
        : userId
        ? bookingService.getBookingsByUser(userId)
        : Promise.resolve([]),
    {
      revalidateOnFocus: false,
    }
  )

  // Create booking
  const createBooking = useCallback(
    async (
      targetTutorId: string,
      data: TrialBookingFormData
    ): Promise<TrialBooking | null> => {
      try {
        const result = await bookingService.createTrialBooking(
          targetTutorId,
          data,
          userId
        )

        if (result.success && result.booking) {
          mutate()
          toast({
            title: "Đăng ký học thử thành công",
            description: "Gia sư sẽ liên hệ với bạn để xác nhận lịch học",
          })
          return result.booking
        }

        toast({
          title: "Đăng ký thất bại",
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

  // Accept booking (for tutor)
  const acceptBooking = useCallback(
    async (id: string, schedule: TrialScheduleInput): Promise<boolean> => {
      try {
        const targetTutorId = tutorProfile?.id || tutorId
        if (!targetTutorId) return false
        await workflowService.acceptTrialBooking(id, targetTutorId, schedule, user)

        mutate()
        toast({
          title: "Đã chấp nhận yêu cầu",
          description: "Lịch học thử đã được tạo và học sinh sẽ được thông báo",
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
    [mutate, toast, tutorId, tutorProfile, user]
  )

  // Reject booking (for tutor)
  const rejectBooking = useCallback(
    async (id: string, reason: string): Promise<boolean> => {
      try {
        const targetTutorId = tutorProfile?.id || tutorId
        if (!targetTutorId) return false
        await workflowService.rejectTrialBooking(id, targetTutorId, reason, user)
        mutate()
        toast({
          title: "Đã từ chối yêu cầu",
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
    [mutate, toast, tutorId, tutorProfile, user]
  )

  // Get pending bookings
  const pendingBookings = bookings?.filter((b) => b.status === "pending" || b.status === "assigned") || []

  return {
    bookings: bookings || [],
    pendingBookings,
    isLoading,
    error,
    createBooking,
    acceptBooking,
    rejectBooking,
    refresh: mutate,
  }
}
