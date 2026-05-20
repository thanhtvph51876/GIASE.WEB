const actionLabels: Record<string, string> = {
  "admin.approve_tutor": "Duyệt hồ sơ gia sư",
  "admin.reject_tutor": "Từ chối hồ sơ gia sư",
  "admin.assign_tutor": "Gán gia sư cho yêu cầu",
  "admin.update_learning_request_status": "Cập nhật trạng thái yêu cầu",
  "admin.activate_learning_request": "Chuyển thành lớp chính thức",
  "admin.cancel_trial": "Hủy sau học thử",
  "admin.rematch_trial": "Yêu cầu ghép gia sư khác",
  "student.create_learning_request": "Tạo yêu cầu học",
  "student.create_trial_booking": "Đặt lịch học thử",
  "student.create_review": "Gửi đánh giá gia sư",
  "tutor.accept_trial_booking": "Chấp nhận học thử",
  "tutor.reject_trial_booking": "Từ chối học thử",
  "session.complete": "Hoàn thành buổi học",
}

const entityLabels: Record<string, string> = {
  class: "Lớp học",
  classSession: "Buổi học",
  learningRequest: "Yêu cầu học",
  review: "Đánh giá",
  trialBooking: "Học thử",
  tutor: "Gia sư",
  user: "Người dùng",
}

const roleLabels: Record<string, string> = {
  admin: "Quản trị",
  parent: "Phụ huynh",
  student: "Học sinh",
  tutor: "Gia sư",
}

export function getAuditActionLabel(action: string): string {
  return actionLabels[action] || action
}

export function getAuditEntityLabel(entityType: string): string {
  return entityLabels[entityType] || entityType
}

export function getRoleLabel(role: string): string {
  return roleLabels[role] || role
}
