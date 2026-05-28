import type {
  AuditLog,
  Class,
  ClassSession,
  Conversation,
  LearningRequest,
  Message,
  Notification,
  Payment,
  Payout,
  Review,
  Tutor,
  TutorDocument,
  TutorEarning,
  TrialBooking,
  User,
  UserVerification,
} from "@/types"

type Raw = Record<string, unknown>

function toRaw(value: unknown): Raw {
  return value && typeof value === "object" ? (value as Raw) : {}
}

function text(raw: Raw, key: string, fallback = ""): string {
  const value = raw[key]
  return value === undefined || value === null || value === "" ? fallback : String(value)
}

function optionalText(raw: Raw, key: string): string | undefined {
  const value = raw[key]
  return value === undefined || value === null || value === "" ? undefined : String(value)
}

function numberValue(raw: Raw, key: string, fallback = 0): number {
  const value = raw[key]
  return typeof value === "number" ? value : value === undefined || value === null ? fallback : Number(value)
}

function booleanValue(raw: Raw, key: string, fallback = false): boolean {
  const value = raw[key]
  return typeof value === "boolean" ? value : value === undefined || value === null ? fallback : value === "true"
}

function stringArray(raw: Raw, key: string): string[] {
  const value = raw[key]
  return Array.isArray(value) ? value.map(String) : []
}

function rawArray(raw: Raw, key: string): Raw[] {
  const value = raw[key]
  return Array.isArray(value) ? (value.filter((item) => item && typeof item === "object") as Raw[]) : []
}

export function mapUser(value: unknown): User {
  const raw = toRaw(value)
  return {
    id: text(raw, "id"),
    fullName: text(raw, "fullName", text(raw, "name")),
    email: text(raw, "email"),
    phone: text(raw, "phone"),
    role: text(raw, "role") as User["role"],
    avatar: optionalText(raw, "avatar") || optionalText(raw, "avatarUrl"),
    status: text(raw, "status") === "suspended" ? "inactive" : (text(raw, "status") as User["status"]),
    createdAt: text(raw, "createdAt"),
  }
}

export function mapTutor(value: unknown): Tutor {
  const raw = toRaw(value)
  const status = text(raw, "status", text(raw, "approvalStatus")) as Tutor["approvalStatus"]
  return {
    id: text(raw, "id"),
    userId: text(raw, "userId"),
    status,
    fullName: text(raw, "fullName", text(raw, "name")),
    avatar: optionalText(raw, "avatar") || optionalText(raw, "avatarUrl"),
    gender: text(raw, "gender", "other") as Tutor["gender"],
    university: text(raw, "university"),
    faculty: text(raw, "faculty", text(raw, "education")),
    major: text(raw, "major"),
    studentCode: text(raw, "studentCode"),
    subjects: stringArray(raw, "subjects"),
    grades: stringArray(raw, "grades"),
    experienceYears: numberValue(raw, "experienceYears"),
    teachingModes: text(raw, "teachingModes", text(raw, "learningMode")) as Tutor["teachingModes"],
    locations: stringArray(raw, "locations"),
    pricePerHour: numberValue(raw, "pricePerHour", numberValue(raw, "hourlyRateMin", numberValue(raw, "hourlyRateMax"))),
    rating: numberValue(raw, "rating", numberValue(raw, "ratingAvg")),
    reviewCount: numberValue(raw, "reviewCount", numberValue(raw, "ratingCount")),
    verified: booleanValue(raw, "verified", status === "approved"),
    approvalStatus: status,
    documents: rawArray(raw, "documents").map(mapTutorDocument),
    updateRequestNote: optionalText(raw, "updateRequestNote"),
    suspensionReason: optionalText(raw, "suspensionReason"),
    bio: text(raw, "bio"),
    teachingMethod: text(raw, "teachingMethod"),
    achievements: stringArray(raw, "achievements"),
    certificates: stringArray(raw, "certificates"),
    availableSlots: Array.isArray(raw.availableSlots) ? (raw.availableSlots as Tutor["availableSlots"]) : [],
    totalStudents: numberValue(raw, "totalStudents"),
    totalClasses: numberValue(raw, "totalClasses"),
    responseRate: numberValue(raw, "responseRate"),
    rejectReason: optionalText(raw, "rejectReason") || optionalText(raw, "statusReason"),
    createdAt: text(raw, "createdAt"),
  }
}

export function mapTutorDocument(value: unknown): TutorDocument {
  const raw = toRaw(value)
  return {
    id: text(raw, "id"),
    tutorId: text(raw, "tutorId"),
    name: text(raw, "name", text(raw, "documentType", text(raw, "type", "Giấy tờ"))),
    type: text(raw, "type", text(raw, "documentType", "other")) as TutorDocument["type"],
    fileName: text(raw, "fileName"),
    fileSize: numberValue(raw, "fileSize"),
    mimeType: text(raw, "mimeType", "application/octet-stream"),
    status: text(raw, "status") as TutorDocument["status"],
    note: optionalText(raw, "note") || optionalText(raw, "reviewNote"),
    uploadedAt: text(raw, "uploadedAt", text(raw, "createdAt")),
    reviewedAt: optionalText(raw, "reviewedAt"),
    reviewedBy: optionalText(raw, "reviewedBy"),
  }
}

