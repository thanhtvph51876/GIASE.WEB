"use client"

import { useCallback } from "react"
import useSWR from "swr"
import { notificationService } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"

// ============================================
// USE NOTIFICATIONS HOOK
// Manages notifications
// ============================================

export function useNotifications(userId?: string) {
  const { toast } = useToast()

  // Fetch notifications
  const {
    data: notifications,
    error,
    isLoading,
    mutate,
  } = useSWR(
    userId ? ["notifications", userId] : null,
    () => notificationService.getNotificationsByUser(userId!),
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Auto refresh every 30s
    }
  )

  // Unread notifications
  const unreadNotifications = notifications?.filter((n) => !n.read) || []
  const unreadCount = unreadNotifications.length

  // Mark as read
  const markAsRead = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await notificationService.markAsRead(id)
      if (result.success) {
        mutate()
        return true
      }
      return false
    },
    [mutate]
  )

  // Mark all as read
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (!userId) return false

    const result = await notificationService.markAllAsRead(userId)
    if (result.success) {
      mutate()
      toast({
        title: "Đã đánh dấu tất cả đã đọc",
      })
      return true
    }
    return false
  }, [userId, mutate, toast])

  // Delete notification
  const deleteNotification = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await notificationService.deleteNotification(id)
      if (result.success) {
        mutate()
        return true
      }
      return false
    },
    [mutate]
  )

  // Clear all
  const clearAll = useCallback(async (): Promise<boolean> => {
    if (!userId) return false

    const result = await notificationService.clearAllNotifications(userId)
    if (result.success) {
      mutate()
      toast({
        title: "Đã xóa tất cả thông báo",
      })
      return true
    }
    return false
  }, [userId, mutate, toast])

  return {
    notifications: notifications || [],
    unreadNotifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: mutate,
  }
}
