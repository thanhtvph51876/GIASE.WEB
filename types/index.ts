// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = "guest" | "student" | "parent" | "tutor" | "admin"
export type UserStatus = "active" | "inactive" | "pending"

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  avatar?: string
  status: UserStatus
  createdAt: string
}

export interface StudentProfile {
  id: string
  userId: string
  studentName: string
  grade: string
  school?: string
  learningGoals: string[]
  favoriteTutorIds: string[]
  createdAt: string
  updatedAt?: string
}

export interface ParentProfile {
  id: string
  userId: string
  parentName: string
  studentIds: string[]
  relationship: string
  preferredContactTime?: string
  createdAt: string
  updatedAt?: string
}

// ============================================
// TUTOR TYPES
// ============================================

export type TeachingMode = "online" | "offline" | "both"
export type TutorProfileStatus =
  | "draft"
  | "pending"
  | "need_update"
  | "approved"
  | "rejected"
  | "suspended"
  | "inactive"
export type ApprovalStatus = TutorProfileStatus
export type Gender = "male" | "female" | "other"
export type TutorDocumentStatus = "pending" | "approved" | "rejected"

export interface TutorDocument {
  id: string
  tutorId: string
  name: string
  type: "identity" | "student_card" | "certificate" | "degree" | "other"
  fileName: string
  fileSize: number
  mimeType: string
  status: TutorDocumentStatus
  note?: string
  uploadedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export interface AvailableSlot {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:mm
  endTime: string // HH:mm
}

export interface Tutor {
  id: string
  userId: string
  status?: TutorProfileStatus
  fullName: string
  avatar?: string
  gender: Gender
  university: string
  faculty: string
  major: string
  studentCode: string
  subjects: string[]
  grades: string[]
  experienceYears: number
  teachingModes: TeachingMode
  locations: string[]
  pricePerHour: number
  rating: number
  reviewCount: number
  verified: boolean
  approvalStatus: ApprovalStatus
  documents?: TutorDocument[]
  updateRequestNote?: string
  suspensionReason?: string
  bio: string
  teachingMethod: string
  achievements?: string[]
  certificates?: string[]
  availableSlots: AvailableSlot[]
  totalStudents: number
  totalClasses: number
  responseRate: number
  rejectReason?: string
  createdAt: string
}

// ============================================
// SUBJECT TYPES
// ============================================

export interface Subject {
  id: string
  name: string
  icon: string
  description: string
  tutorCount: number
  category: string
}

export interface GradeLevel {
  id: string
  name: string
  group: "primary" | "secondary" | "high_school" | "exam" | "university"
}

export interface Location {
  id: string
  name: string
  city: string
  district?: string
}

// ============================================
// LEARNING REQUEST TYPES
// ============================================

export type LearningRequestStatus =
  | "new"
  | "consulting"
  | "matched"
  | "trial_scheduled"
  | "trial_completed"
  | "active"
  | "rematch"
  | "completed"
  | "cancelled"

export type LearningGoal =
  | "improve_grades"
  | "foundation"
  | "exam_prep"
  | "thpt_exam"
  | "advanced"

export interface LearningRequest {
  id: string
  requestCode: string
  studentName: string
  parentName?: string
  phone: string
  email?: string
  grade: string
  subject: string
  goal: LearningGoal
  teachingMode: TeachingMode
  location?: string
  province?: string
  district?: string
  expectedFee?: number
  budgetMin?: number
  budgetMax?: number
  preferredSchedule?: string
  note?: string
  status: LearningRequestStatus
  assignedTutorId?: string | null
  userId?: string // If logged in
  createdAt: string
  updatedAt?: string
}

// ============================================
// TRIAL BOOKING TYPES
// ============================================

export type BookingStatus = "pending" | "accepted" | "rejected" | "completed"
  | "assigned"
  | "scheduled"
  | "no_show_student"
  | "no_show_tutor"
  | "converted"
  | "cancelled"
  | "expired"

export interface TrialBooking {
  id: string
  tutorId: string
  studentId?: string
  studentName: string
  parentName?: string
  phone: string
  email?: string
  subject: string
  grade: string
  preferredTime: string
  message?: string
  status: BookingStatus
  rejectReason?: string
  schedule?: {
    date: string
    startTime: string
    endTime: string
    mode: TeachingMode
    location?: string
  }
  resultNote?: string
  userId?: string
  learningRequestId?: string
  classId?: string
  createdAt: string
  updatedAt?: string
}

// ============================================
// CLASS TYPES
// ============================================

export type ClassStatus = "trial" | "active" | "paused" | "completed" | "cancelled"

export interface Class {
  id: string
  studentId: string
  studentName: string
  parentName?: string
  tutorId: string
  tutorName: string
  learningRequestId?: string
  subject: string
  grade: string
  mode: TeachingMode
  location?: string
  feePerSession: number
  scheduleText: string
  startDate: string
  endDate?: string
  status: ClassStatus
  totalSessions: number
  completedSessions: number
  note?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// CLASS SESSION TYPES
// ============================================

export type SessionStatus =
  | "scheduled"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "student_absent"
  | "tutor_absent"

export interface ClassSession {
  id: string
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
  status: SessionStatus
  isTrial?: boolean
  note?: string
  createdAt: string
  updatedAt?: string
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string
  tutorId: string
  studentId?: string
  studentName: string
  avatar?: string
  sessionId?: string
  classId?: string
  rating: number
  content: string
  createdAt: string
}

// ============================================
// MESSAGE TYPES
// ============================================

export interface Message {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  read: boolean
}

export interface Conversation {
  id: string
  participantIds: string[]
  participantNames: string[]
  lastMessage?: string
  lastMessageAt?: string
  updatedAt?: string
  unreadCount: number
}

// ============================================
// PAYMENT TYPES
// ============================================

export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "completed"
  | "failed"
  | "expired"
  | "refunded"
  | "partially_refunded"
  | "cancelled"

export interface Payment {
  id: string
  tutorId?: string
  studentId: string
  userId?: string
  classId?: string
  sessionId?: string
  amount: number
  currency?: string
  status: PaymentStatus
  description?: string
  paymentMethod?: string
  gateway?: string
  checkoutUrl?: string
  qrCodeUrl?: string
  expiredAt?: string
  paidAt?: string
  createdAt: string
  updatedAt?: string
}

export type TutorEarningStatus = "pending" | "available" | "payout_pending" | "paid" | "cancelled"

export interface TutorEarning {
  id: string
  tutorId: string
  sessionId?: string
  paymentId?: string
  grossAmount: number
  platformFee: number
  netAmount: number
  amount: number
  status: TutorEarningStatus
  createdAt: string
  updatedAt?: string
}

export type PayoutStatus = "available" | "pending" | "processing" | "approved" | "paid" | "completed" | "rejected"

export interface Payout {
  id: string
  tutorId: string
  tutorName: string
  amount: number
  status: PayoutStatus
  bankName?: string
  bankAccount?: string
  reason?: string
  requestedAt: string
  processedAt?: string
  createdAt: string
}

// ============================================
// VERIFICATION TYPES
// ============================================

export type VerificationType = "student_card" | "tutor_identity" | "tutor_certificate"
export type VerificationStatus = "draft" | "pending_review" | "approved" | "rejected" | "need_more_info"

export interface UserVerification {
  id: string
  userId: string
  userEmail?: string
  userFullName?: string
  verificationType: VerificationType
  schoolName?: string
  studentCode?: string
  fullNameInput?: string
  schoolEmail?: string
  cardFileId?: string
  selfieFileId?: string
  documentFileId?: string
  cardFileUrl?: string
  selfieFileUrl?: string
  documentFileUrl?: string
  ocrFullName?: string
  ocrStudentCode?: string
  ocrSchool?: string
  ocrConfidence?: number
  emailVerified: boolean
  duplicateFile: boolean
  riskScore: number
  status: VerificationStatus
  rejectReason?: string
  reviewedBy?: string
  reviewedAt?: string
  agreementSigned?: boolean
  createdAt: string
  updatedAt?: string
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = "info" | "success" | "warning" | "error"

export interface Notification {
  id: string
  userId: string
  targetRole?: UserRole
  type: NotificationType
  title: string
  content: string
  message?: string
  read: boolean
  status?: "unread" | "read"
  actionUrl?: string
  link?: string
  createdAt: string
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export interface AuditLog {
  id: string
  actorId: string
  actorName: string
  actorRole: UserRole
  action: string
  entityType: string
  entityId: string
  description?: string
  entityName?: string
  before?: unknown
  after?: unknown
  metadata?: Record<string, unknown>
  note?: string
  createdAt: string
}

export interface SystemSetting {
  id: string
  bookingEnabled: boolean
  tutorRegistrationEnabled: boolean
  autoMatchingEnabled: boolean
  commissionRate: number
  trialLessonPolicy: string
  maintenanceMode: boolean
  notificationSettings: {
    email: boolean
    inApp: boolean
    paymentAlerts: boolean
    reviewAlerts: boolean
  }
  updatedAt: string
}

export type ContactRequestStatus = "new" | "contacted" | "resolved" | "ignored"

export interface ContactRequest {
  id: string
  fullName: string
  email: string
  phone?: string
  message: string
  status: ContactRequestStatus
  createdAt: string
  updatedAt?: string
}

// ============================================
// FILTER & SORT TYPES
// ============================================

export interface TutorFilters {
  keyword?: string
  subject?: string
  grade?: string
  location?: string
  teachingMode?: TeachingMode
  minPrice?: number
  maxPrice?: number
  minRating?: number
  verified?: boolean
  gender?: Gender
}

export type TutorSortBy =
  | "best_match"
  | "rating_desc"
  | "price_asc"
  | "price_desc"
  | "experience_desc"
  | "newest"

// ============================================
// DASHBOARD STATS TYPES
// ============================================

export interface AdminStats {
  totalUsers?: number
  totalTutors: number
  pendingTutors: number
  totalStudents: number
  newRequests: number
  activeClasses: number
  trialClasses?: number
  completedClasses?: number
  cancelledClasses?: number
  pendingAssignments?: number
  pendingBookings?: number
  upcomingTrialSessions?: number
  newReviews?: number
  totalRevenue: number
}

export interface TutorStats {
  currentStudents: number
  weeklyClasses: number
  monthlyIncome: number
  averageRating: number
  newRequests: number
}

export interface StudentStats {
  totalRequests: number
  activeTutors: number
  upcomingClasses: number
  savedTutors: number
}

// ============================================
// FORM TYPES
// ============================================

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  fullName: string
  email: string
  phone: string
  password: string
  role: "student" | "parent" | "tutor"
}

export interface TutorRegistrationFormData {
  // Personal
  fullName: string
  email: string
  phone: string
  gender: Gender
  avatar?: string
  // Academic
  studentCode: string
  university: string
  faculty: string
  major: string
  yearOfStudy?: number
  // Teaching
  subjects: string[]
  grades: string[]
  experienceYears: number
  pricePerHour: number
  teachingModes: TeachingMode
  locations: string[]
  availableSlots: AvailableSlot[]
  // Profile
  achievements?: string[]
  certificates?: string[]
  bio: string
  teachingMethod: string
  studentIdImage?: string
}

export interface StudentRegistrationFormData {
  // Step 1
  studentName: string
  parentName?: string
  phone: string
  email?: string
  grade: string
  // Step 2
  subject: string
  goal: LearningGoal
  teachingMode: TeachingMode
  location?: string
  preferredSchedule?: string
  expectedFee?: number
  note?: string
}

export interface TrialBookingFormData {
  studentName: string
  parentName?: string
  phone: string
  email?: string
  subject: string
  grade: string
  preferredTime: string
  message?: string
}
