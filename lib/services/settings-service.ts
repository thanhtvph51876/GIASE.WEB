import type { SystemSetting, User } from "@/types"
import { settingsApi } from "@/lib/api/settings-api"

const defaultSettings: SystemSetting = {
  id: "system",
  bookingEnabled: true,
  tutorRegistrationEnabled: true,
  autoMatchingEnabled: true,
  commissionRate: 0.15,
  trialLessonPolicy: "Học thử 1 buổi, có thể chuyển thành lớp chính thức sau khi hoàn tất.",
  maintenanceMode: false,
  notificationSettings: {
    email: false,
    inApp: true,
    paymentAlerts: true,
    reviewAlerts: true,
  },
  updatedAt: "",
}

function mapSettings(value: unknown): SystemSetting {
  const raw = value && typeof value === "object" ? (value as Partial<SystemSetting>) : {}
  return {
    ...defaultSettings,
    ...raw,
    commissionRate:
      typeof raw.commissionRate === "number"
        ? raw.commissionRate
        : Number(raw.commissionRate ?? defaultSettings.commissionRate),
    notificationSettings: {
      ...defaultSettings.notificationSettings,
      ...(raw.notificationSettings || {}),
    },
  }
}

class SettingsService {
  async getSettings(): Promise<SystemSetting> {
    return this.loadSettings()
  }

  async loadSettings(): Promise<SystemSetting> {
    return mapSettings(await settingsApi.get())
  }

  async updateSettings(data: Partial<SystemSetting>, _actor?: User | null): Promise<{ success: boolean; settings: SystemSetting }> {
    const settings = mapSettings(await settingsApi.update(data))
    return { success: true, settings }
  }
}

export const settingsService = new SettingsService()
