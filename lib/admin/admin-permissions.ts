import type { User, UserRole } from "@/types"

export type AdminRole = Extract<
  UserRole,
  "admin" | "system_admin" | "finance_admin" | "tutor_admin" | "support_admin" | "verification_admin"
>

export type AdminPermission =
  | "tutors.read"
  | "tutors.approve"
  | "tutors.reject"
  | "tutors.suspend"
  | "verifications.read"
  | "verifications.review"
  | "files.view_verification"
  | "learning_requests.read"
  | "learning_requests.manage"
  | "matching.read"
  | "matching.assign"
  | "matching.manage"
  | "bookings.read"
  | "bookings.manage"
  | "classes.read"
  | "classes.manage"
  | "sessions.read"
  | "sessions.manage"
  | "payments.read"
  | "payments.manage"
  | "payments.mark_paid"
  | "payments.mark_failed"
  | "payments.refund"
  | "payouts.read"
  | "payouts.approve"
  | "payouts.reject"
  | "reports.read"
  | "operations.read"
  | "users.read"
  | "users.manage"
  | "conversations.read"
  | "notifications.read"
  | "notifications.send"
  | "contact_requests.manage"
  | "reviews.read"
  | "reviews.manage"
  | "complaints.manage"
  | "audit.read"
  | "settings.read"
  | "settings.update"

export type AdminModuleKey =
  | "dashboard"
  | "operations"
  | "tutors"
  | "tutorApprovals"
  | "verifications"
  | "learningRequests"
  | "bookings"
  | "classes"
  | "sessions"
  | "payments"
  | "payouts"
  | "reports"
  | "auditLogs"
  | "students"
  | "parents"
  | "contacts"
  | "messages"
  | "notifications"
  | "reviews"
  | "settings"
  | "complaints"

export type AdminActionKey =
  | "tutor.approve"
  | "tutor.reject"
  | "tutor.requestUpdate"
  | "tutor.suspend"
  | "tutor.reactivate"
  | "verification.approve"
  | "verification.reject"
  | "verification.needMoreInfo"
  | "learningRequest.update"
  | "learningRequest.assign"
  | "learningRequest.rematch"
  | "learningRequest.cancel"
  | "booking.schedule"
  | "booking.complete"
  | "booking.convert"
  | "booking.cancel"
  | "session.complete"
  | "session.cancel"
  | "session.markAbsent"
  | "payment.markPaid"
  | "payment.markFailed"
  | "payment.refund"
  | "payout.approve"
  | "payout.reject"
  | "review.manage"
  | "notification.send"
  | "settings.update"

const ALL_ADMIN_PERMISSIONS: AdminPermission[] = [
  "tutors.read",
  "tutors.approve",
  "tutors.reject",
  "tutors.suspend",
  "verifications.read",
  "verifications.review",
  "files.view_verification",
  "learning_requests.read",
  "learning_requests.manage",
  "matching.read",
  "matching.assign",
  "matching.manage",
  "bookings.read",
  "bookings.manage",
  "classes.read",
  "classes.manage",
  "sessions.read",
  "sessions.manage",
  "payments.read",
  "payments.manage",
  "payments.mark_paid",
  "payments.mark_failed",
  "payments.refund",
  "payouts.read",
  "payouts.approve",
  "payouts.reject",
  "reports.read",
  "operations.read",
  "users.read",
  "users.manage",
  "conversations.read",
  "notifications.read",
  "notifications.send",
  "contact_requests.manage",
  "reviews.read",
  "reviews.manage",
  "complaints.manage",
  "audit.read",
  "settings.read",
  "settings.update",
]

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[] | "*"> = {
  admin: "*",
  system_admin: "*",
  finance_admin: [
    "payments.read",
    "payments.manage",
    "payments.mark_paid",
    "payments.mark_failed",
    "payments.refund",
    "payouts.read",
    "payouts.approve",
    "payouts.reject",
    "reports.read",
    "operations.read",
  ],
  tutor_admin: [
    "tutors.read",
    "tutors.approve",
    "tutors.reject",
    "tutors.suspend",
    "verifications.read",
    "verifications.review",
    "files.view_verification",
    "learning_requests.read",
    "learning_requests.manage",
    "matching.read",
    "matching.assign",
    "matching.manage",
    "bookings.read",
    "bookings.manage",
    "classes.read",
    "classes.manage",
    "sessions.read",
    "sessions.manage",
    "reports.read",
    "operations.read",
  ],
  support_admin: [
    "users.read",
    "learning_requests.read",
    "bookings.read",
    "classes.read",
    "sessions.read",
    "conversations.read",
    "notifications.read",
    "notifications.send",
    "contact_requests.manage",
    "reviews.read",
    "reports.read",
    "operations.read",
  ],
  verification_admin: [
    "verifications.read",
    "verifications.review",
    "files.view_verification",
    "reports.read",
    "operations.read",
  ],
}

