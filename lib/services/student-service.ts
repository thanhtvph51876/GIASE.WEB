import type { ParentProfile, StudentProfile } from "@/types"
import { apiRequest } from "@/lib/api/client"

class StudentService {
  getStudentProfiles(): StudentProfile[] {
    return []
  }

  getParentProfiles(): ParentProfile[] {
    return []
  }

  async upsertStudentProfile(
    profile: Omit<StudentProfile, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ): Promise<StudentProfile> {
    const updated = await apiRequest<StudentProfile>("/users/me/profile", {
      method: "PATCH",
      body: {
        grade: profile.grade,
        learningGoals: profile.learningGoals?.join(", "),
      },
    })
    return {
      id: updated.id || profile.id || "student-profile",
      userId: profile.userId,
      studentName: profile.studentName,
      grade: profile.grade,
      school: profile.school,
      learningGoals: profile.learningGoals,
      favoriteTutorIds: profile.favoriteTutorIds,
      createdAt: updated.createdAt || new Date().toISOString(),
      updatedAt: updated.updatedAt || new Date().toISOString(),
    }
  }
}

export const studentService = new StudentService()
