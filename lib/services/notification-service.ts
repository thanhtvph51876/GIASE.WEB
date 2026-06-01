import type { Notification, NotificationType, UserRole } from "@/types"
import type { PageRequestParams } from "@/lib/api/client"
import { notificationApi } from "@/lib/api/notification-api"

interface CreateNotificationData {
  userId: string
  targetRole?: UserRole
  type: NotificationType
  title: string
  content?: string
  message?: string
  link?: string
  actionUrl?: string
}

interface BulkNotificationData extends Omit<CreateNotificationData, "userId" | "targetRole"> {
  targetRole: UserRole | "all"
  userIds?: string[]
}

class NotificationService {
  async createNotification(data: CreateNotificationData) {
    return {
      success: false,
      error: "Notification nghiệp vụ được backend tạo sau action chính.",
    }
  }

  async createManyNotifications(payloads: CreateNotificationData[]) {
    return { success: false, notifications: [] as Notification[], error: "Notification nghiệp vụ được backend tạo sau action chính." }
  }

  async sendAdminNotification(data: CreateNotificationData) {
    try {
      const notification = await notificationApi.send(data as Notification)
      return { success: true, notification: notification as Notification }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể tạo thông báo" }
    }
  }

  async sendAdminBulkNotification(data: BulkNotificationData) {
    try {
      const result = await notificationApi.sendBulk(data as Partial<Notification> & { targetRole?: string; userIds?: string[] })
      return { success: true, count: result.count, targetRole: result.targetRole }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể gửi thông báo hàng loạt" }
    }
  }

  async getNotifications(_userId: string): Promise<Notification[]> {
    return notificationApi.list()
  }

  async getAdminNotifications(): Promise<Notification[]> {
    return notificationApi.adminList()
  }

  getAdminNotificationsPage(params?: PageRequestParams) {
    return notificationApi.adminListPage(params)
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return this.getNotifications(userId)
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return (await this.getNotifications(userId)).filter((notification) => !notification.read)
  }

  async getUnreadCount(_userId: string): Promise<number> {
    return notificationApi.unreadCount()
  }

  async markAsRead(id: string) {
    try {
      await notificationApi.read(id)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể đọc thông báo" }
    }
  }

  async markAllAsRead(_userId: string) {
    await notificationApi.readAll()
    return { success: true }
  }

  async deleteNotification(id: string) {
    try {
      await notificationApi.delete(id)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể xóa thông báo" }
    }
  }

  async clearAllNotifications(_userId: string) {
    try {
      await notificationApi.clear()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể xóa thông báo" }
    }
  }

  async notifyNewTrialBooking(tutorId: string, studentName: string): Promise<void> {
    void tutorId
    void studentName
  }

  async notifyBookingAccepted(userId: string, tutorName: string): Promise<void> {
    void userId
    void tutorName
  }

  async notifyTutorApproved(userId: string): Promise<void> {
    void userId
  }

  async notifyTutorRejected(userId: string, reason: string): Promise<void> {
    void userId
    void reason
  }
}

export const notificationService = new NotificationService()
