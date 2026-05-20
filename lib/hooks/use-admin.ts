"use client"

import useSWR from "swr"
import { adminService, auditLogService, bookingService, classService, learningRequestService, reviewService, scheduleService, tutorService } from "@/lib/services"
import type { User } from "@/types"
import { useToast } from "@/hooks/use-toast"

export function useAdminDashboard() {
  const { data, error, isLoading, mutate } = useSWR(
    "admin-dashboard",
    async () => {
      const [stats, reports, pendingTutors, requests, sessions, classes, bookings, reviews] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getReportsData(),
        adminService.getPendingTutors(),
        adminService.getAllLearningRequests(),
        scheduleService.getAllSessions(),
        classService.getAllClasses(),
        bookingService.getAllBookings(),
        reviewService.getAllReviews(),
      ])
      return { stats, reports, pendingTutors, requests, sessions, classes, bookings, reviews }
    },
    { revalidateOnFocus: false }
  )

  return { data, error, isLoading, loading: isLoading, refetch: mutate, refresh: mutate }
}

export function useAdminStudents() {
  const { data, error, isLoading, mutate } = useSWR("admin-students", () => adminService.getStudents(), {
    revalidateOnFocus: false,
  })

  return { students: data || [], error, isLoading, loading: isLoading, refetch: mutate, refresh: mutate }
}

export function usePendingTutors() {
  const { data, error, isLoading, mutate } = useSWR("pending-tutors", () => adminService.getPendingTutors(), {
    revalidateOnFocus: false,
  })

  return { tutors: data || [], error, isLoading, loading: isLoading, refetch: mutate, refresh: mutate }
}

export function useAdminOperations() {
  const { data, error, isLoading, mutate } = useSWR(
    "admin-operations",
    async () => {
      const [tutors, requests, bookings, sessions, classes, reviews] = await Promise.all([
        tutorService.getAllTutors(),
        learningRequestService.getAllRequests(),
        bookingService.getAllBookings(),
        scheduleService.getAllSessions(),
        classService.getAllClasses(),
        reviewService.getAllReviews(),
      ])
      return { tutors, requests, bookings, sessions, classes, reviews }
    },
    { revalidateOnFocus: false }
  )

  return { data, error, isLoading, loading: isLoading, refetch: mutate, refresh: mutate }
}

export function useAuditLogs() {
  const { data, error, isLoading, mutate } = useSWR("audit-logs", () => auditLogService.getAllLogs(), {
    revalidateOnFocus: false,
  })

  return { logs: data || [], error, isLoading, loading: isLoading, refetch: mutate, refresh: mutate }
}

export function useTutorApprovalActions(actor?: User | null, onDone?: () => void) {
  const { toast } = useToast()

  const approveTutor = async (id: string): Promise<boolean> => {
    try {
      const result = await adminService.approveTutor(id, actor)
      if (result.success) {
        toast({ title: "Đã duyệt hồ sơ gia sư" })
        onDone?.()
        return true
      }
      toast({ title: "Duyệt hồ sơ thất bại", description: result.error, variant: "destructive" })
      return false
    } catch (error) {
      toast({ title: "Không thể duyệt hồ sơ", description: error instanceof Error ? error.message : "Vui lòng thử lại", variant: "destructive" })
      return false
    }
  }

  const rejectTutor = async (id: string, reason: string): Promise<boolean> => {
    try {
      const result = await adminService.rejectTutor(id, reason, actor)
      if (result.success) {
        toast({ title: "Đã từ chối hồ sơ gia sư" })
        onDone?.()
        return true
      }
      toast({ title: "Từ chối hồ sơ thất bại", description: result.error, variant: "destructive" })
      return false
    } catch (error) {
      toast({ title: "Không thể từ chối hồ sơ", description: error instanceof Error ? error.message : "Vui lòng thử lại", variant: "destructive" })
      return false
    }
  }

  return { approveTutor, rejectTutor }
}
