import type { ClassSession, SessionStatus, TeachingMode } from "@/types"
import { apiRequest } from "@/lib/api/client"
import { classApi } from "@/lib/api/class-api"
import { mapSession } from "@/lib/api/mappers"

export interface CreateSessionData {
  classId?: string
  tutorId: string
  studentId: string
  tutorName: string
  studentName: string
  subject: string
  grade: string
  startTime: string
  endTime: string
  mode: TeachingMode
  location?: string
  isTrial?: boolean
  note?: string
}

class ScheduleService {
  async createSession(data: CreateSessionData) {
    if (!data.classId) return { success: false, error: "Thiếu lớp học" }
    try {
      const session = await classApi.createSession(data.classId, {
        ...data,
        scheduledStart: data.startTime,
        scheduledEnd: data.endTime,
      } as Partial<ClassSession>)
      return { success: true, session }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể tạo buổi học" }
    }
  }

  async getSessionsByStudent(_studentId: string): Promise<ClassSession[]> {
    return classApi.allSessions()
  }

  async getSessionsByTutor(_tutorId: string): Promise<ClassSession[]> {
    return classApi.allSessions("tutor")
  }

  async getSessionsByClass(classId: string): Promise<ClassSession[]> {
    return classApi.sessions(classId)
  }

  async getUpcomingSessions(userId: string, role: "student" | "tutor"): Promise<ClassSession[]> {
    const sessions = role === "student" ? await this.getSessionsByStudent(userId) : await this.getSessionsByTutor(userId)
    return sessions.filter((session) => session.status === "upcoming" || session.status === "scheduled")
  }

  async getCompletedSessions(userId: string, role: "student" | "tutor"): Promise<ClassSession[]> {
    const sessions = role === "student" ? await this.getSessionsByStudent(userId) : await this.getSessionsByTutor(userId)
    return sessions.filter((session) => session.status === "completed")
  }

  async getSessionById(id: string): Promise<ClassSession | null> {
    try {
      return await classApi.getSession(id)
    } catch {
      return null
    }
  }

  async updateSessionStatus(id: string, status: SessionStatus, note?: string) {
    try {
      const session =
        status === "completed"
          ? await classApi.completeSession(id, note, true)
          : status === "cancelled"
            ? await classApi.cancelSession(id, note, true)
            : mapSession(
                await apiRequest(`/admin/sessions/${id}`, {
                  method: "PATCH",
                  body: { status, note, tutorNote: note },
                })
              )
      return { success: true, session }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật buổi học" }
    }
  }

  async completeSession(id: string, note?: string) {
    try {
      const session = await classApi.completeSession(id, note)
      return { success: true, session }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể hoàn thành buổi học" }
    }
  }

  async cancelSession(id: string, reason?: string) {
    return this.updateSessionStatus(id, "cancelled", reason)
  }

  async markCompleted(id: string, note?: string) {
    return this.completeSession(id, note)
  }

  async markStudentAbsent(id: string, note?: string) {
    try {
      const session = mapSession(await apiRequest(`/admin/sessions/${id}/mark-student-absent`, { method: "POST", body: { note } }))
      return { success: true, session }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật vắng học viên" }
    }
  }

  async markTutorAbsent(id: string, note?: string) {
    try {
      const session = mapSession(await apiRequest(`/admin/sessions/${id}/mark-tutor-absent`, { method: "POST", body: { note } }))
      return { success: true, session }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật vắng gia sư" }
    }
  }

  async getAllSessions(): Promise<ClassSession[]> {
    return classApi.allSessions("admin")
  }

  async getWeeklySessionsCount(tutorId: string): Promise<number> {
    const sessions = await this.getSessionsByTutor(tutorId)
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    return sessions.filter((session) => {
      const sessionDate = new Date(session.startTime)
      return sessionDate >= startOfWeek && sessionDate <= endOfWeek && session.status !== "cancelled"
    }).length
  }

  async getUpcomingCount(userId: string, role: "student" | "tutor"): Promise<number> {
    return (await this.getUpcomingSessions(userId, role)).length
  }
}

export const scheduleService = new ScheduleService()
