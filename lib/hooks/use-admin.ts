"use client"

import useSWR from "swr"
import { adminOperationService, adminService, auditLogService, bookingService, classService, learningRequestService, reviewService, scheduleService, tutorService } from "@/lib/services"
import type { User } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { hasAdminPermission } from "@/lib/admin/admin-permissions"

type DashboardData = {
  stats?: Awaited<ReturnType<typeof adminService.getDashboardStats>>
  reports?: Awaited<ReturnType<typeof adminService.getReportsData>>
  pendingTutors: Awaited<ReturnType<typeof adminService.getPendingTutors>>
  requests: Awaited<ReturnType<typeof adminService.getAllLearningRequests>>
  sessions: Awaited<ReturnType<typeof scheduleService.getAllSessions>>
  classes: Awaited<ReturnType<typeof classService.getAllClasses>>
  bookings: Awaited<ReturnType<typeof bookingService.getAllBookings>>
  reviews: Awaited<ReturnType<typeof reviewService.getAllReviews>>
}

async function settleDashboardTasks(tasks: Array<[keyof DashboardData, Promise<unknown>]>) {
  const data: DashboardData = {
    pendingTutors: [],
    requests: [],
    sessions: [],
    classes: [],
    bookings: [],
    reviews: [],
  }
  const results = await Promise.allSettled(tasks.map(([, task]) => task))
  results.forEach((result, index) => {
    const key = tasks[index]?.[0]
    if (!key) return
    if (result.status === "fulfilled") {
      ;(data as Record<string, unknown>)[key] = result.value
    } else if (process.env.NODE_ENV !== "production") {
      console.warn(`Admin dashboard widget failed: ${String(key)}`, result.reason)
    }
  })
  return data
}

export function useAdminDashboard(actor?: User | null) {
  const { user } = useAuthContext()
  const currentUser = actor ?? user
  const { data, error, isLoading, mutate } = useSWR(
    currentUser ? ["admin-dashboard", currentUser.role] : null,
    async () => {
      const tasks: Array<[keyof DashboardData, Promise<unknown>]> = []
      if (hasAdminPermission(currentUser, "reports.read")) {
        tasks.push(["stats", adminService.getDashboardStats()])
        tasks.push(["reports", adminService.getReportsData()])
      }
      if (hasAdminPermission(currentUser, "tutors.read")) tasks.push(["pendingTutors", adminService.getPendingTutors()])
      if (hasAdminPermission(currentUser, "learning_requests.read")) tasks.push(["requests", adminService.getAllLearningRequests()])
      if (hasAdminPermission(currentUser, "sessions.read")) tasks.push(["sessions", scheduleService.getAllSessions()])
      if (hasAdminPermission(currentUser, "classes.read")) tasks.push(["classes", classService.getAllClasses()])
      if (hasAdminPermission(currentUser, "bookings.read")) tasks.push(["bookings", bookingService.getAllBookings()])
      if (hasAdminPermission(currentUser, "reviews.read")) tasks.push(["reviews", reviewService.getAllReviews()])
      return settleDashboardTasks(tasks)
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
  const { user } = useAuthContext()
  const { data, error, isLoading, mutate } = useSWR(
    user && hasAdminPermission(user, "operations.read") ? ["admin-operations", user.role] : null,
    async () => {
      const [
        overview,
        matchingQueue,
        bookingRisk,
        verificationRisk,
        paymentReconciliation,
        payoutQueue,
        tutorQuality,
        disputes,
        tutors,
        requests,
        bookings,
        sessions,
        classes,
        reviews,
      ] = await Promise.all([
        adminOperationService.overview(),
        adminOperationService.matchingQueue(),
        adminOperationService.bookingRisk(),
        adminOperationService.verificationRisk(),
        adminOperationService.paymentReconciliation(),
        adminOperationService.payoutQueue(),
        adminOperationService.tutorQuality(),
        adminOperationService.disputes(),
        hasAdminPermission(user, "tutors.read") ? tutorService.getAllTutors() : Promise.resolve([]),
        hasAdminPermission(user, "learning_requests.read") ? learningRequestService.getAllRequests() : Promise.resolve([]),
        hasAdminPermission(user, "bookings.read") ? bookingService.getAllBookings() : Promise.resolve([]),
        hasAdminPermission(user, "sessions.read") ? scheduleService.getAllSessions() : Promise.resolve([]),
        hasAdminPermission(user, "classes.read") ? classService.getAllClasses() : Promise.resolve([]),
        hasAdminPermission(user, "reviews.read") ? reviewService.getAllReviews() : Promise.resolve([]),
      ])
      return {
        overview,
        matchingQueue,
        bookingRisk,
        verificationRisk,
        paymentReconciliation,
        payoutQueue,
        tutorQuality,
        disputes,
        tutors,
        requests,
        bookings,
        sessions,
        classes,
        reviews,
      }
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
      if (!hasAdminPermission(actor, "tutors.approve")) {
        toast({ title: "Không có quyền duyệt hồ sơ", variant: "destructive" })
        return false
      }
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
      if (!hasAdminPermission(actor, "tutors.reject")) {
        toast({ title: "Không có quyền từ chối hồ sơ", variant: "destructive" })
        return false
      }
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
