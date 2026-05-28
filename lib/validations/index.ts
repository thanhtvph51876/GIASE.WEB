import { z } from "zod"
import type { LearningGoal, TeachingMode } from "@/types"

// ============================================
// VALIDATION SCHEMAS
// Centralized zod schemas for form validation
// ============================================

// Common validations
const phoneRegex = /^(0|\+84)[0-9]{9}$/
const emailSchema = z.string().email("Email không hợp lệ")
const phoneSchema = z.string().regex(phoneRegex, "Số điện thoại không hợp lệ")
const requiredString = z.string().min(1, "Trường này là bắt buộc")
const dynamicTeachingModeSchema = z.custom<TeachingMode>(
  (value) => typeof value === "string" && value.trim().length > 0,
  "Vui lòng chọn hình thức học"
)
const dynamicLearningGoalSchema = z.custom<LearningGoal>(
  (value) => typeof value === "string" && value.trim().length > 0,
  "Vui lòng nhập mục tiêu học tập"
)

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
})

export const registerSchema = z.object({
  fullName: requiredString.min(2, "Họ tên tối thiểu 2 ký tự"),
  email: emailSchema,
  phone: phoneSchema,
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  role: z.enum(["student", "parent", "tutor"], {
    required_error: "Vui lòng chọn vai trò",
  }),
})

// ============================================
// STUDENT REGISTRATION SCHEMAS
// ============================================

export const studentStep1Schema = z.object({
  studentName: requiredString.min(2, "Họ tên tối thiểu 2 ký tự"),
  parentName: z.string().optional(),
  phone: phoneSchema,
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  grade: requiredString,
})

export const studentStep2Schema = z.object({
  subject: requiredString,
  goal: dynamicLearningGoalSchema,
  teachingMode: dynamicTeachingModeSchema,
  location: z.string().optional(),
  preferredSchedule: z.string().optional(),
  expectedFee: z.number().positive("Học phí phải là số dương").optional(),
  note: z.string().optional(),
})

export const studentRegistrationSchema = studentStep1Schema.merge(studentStep2Schema)

// ============================================
// TUTOR REGISTRATION SCHEMAS
// ============================================

export const tutorPersonalSchema = z.object({
  fullName: requiredString.min(2, "Họ tên tối thiểu 2 ký tự"),
  email: emailSchema,
  phone: phoneSchema,
  gender: z.enum(["male", "female", "other"], {
    required_error: "Vui lòng chọn giới tính",
  }),
  avatar: z.string().optional(),
})

export const tutorAcademicSchema = z.object({
  studentCode: requiredString.min(4, "Mã sinh viên tối thiểu 4 ký tự"),
  university: requiredString,
  faculty: requiredString,
  major: requiredString,
  yearOfStudy: z.number().min(1).max(6).optional(),
})

export const tutorTeachingSchema = z.object({
  subjects: z.array(z.string()).min(1, "Chọn ít nhất 1 môn dạy"),
  grades: z.array(z.string()).min(1, "Chọn ít nhất 1 lớp dạy"),
  experienceYears: z.number().min(0, "Số năm kinh nghiệm không hợp lệ"),
  pricePerHour: z.number().positive("Học phí phải là số dương"),
  teachingModes: dynamicTeachingModeSchema,
  locations: z.array(z.string()).optional(),
  availableSlots: z
    .array(
      z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .optional(),
})

export const tutorProfileSchema = z.object({
  achievements: z.array(z.string()).optional(),
  certificates: z.array(z.string()).optional(),
  bio: z.string().min(50, "Giới thiệu bản thân tối thiểu 50 ký tự"),
  teachingMethod: z.string().min(30, "Phương pháp dạy tối thiểu 30 ký tự"),
  studentIdImage: z.string().optional(),
})

export const tutorRegistrationSchema = tutorPersonalSchema
  .merge(tutorAcademicSchema)
  .merge(tutorTeachingSchema)
  .merge(tutorProfileSchema)

// ============================================
// TRIAL BOOKING SCHEMA
// ============================================

export const trialBookingSchema = z.object({
  studentName: requiredString.min(2, "Họ tên tối thiểu 2 ký tự"),
  parentName: z.string().optional(),
  phone: phoneSchema,
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  subject: requiredString,
  grade: requiredString,
  preferredTime: requiredString,
  message: z.string().optional(),
})

// ============================================
// REVIEW SCHEMA
// ============================================

export const reviewSchema = z.object({
  rating: z.number().min(1, "Vui lòng chọn số sao").max(5),
  content: z.string().min(10, "Nội dung đánh giá tối thiểu 10 ký tự"),
})

// ============================================
// PROFILE UPDATE SCHEMA
// ============================================

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự").optional(),
  phone: phoneSchema.optional(),
  avatar: z.string().optional(),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type StudentStep1Values = z.infer<typeof studentStep1Schema>
export type StudentStep2Values = z.infer<typeof studentStep2Schema>
export type StudentRegistrationValues = z.infer<typeof studentRegistrationSchema>
export type TutorRegistrationValues = z.infer<typeof tutorRegistrationSchema>
export type TrialBookingValues = z.infer<typeof trialBookingSchema>
export type ReviewFormValues = z.infer<typeof reviewSchema>
export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>
