"use client"

import { useCallback } from "react"
import useSWR from "swr"
import type { ClassSession, SessionStatus, User } from "@/types"
import { scheduleService, workflowService } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"

// ============================================
// USE SCHEDULE HOOK
// Manages class sessions
// ============================================

interface UseScheduleOptions {
  userId: string
  role: "student" | "tutor"
  actor?: User | null
}

export function useSchedule(options: UseScheduleOptions) {
  const { userId, role, actor } = options
  const { toast } = useToast()

  // Fetch sessions
  const {
    data: sessions,
    error,
    isLoading,
    mutate,
  } = useSWR(
    userId ? ["sessions", userId, role] : null,
    () =>
      role === "student"
        ? scheduleService.getSessionsByStudent(userId)
        : scheduleService.getSessionsByTutor(userId),
    {
      revalidateOnFocus: false,
    }
  )

  // Get upcoming sessions
  const upcomingSessions = sessions?.filter((s) => s.status === "upcoming") || []

  // Get completed sessions
  const completedSessions = sessions?.filter((s) => s.status === "completed") || []

  // Get cancelled sessions
  const cancelledSessions = sessions?.filter((s) => s.status === "cancelled") || []

  // Update session status
  const updateStatus = useCallback(
    async (id: string, status: SessionStatus, note?: string): Promise<boolean> => {
      try {
        const result = await scheduleService.updateSessionStatus(id, status, note)

        if (result.success) {
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

  // Complete session
  const completeSession = useCallback(
    async (id: string, note?: string): Promise<boolean> => {
      try {
        await workflowService.completeSession(id, actor)
        mutate()
        toast({
          title: "Đã hoàn thành buổi học",
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
    [actor, mutate, toast]
  )

  // Cancel session
  const cancelSession = useCallback(
    async (id: string, reason?: string): Promise<boolean> => {
      const result = await updateStatus(id, "cancelled", reason)
      if (result) {
        toast({
          title: "Đã hủy buổi học",
        })
      }
      return result
    },
    [updateStatus, toast]
  )

  return {
    sessions: sessions || [],
    upcomingSessions,
    completedSessions,
    cancelledSessions,
    isLoading,
    error,
    updateStatus,
    completeSession,
    cancelSession,
    refresh: mutate,
  }
}
