import type { Class as LearningClass, ClassSession, ClassStatus } from "@/types"
import { classApi } from "@/lib/api/class-api"

type CreateClassData = Omit<
  LearningClass,
  "id" | "totalSessions" | "completedSessions" | "createdAt" | "updatedAt"
> & {
  id?: string
  totalSessions?: number
  completedSessions?: number
}

interface GenerateSessionsConfig {
  startDate: string
  count: number
  durationMinutes: number
  time: string
  weekdays?: number[]
}

class ClassService {
  async createClass(data: CreateClassData) {
    try {
      const created = await classApi.create(data)
      return { success: true, class: created }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể tạo lớp" }
    }
  }

  async getClassById(id: string): Promise<LearningClass | null> {
    try {
      return await classApi.get(id)
    } catch {
      return null
    }
  }

  async getClassesByStudent(_studentId: string): Promise<LearningClass[]> {
    return classApi.list("student")
  }

  async getClassesByTutor(_tutorId: string): Promise<LearningClass[]> {
    return classApi.list("tutor")
  }

  async getAllClasses(): Promise<LearningClass[]> {
    return classApi.list("admin")
  }

  async updateClassStatus(classId: string, status: ClassStatus, _note?: string) {
    try {
      const updated = await classApi.updateStatus(classId, status)
      return { success: true, class: updated }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật lớp" }
    }
  }

  async updateClass(classId: string, payload: Partial<LearningClass>) {
    try {
      const updated = await classApi.update(classId, payload)
      return { success: true, class: updated }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật lớp" }
    }
  }

  async cancelClass(classId: string, reason?: string) {
    return this.updateClassStatus(classId, "cancelled", reason)
  }

  async pauseClass(classId: string, reason?: string) {
    return this.updateClassStatus(classId, "paused", reason)
  }

  async completeClass(classId: string) {
    return this.updateClassStatus(classId, "completed")
  }

  async incrementCompletedSessions(_classId: string): Promise<void> {}

  async generateSessionsForClass(
    classId: string,
    scheduleConfig: GenerateSessionsConfig
  ): Promise<{ success: boolean; sessions?: ClassSession[]; error?: string }> {
    const generated: ClassSession[] = []
    const start = new Date(scheduleConfig.startDate)
    let cursor = new Date(start)
    const weekdays = scheduleConfig.weekdays?.length ? scheduleConfig.weekdays : [start.getDay()]
    while (generated.length < scheduleConfig.count) {
      if (weekdays.includes(cursor.getDay())) {
        const [hour, minute] = scheduleConfig.time.split(":").map(Number)
        const scheduledStart = new Date(cursor)
        scheduledStart.setHours(hour || 0, minute || 0, 0, 0)
        const scheduledEnd = new Date(scheduledStart)
        scheduledEnd.setMinutes(scheduledEnd.getMinutes() + scheduleConfig.durationMinutes)
        generated.push(
          await classApi.createSession(classId, {
            startTime: scheduledStart.toISOString(),
            endTime: scheduledEnd.toISOString(),
            scheduledStart: scheduledStart.toISOString(),
            scheduledEnd: scheduledEnd.toISOString(),
          } as Partial<ClassSession>)
        )
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    return { success: true, sessions: generated }
  }
}

export const classService = new ClassService()