export interface AdminModuleDefinition {
  key: AdminModuleKey
  label: string
  href: string
  requiredPermissions: AdminPermission[]
  managePermissions?: AdminPermission[]
}

export const ADMIN_MODULES: AdminModuleDefinition[] = [
  { key: "dashboard", label: "Tổng quan", href: "/admin", requiredPermissions: [] },
  { key: "operations", label: "Vận hành", href: "/admin/operations", requiredPermissions: ["operations.read"] },
  { key: "tutors", label: "Quản lý gia sư", href: "/admin/tutors", requiredPermissions: ["tutors.read"], managePermissions: ["tutors.approve", "tutors.reject", "tutors.suspend"] },
  { key: "tutorApprovals", label: "Duyệt hồ sơ", href: "/admin/tutor-approvals", requiredPermissions: ["tutors.read"], managePermissions: ["tutors.approve", "tutors.reject"] },
  { key: "verifications", label: "Xác thực giấy tờ", href: "/admin/verifications", requiredPermissions: ["verifications.read"], managePermissions: ["verifications.review"] },
  { key: "learningRequests", label: "Yêu cầu tìm gia sư", href: "/admin/learning-requests", requiredPermissions: ["learning_requests.read"], managePermissions: ["learning_requests.manage", "matching.manage"] },
  { key: "bookings", label: "Booking học thử", href: "/admin/bookings", requiredPermissions: ["bookings.read"], managePermissions: ["bookings.manage"] },
  { key: "classes", label: "Lớp học", href: "/admin/classes", requiredPermissions: ["classes.read"], managePermissions: ["classes.manage"] },
  { key: "sessions", label: "Buổi học", href: "/admin/sessions", requiredPermissions: ["sessions.read"], managePermissions: ["sessions.manage"] },
  { key: "payments", label: "Thanh toán", href: "/admin/payments", requiredPermissions: ["payments.read"], managePermissions: ["payments.manage", "payments.refund"] },
  { key: "payouts", label: "Payout", href: "/admin/payouts", requiredPermissions: ["payouts.read"], managePermissions: ["payouts.approve", "payouts.reject"] },
  { key: "reports", label: "Báo cáo", href: "/admin/reports", requiredPermissions: ["reports.read"] },
  { key: "auditLogs", label: "Nhật ký", href: "/admin/audit-logs", requiredPermissions: ["audit.read"] },
  { key: "students", label: "Học sinh", href: "/admin/students", requiredPermissions: ["users.read"], managePermissions: ["users.manage"] },
  { key: "parents", label: "Phụ huynh", href: "/admin/parents", requiredPermissions: ["users.read"], managePermissions: ["users.manage"] },
  { key: "contacts", label: "Liên hệ", href: "/admin/contacts", requiredPermissions: ["contact_requests.manage"] },
  { key: "messages", label: "Tin nhắn", href: "/admin/messages", requiredPermissions: ["conversations.read"] },
  { key: "notifications", label: "Thông báo", href: "/admin/notifications", requiredPermissions: ["notifications.read", "notifications.send"] },
  { key: "reviews", label: "Đánh giá", href: "/admin/reviews", requiredPermissions: ["reviews.read"], managePermissions: ["reviews.manage"] },
  { key: "settings", label: "Cài đặt", href: "/admin/settings", requiredPermissions: ["settings.read"], managePermissions: ["settings.update"] },
  { key: "complaints", label: "Khiếu nại", href: "/admin/complaints", requiredPermissions: ["operations.read"], managePermissions: ["complaints.manage"] },
]

