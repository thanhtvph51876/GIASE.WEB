// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole =
  | "guest"
  | "student"
  | "parent"
  | "tutor"
  | "admin"
  | "finance_admin"
  | "tutor_admin"
  | "support_admin"
  | "verification_admin"
  | "system_admin"
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

export type TeachingMode = string
export type TutorProfileStatus =
  | "draft"
  | "submitted"
  | "pending"
  | "pending_verification"
  | "need_update"
  | "needs_more_documents"
  | "verified"
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

export type TutorApprovalProfileStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING_VERIFICATION"
  | "NEEDS_MORE_DOCUMENTS"
  | "VERIFIED"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED"

export type TutorApprovalDocumentStatus =
  | "MISSING"
  | "UPLOADED"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"

export interface TutorApprovalRiskBreakdownItem {
  reason: string
  score: number
}

export interface TutorApprovalEligibility {
  tutorId: string
  eligibleForApproval: boolean
  profileStatus: TutorApprovalProfileStatus
  rawProfileStatus?: TutorProfileStatus | string
  riskScore: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  riskBreakdown: TutorApprovalRiskBreakdownItem[]
  reasons: string[]
  checklist: {
    profileSubmitted: boolean
    identityApproved: boolean
    certificateApproved: boolean
    commitmentSigned: boolean
    commitmentVersionValid: boolean
    duplicateDocumentDetected: boolean
    riskScoreAcceptable: boolean
  }
  documents: Array<{
    type: "IDENTITY" | "CERTIFICATE"
    status: TutorApprovalDocumentStatus
    verificationId?: string
    uploadedAt?: string
    reviewedAt?: string
    duplicateDocumentDetected?: boolean
    riskScore?: number
    mimeType?: string
    fileSize?: number
    rejectReason?: string
  }>
  commitment: {
    signed: boolean
    versionValid: boolean
    requiredVersion: string
    version?: string
    signedAt?: string
    fullNameAtSigning?: string
  }
}

// ============================================
// SUBJECT TYPES
// ============================================

export interface Subject {
  id: string
  name: string
  icon?: string
  description?: string
  tutorCount?: number
  category?: string
  code?: string
  categoryId?: string
  categoryName?: string
  isActive?: boolean
}

export interface GradeLevel {
  id: string
  name: string
  group?: string
  code?: string
  educationLevelId?: string
  educationLevelName?: string
  isActive?: boolean
}

export interface Location {
  id: string
  code?: string
  name: string
  city?: string
  type?: string
  district?: string
  parentId?: string
  fullPath?: string
  isActive?: boolean
}

export interface MasterDataItem {
  id: string
  code?: string
  name: string
  description?: string
  isActive?: boolean
  sortOrder?: number
}

export interface SubjectCategory extends MasterDataItem {
  slug?: string
  parentId?: string
}

export interface EducationLevel extends MasterDataItem {}

export interface Language extends MasterDataItem {
  nativeName?: string
}

export interface Certificate extends MasterDataItem {
  languageId?: string
  languageCode?: string
  languageName?: string
}

export interface TeachingModeOption extends MasterDataItem {
  value: TeachingMode
  label: string
}

export interface CancellationPolicy extends MasterDataItem {
  appliesTo?: string
  freeCancelBeforeHours?: number
  penaltyType?: string
  penaltyValue?: number
}

// ============================================
// LEARNING REQUEST TYPES
// ============================================

export type LearningRequestStatus = string

export type LearningGoal = string

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

export interface TutorLead {
  id: string
  requestCode?: string
  studentProfileId?: string
  studentName?: string
  subject?: string
  subjectName?: string
  grade?: string
  gradeName?: string
  province?: string
  district?: string
  location?: string
  learningMode?: string
  teachingMode?: string
  budgetMin?: number
  budgetMax?: number
  preferredSchedule?: string
  status?: string
  proposalId?: string
  proposalStatus?: string
  createdAt?: string
}

export interface TutorProposal {
  id: string
  learningRequestId: string
  studentProfileId?: string
  requestCode?: string
  tutorId: string
  tutorName?: string
  tutorAvatar?: string
  studentName?: string
  subject?: string
  grade?: string
  proposedFee?: number
  feeUnit?: string
  teachingMode?: string
  availableSlots?: unknown
  proposedStartDate?: string
  teachingPlan?: string
  relevantExperience?: string
  expectedOutcome?: string
  messageToParent?: string
  trialSessionType?: string
  trialFee?: number
  status: string
  requestStatus?: string
  createdAt?: string
  updatedAt?: string
}

// ============================================
// TRIAL BOOKING TYPES
// ============================================

export type BookingStatus = string

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

export interface PublicTrialBookingRequestResult {
  id: string
  requestCode: string
  status: string
  tutorId: string
  tutorName?: string
  subject: string
  grade: string
  preferredSchedule?: string
  nextStep?: string
  createdAt?: string
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
  accountHolder?: string
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

export interface VerificationTerms {
  version: string
  effectiveDate: string
  title: string
  content: string
  contentHash: string
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

export interface AdminCrmNote {
  id: string
  entityType: string
  entityId: string
  content: string
  visibility?: string
  createdBy?: string
  createdByName?: string
  createdAt?: string
  updatedAt?: string
}

export interface AdminRiskFlag {
  id: string
  entityType: string
  entityId: string
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string
  reason: string
  note?: string
  active?: boolean
  source?: "manual" | "derived" | string
  createdBy?: string
  createdByName?: string
  resolvedBy?: string
  resolvedByName?: string
  resolvedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface AdminCrmComplaint {
  id: string
  bookingId?: string
  status: string
  title?: string
  description?: string
  reason?: string
  priority?: string
  riskLevel?: string
  slaDueAt?: string
  assignedAdminName?: string
  resolutionType?: string
  resolutionNote?: string
  closedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface AdminCrmRecord {
  id?: string
  status?: string
  title?: string
  type?: string
  amount?: number
  reason?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface AdminUserCrm {
  user: User
  profile?: Record<string, unknown> | null
  summary: Record<string, number | string | null>
  learningRequests: LearningRequest[]
  bookings: TrialBooking[]
  classes: Class[]
  sessions: ClassSession[]
  payments: Payment[]
  refunds: AdminCrmRecord[]
  complaints: AdminCrmComplaint[]
  reviews: Review[]
  conversations: AdminCrmRecord[]
  notes: AdminCrmNote[]
  riskFlags: AdminRiskFlag[]
  auditLogs: AuditLog[]
}

export interface AdminTutorCrm {
  user: User
  tutor: Tutor
  summary: Record<string, number | string | null>
  approvalEligibility?: TutorApprovalEligibility
  verifications: UserVerification[]
  learningRequests: LearningRequest[]
  bookings: TrialBooking[]
  classes: Class[]
  sessions: ClassSession[]
  payments: Payment[]
  refunds: AdminCrmRecord[]
  earnings: TutorEarning[]
  payouts: Payout[]
  reviews: Review[]
  complaints: AdminCrmComplaint[]
  conversations: AdminCrmRecord[]
  notes: AdminCrmNote[]
  riskFlags: AdminRiskFlag[]
  auditLogs: AuditLog[]
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
  assignedTo?: string | null
  assignedToName?: string | null
  handledById?: string | null
  handledBy?: string | null
  handledByEmail?: string | null
  handledAt?: string | null
  handlerNote?: string | null
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
