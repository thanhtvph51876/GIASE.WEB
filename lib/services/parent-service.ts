import { apiRequest } from "@/lib/api/client"

export interface ParentStudentPayload {
  fullName: string
  dateOfBirth?: string
  gender?: string
  gradeId?: string
  schoolName?: string
  learningGoal?: string
  note?: string
  relationship?: string
}

class ParentService {
  listStudents() {
    return apiRequest<Record<string, unknown>[]>("/parent/students")
  }

  createStudent(payload: ParentStudentPayload) {
    return apiRequest<Record<string, unknown>>("/parent/students", { method: "POST", body: payload })
  }

  updateStudent(studentId: string, payload: Partial<ParentStudentPayload>) {
    return apiRequest<Record<string, unknown>>(`/parent/students/${studentId}`, { method: "PATCH", body: payload })
  }

  getStudent(studentId: string) {
    return apiRequest<Record<string, unknown>>(`/parent/students/${studentId}`)
  }

  getStudentDashboard(studentId: string) {
    return apiRequest<Record<string, unknown>>(`/parent/students/${studentId}/dashboard`)
  }

  getStudentSchedule(studentId: string) {
    return apiRequest<Record<string, unknown>[]>(`/parent/students/${studentId}/schedule`)
  }

  getStudentProgress(studentId: string) {
    return apiRequest<Record<string, unknown>>(`/parent/students/${studentId}/progress`)
  }

  getStudentPayments(studentId: string) {
    return apiRequest<Record<string, unknown>[]>(`/parent/students/${studentId}/payments`)
  }
}

export const parentService = new ParentService()