export const ADMIN_ACTION_PERMISSIONS: Record<AdminActionKey, AdminPermission[]> = {
  "tutor.approve": ["tutors.approve"],
  "tutor.reject": ["tutors.reject"],
  "tutor.requestUpdate": ["tutors.reject"],
  "tutor.suspend": ["tutors.suspend"],
  "tutor.reactivate": ["tutors.suspend"],
  "verification.approve": ["verifications.review"],
  "verification.reject": ["verifications.review"],
  "verification.needMoreInfo": ["verifications.review"],
  "learningRequest.update": ["learning_requests.manage"],
  "learningRequest.assign": ["matching.manage"],
  "learningRequest.rematch": ["matching.manage"],
  "learningRequest.cancel": ["learning_requests.manage"],
  "booking.schedule": ["bookings.manage"],
  "booking.complete": ["bookings.manage"],
  "booking.convert": ["bookings.manage"],
  "booking.cancel": ["bookings.manage"],
  "session.complete": ["sessions.manage"],
  "session.cancel": ["sessions.manage"],
  "session.markAbsent": ["sessions.manage"],
  "payment.markPaid": ["payments.mark_paid"],
  "payment.markFailed": ["payments.mark_failed"],
  "payment.refund": ["payments.refund"],
  "payout.approve": ["payouts.approve"],
  "payout.reject": ["payouts.reject"],
  "review.manage": ["reviews.manage"],
  "notification.send": ["notifications.send"],
  "settings.update": ["settings.update"],
}

export function isGranularAdminRole(role?: UserRole | null): role is AdminRole {
  return !!role && role in ROLE_PERMISSIONS
}

export function getAdminPermissions(user?: User | null): AdminPermission[] {
  if (!isGranularAdminRole(user?.role)) return []
  const grants = ROLE_PERMISSIONS[user.role]
  return grants === "*" ? ALL_ADMIN_PERMISSIONS : grants
}

export function hasAdminPermission(user: User | null | undefined, permission: AdminPermission): boolean {
  if (!isGranularAdminRole(user?.role)) return false
  if (ROLE_PERMISSIONS[user.role] === "*") return true
  return getAdminPermissions(user).includes(permission)
}

export function hasAnyAdminPermission(user: User | null | undefined, permissions: AdminPermission[]): boolean {
  if (!permissions.length) return isGranularAdminRole(user?.role)
  return permissions.some((permission) => hasAdminPermission(user, permission))
}

export function hasAllAdminPermissions(user: User | null | undefined, permissions: AdminPermission[]): boolean {
  if (!permissions.length) return isGranularAdminRole(user?.role)
  return permissions.every((permission) => hasAdminPermission(user, permission))
}

export function canAccessAdminModule(user: User | null | undefined, moduleKey: AdminModuleKey): boolean {
  if (moduleKey === "dashboard") return isGranularAdminRole(user?.role) && getAdminPermissions(user).length > 0
  const module = ADMIN_MODULES.find((item) => item.key === moduleKey)
  return !!module && hasAnyAdminPermission(user, module.requiredPermissions)
}

export function canManageAdminModule(user: User | null | undefined, moduleKey: AdminModuleKey): boolean {
  const module = ADMIN_MODULES.find((item) => item.key === moduleKey)
  if (!module?.managePermissions?.length) return canAccessAdminModule(user, moduleKey)
  return hasAnyAdminPermission(user, module.managePermissions)
}

export function isAdminModuleReadOnly(user: User | null | undefined, moduleKey: AdminModuleKey): boolean {
  return canAccessAdminModule(user, moduleKey) && !canManageAdminModule(user, moduleKey)
}

export function canPerformAdminAction(user: User | null | undefined, actionKey: AdminActionKey): boolean {
  return hasAllAdminPermissions(user, ADMIN_ACTION_PERMISSIONS[actionKey] || [])
}

export function getAdminModuleForPath(pathname: string): AdminModuleKey | null {
  const normalized = pathname.split("?")[0].replace(/\/+$/, "") || "/admin"
  if (normalized === "/admin") return "dashboard"
  if (normalized === "/admin/requests" || normalized.startsWith("/admin/requests/")) return "learningRequests"

  const sorted = [...ADMIN_MODULES]
    .filter((module) => module.key !== "dashboard")
    .sort((a, b) => b.href.length - a.href.length)
  return sorted.find((module) => normalized === module.href || normalized.startsWith(`${module.href}/`))?.key || null
}