export function mapLearningRequest(value: unknown): LearningRequest {
  const raw = toRaw(value)
  return {
    id: text(raw, "id"),
    requestCode: text(raw, "requestCode", text(raw, "id")),
    studentName: text(raw, "studentName"),
    parentName: optionalText(raw, "parentName"),
    phone: text(raw, "phone"),
    email: optionalText(raw, "email"),
    grade: text(raw, "grade", text(raw, "studentGrade")),
    subject: text(raw, "subject"),
    goal: text(raw, "learningGoal", text(raw, "goal")) as LearningRequest["goal"],
    teachingMode: text(raw, "teachingMode", text(raw, "learningMode")) as LearningRequest["teachingMode"],
    location: optionalText(raw, "location") || optionalText(raw, "province"),
    province: optionalText(raw, "province"),
    district: optionalText(raw, "district"),
    expectedFee: numberValue(raw, "expectedFee", numberValue(raw, "budgetMax")) || undefined,
    budgetMin: numberValue(raw, "budgetMin") || undefined,
    budgetMax: numberValue(raw, "budgetMax") || undefined,
    preferredSchedule: optionalText(raw, "preferredSchedule"),
    note: optionalText(raw, "note"),
    status: text(raw, "status") as LearningRequest["status"],
    assignedTutorId: optionalText(raw, "assignedTutorId") || null,
    userId: optionalText(raw, "userId") || optionalText(raw, "requesterId"),
    createdAt: text(raw, "createdAt"),
    updatedAt: optionalText(raw, "updatedAt"),
  }
}

export function mapVerification(value: unknown): UserVerification {
  const raw = toRaw(value)
  return {
    id: text(raw, "id"),
    userId: text(raw, "userId"),
    userEmail: optionalText(raw, "userEmail"),
    userFullName: optionalText(raw, "userFullName"),
    verificationType: text(raw, "verificationType", "student_card") as UserVerification["verificationType"],
    schoolName: optionalText(raw, "schoolName"),
    studentCode: optionalText(raw, "studentCode"),
    fullNameInput: optionalText(raw, "fullNameInput"),
    schoolEmail: optionalText(raw, "schoolEmail"),
    cardFileId: optionalText(raw, "cardFileId"),
    selfieFileId: optionalText(raw, "selfieFileId"),
    documentFileId: optionalText(raw, "documentFileId"),
    cardFileUrl: optionalText(raw, "cardFileUrl"),
    selfieFileUrl: optionalText(raw, "selfieFileUrl"),
    documentFileUrl: optionalText(raw, "documentFileUrl"),
    ocrFullName: optionalText(raw, "ocrFullName"),
    ocrStudentCode: optionalText(raw, "ocrStudentCode"),
    ocrSchool: optionalText(raw, "ocrSchool"),
    ocrConfidence: numberValue(raw, "ocrConfidence") || undefined,
    emailVerified: booleanValue(raw, "emailVerified"),
    duplicateFile: booleanValue(raw, "duplicateFile"),
    riskScore: numberValue(raw, "riskScore"),
    status: text(raw, "status", "draft") as UserVerification["status"],
    rejectReason: optionalText(raw, "rejectReason"),
    reviewedBy: optionalText(raw, "reviewedBy"),
    reviewedAt: optionalText(raw, "reviewedAt"),
    agreementSigned: booleanValue(raw, "agreementSigned"),
    createdAt: text(raw, "createdAt"),
    updatedAt: optionalText(raw, "updatedAt"),
  }
}

export function mapBooking(value: unknown) {
  const raw = toRaw(value)
  return {
    ...raw,
    teachingMode: raw.teachingMode || raw.learningMode,
    preferredTime: raw.preferredTime || raw.scheduledStart || raw.scheduledStartTime,
  } as unknown as TrialBooking
}

export const mapClass = (raw: unknown): Class => raw as Class
export const mapSession = (raw: unknown): ClassSession => raw as ClassSession
export const mapReview = (raw: unknown): Review => raw as Review
export const mapNotification = (raw: unknown): Notification => raw as Notification
export const mapMessage = (raw: unknown): Message => raw as Message
export const mapConversation = (raw: unknown): Conversation => raw as Conversation
export const mapPayment = (raw: unknown): Payment => raw as Payment

export function mapTutorEarning(value: unknown): TutorEarning {
  const raw = toRaw(value)
  const netAmount = numberValue(raw, "netAmount", numberValue(raw, "amount"))
  return {
    id: text(raw, "id"),
    tutorId: text(raw, "tutorId"),
    sessionId: optionalText(raw, "sessionId"),
    paymentId: optionalText(raw, "paymentId"),
    grossAmount: numberValue(raw, "grossAmount", netAmount),
    platformFee: numberValue(raw, "platformFee"),
    netAmount,
    amount: netAmount,
    status: text(raw, "status") as TutorEarning["status"],
    createdAt: text(raw, "createdAt"),
    updatedAt: optionalText(raw, "updatedAt"),
  }
}

export function mapPayout(value: unknown): Payout {
  const raw = toRaw(value)
  return {
    id: text(raw, "id"),
    tutorId: text(raw, "tutorId"),
    tutorName: text(raw, "tutorName"),
    amount: numberValue(raw, "amount"),
    status: text(raw, "status") as Payout["status"],
    bankName: optionalText(raw, "bankName"),
    bankAccount: optionalText(raw, "bankAccount"),
    reason: optionalText(raw, "reason") || optionalText(raw, "adminNote"),
    requestedAt: text(raw, "requestedAt", text(raw, "createdAt")),
    processedAt: optionalText(raw, "processedAt"),
    createdAt: text(raw, "createdAt", text(raw, "requestedAt")),
  }
}
export const mapAuditLog = (raw: unknown): AuditLog => raw as AuditLog

export function mapList<T>(items: unknown[] | undefined, mapper: (item: unknown) => T): T[] {
  return (items || []).map(mapper)
}
