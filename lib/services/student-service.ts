import type { ParentProfile, StudentProfile } from "@/types"
import { apiRequest } from "@/lib/api/client"

class StudentService {
  async getStudentProfiles(): Promise<StudentProfile[]> {
    const profiles = await apiRequest<StudentProfile[]>("/admin/student-profiles")
    return profiles.map(mapStudentProfile)
  }

  async getParentProfiles(): Promise<ParentProfile[]> {
    const profiles = await apiRequest<ParentProfile[]>("/admin/parent-profiles")
    return profiles.map(mapParentProfile)
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
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    }
  }
}

function mapStudentProfile(profile: StudentProfile): StudentProfile {
  return {
    ...profile,
    learningGoals: Array.isArray(profile.learningGoals) ? profile.learningGoals : [],
    favoriteTutorIds: Array.isArray(profile.favoriteTutorIds) ? profile.favoriteTutorIds : [],
  }
}

function mapParentProfile(profile: ParentProfile): ParentProfile {
  return {
    ...profile,
    studentIds: Array.isArray(profile.studentIds) ? profile.studentIds : [],
  }
}

export const studentService = new StudentService()
