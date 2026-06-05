"use client"

import { useCallback } from "react"
import useSWR from "swr"
import { notificationService } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"

const NOTIFICATION_PAGE_SIZE = 50

// ============================================
// USE NOTIFICATIONS HOOK
// Manages notifications
// ============================================

export function useNotifications(userId?: string, options: { page?: number; pageSize?: number } = {}) {
  const { toast } = useToast()
  const page = options.page || 1
  const pageSize = options.pageSize || NOTIFICATION_PAGE_SIZE

  // Fetch notifications
  const {
    data: notificationPage,
    error,
    isLoading,
    mutate,
  } = useSWR(
    userId ? ["notifications", userId, page, pageSize] : null,
    () => notificationService.getNotificationsPage(userId!, { page, pageSize }),
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Auto refresh every 30s
    }
  )
  const { data: unreadTotal, mutate: mutateUnreadCount } = useSWR(
    userId ? ["notifications-unread-count", userId] : null,
    () => notificationService.getUnreadCount(userId!),
    {
      revalidateOnFocus: false,
      refreshInterval: 30000,
    }
  )

  // Unread notifications
  const notifications = notificationPage?.items || []
  const unreadNotifications = notifications?.filter((n) => !n.read) || []
  const unreadCount = typeof unreadTotal === "number" ? unreadTotal : unreadNotifications.length

  // Mark as read
  const markAsRead = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await notificationService.markAsRead(id)
      if (result.success) {
        mutate()
        mutateUnreadCount()
        return true
      }
      return false
    },
    [mutate, mutateUnreadCount]
  )

  // Mark all as read
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (!userId) return false

    const result = await notificationService.markAllAsRead(userId)
    if (result.success) {
      mutate()
      mutateUnreadCount()
      toast({
        title: "Đã đánh dấu tất cả đã đọc",
      })
      return true
    }
    return false
  }, [userId, mutate, mutateUnreadCount, toast])

  // Delete notification
  const deleteNotification = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await notificationService.deleteNotification(id)
      if (result.success) {
        mutate()
        mutateUnreadCount()
        return true
      }
      return false
    },
    [mutate, mutateUnreadCount]
  )

  // Clear all
  const clearAll = useCallback(async (): Promise<boolean> => {
    if (!userId) return false

    const result = await notificationService.clearAllNotifications(userId)
    if (result.success) {
      mutate()
      mutateUnreadCount()
      toast({
        title: "Đã xóa tất cả thông báo",
      })
      return true
    }
    return false
  }, [userId, mutate, mutateUnreadCount, toast])

  return {
    notifications,
    pagination: notificationPage?.pagination,
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
