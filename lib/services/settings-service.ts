import type { SystemSetting, User } from "@/types"
import { settingsApi } from "@/lib/api/settings-api"

const defaultSettings: SystemSetting = {
  id: "system",
  bookingEnabled: true,
  tutorRegistrationEnabled: true,
  autoMatchingEnabled: true,
  commissionRate: 0.15,
  trialLessonPolicy: "Học thử trước khi chuyển thành lớp chính thức.",
  maintenanceMode: false,
  notificationSettings: {
    email: false,
    inApp: true,
    paymentAlerts: true,
    reviewAlerts: true,
  },
  updatedAt: new Date().toISOString(),
}

class SettingsService {
  getSettings(): SystemSetting {
    return defaultSettings
  }

  async loadSettings(): Promise<SystemSetting> {
    const raw = (await settingsApi.get()) as Partial<SystemSetting>
    return { ...defaultSettings, ...raw, updatedAt: new Date().toISOString() }
  }

  async updateSettings(data: Partial<SystemSetting>, _actor?: User | null): Promise<{ success: boolean; settings: SystemSetting }> {
    const settings = (await settingsApi.update(data)) as Partial<SystemSetting>
    return { success: true, settings: { ...defaultSettings, ...settings, updatedAt: new Date().toISOString() } }
  }
}

export const settingsService = new SettingsService()
