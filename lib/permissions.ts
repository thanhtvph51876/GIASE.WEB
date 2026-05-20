import type { ClassSession, Conversation, LearningRequest, TrialBooking, Tutor, User } from "@/types"

export const PERMISSION_ERROR = "Bạn không có quyền thực hiện thao tác này."

export function canAccessAdmin(user?: User | null): boolean {
  return user?.role === "admin"
}

export function canAccessStudentDashboard(user?: User | null): boolean {
  return user?.role === "student" || user?.role === "parent"
}

export function canAccessTutorDashboard(user?: User | null): boolean {
  return user?.role === "tutor"
}

export function canApproveTutor(user?: User | null): boolean {
  return canAccessAdmin(user)
}

export function canRejectTutor(user?: User | null): boolean {
  return canAccessAdmin(user)
}

export function canAssignTutor(user?: User | null): boolean {
  return canAccessAdmin(user)
}

export function canUpdateLearningRequestStatus(user?: User | null): boolean {
  return canAccessAdmin(user)
}

export function canAcceptBooking(
  user: User | null | undefined,
  booking: TrialBooking,
  tutorProfile: Tutor | null | undefined
): boolean {
  return user?.role === "tutor" && !!tutorProfile && tutorProfile.userId === user.id && booking.tutorId === tutorProfile.id
}

export function canRejectBooking(
  user: User | null | undefined,
  booking: TrialBooking,
  tutorProfile: Tutor | null | undefined
): boolean {
  return canAcceptBooking(user, booking, tutorProfile)
}

export function canViewStudentRequest(
  user: User | null | undefined,
  request: LearningRequest
): boolean {
  if (user?.role === "admin") return true
  if (user?.role === "student" || user?.role === "parent") {
    return request.userId === user.id
  }
  return false
}

export function canFavoriteTutor(user?: User | null): boolean {
  return user?.role === "student" || user?.role === "parent"
}

export function canCreateReview(
  user: User | null | undefined,
  session: ClassSession | null | undefined
): boolean {
  return (
    (user?.role === "student" || user?.role === "parent") &&
    !!session &&
    session.studentId === user.id &&
    session.status === "completed"
  )
}

export function canSendMessage(
  user: User | null | undefined,
  conversation: Conversation | null | undefined
): boolean {
  return !!user && !!conversation && conversation.participantIds.includes(user.id)
}

export function assertPermission(allowed: boolean): void {
  if (!allowed) {
    throw new Error(PERMISSION_ERROR)
  }
}
