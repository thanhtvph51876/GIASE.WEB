import type { LearningGoal, Subject, TeachingMode } from "@/types"

export const GRADES = [
  "Lớp 1",
  "Lớp 2",
  "Lớp 3",
  "Lớp 4",
  "Lớp 5",
  "Lớp 6",
  "Lớp 7",
  "Lớp 8",
  "Lớp 9",
  "Lớp 10",
  "Lớp 11",
  "Lớp 12",
  "Luyện thi THPT",
  "IELTS",
  "Đại học",
]

export const SUBJECTS = [
  "Toán",
  "Văn",
  "Tiếng Anh",
  "Vật Lý",
  "Hóa Học",
  "Sinh Học",
  "Tin Học",
  "Lịch Sử",
  "Địa Lý",
  "IELTS",
  "TOEIC",
  "Lập trình",
]

export const SUBJECT_OPTIONS: Subject[] = [
  {
    id: "subject-001",
    name: "Toán",
    icon: "calculator",
    description: "Toán học từ lớp 1 đến 12, luyện thi THPT",
    tutorCount: 45,
    category: "Khoa học tự nhiên",
  },
  {
    id: "subject-002",
    name: "Văn",
    icon: "book-open",
    description: "Ngữ văn, làm văn, nghị luận",
    tutorCount: 32,
    category: "Khoa học xã hội",
  },
  {
    id: "subject-003",
    name: "Tiếng Anh",
    icon: "languages",
    description: "Tiếng Anh giao tiếp, học thuật, IELTS",
    tutorCount: 58,
    category: "Ngoại ngữ",
  },
  {
    id: "subject-004",
    name: "Vật Lý",
    icon: "atom",
    description: "Vật lý cơ bản và nâng cao",
    tutorCount: 28,
    category: "Khoa học tự nhiên",
  },
  {
    id: "subject-005",
    name: "Hóa Học",
    icon: "flask-conical",
    description: "Hóa học vô cơ, hữu cơ",
    tutorCount: 25,
    category: "Khoa học tự nhiên",
  },
  {
    id: "subject-006",
    name: "Sinh Học",
    icon: "leaf",
    description: "Sinh học cơ bản và nâng cao",
    tutorCount: 18,
    category: "Khoa học tự nhiên",
  },
  {
    id: "subject-007",
    name: "Tin Học",
    icon: "laptop",
    description: "Lập trình, tin học văn phòng",
    tutorCount: 22,
    category: "Công nghệ",
  },
  {
    id: "subject-008",
    name: "IELTS",
    icon: "graduation-cap",
    description: "Luyện thi IELTS từ 5.0 - 8.0+",
    tutorCount: 35,
    category: "Ngoại ngữ",
  },
  {
    id: "subject-009",
    name: "Lịch Sử",
    icon: "landmark",
    description: "Lịch sử Việt Nam và thế giới",
    tutorCount: 15,
    category: "Khoa học xã hội",
  },
  {
    id: "subject-010",
    name: "Địa Lý",
    icon: "globe",
    description: "Địa lý tự nhiên và kinh tế",
    tutorCount: 12,
    category: "Khoa học xã hội",
  },
]

export const LOCATIONS_HCM = [
  "Quận 1",
  "Quận 2",
  "Quận 3",
  "Quận 4",
  "Quận 5",
  "Quận 6",
  "Quận 7",
  "Quận 8",
  "Quận 9",
  "Quận 10",
  "Quận 11",
  "Quận 12",
  "Quận Bình Thạnh",
  "Quận Gò Vấp",
  "Quận Phú Nhuận",
  "Quận Tân Bình",
  "Quận Tân Phú",
  "Quận Bình Tân",
  "Thủ Đức",
  "Nhà Bè",
  "Hóc Môn",
  "Củ Chi",
  "Cần Giờ",
]

export const LOCATIONS_HN = [
  "Ba Đình",
  "Hoàn Kiếm",
  "Đống Đa",
  "Hai Bà Trưng",
  "Hoàng Mai",
  "Thanh Xuân",
  "Long Biên",
  "Cầu Giấy",
  "Tây Hồ",
  "Hà Đông",
  "Nam Từ Liêm",
  "Bắc Từ Liêm",
  "Gia Lâm",
  "Đông Anh",
  "Sóc Sơn",
]

export const TEACHING_MODES: Array<{ value: TeachingMode; label: string }> = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline (Tại nhà)" },
  { value: "both", label: "Cả hai hình thức" },
]

export const LEARNING_GOALS: Array<{ value: LearningGoal; label: string }> = [
  { value: "improve_grades", label: "Cải thiện điểm số" },
  { value: "foundation", label: "Học lại từ đầu (mất gốc)" },
  { value: "exam_prep", label: "Ôn thi chuyển cấp" },
  { value: "thpt_exam", label: "Ôn thi THPT Quốc gia" },
  { value: "advanced", label: "Học nâng cao / Thi học sinh giỏi" },
]

export const DAYS_OF_WEEK = [
  { value: 0, label: "Chủ nhật" },
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
]

export const UNIVERSITIES = [
  "Đại học Sư phạm TP.HCM",
  "Đại học Sư phạm Hà Nội",
  "Đại học Khoa học Tự nhiên - ĐHQG TP.HCM",
  "Đại học Bách khoa TP.HCM",
  "Đại học Kinh tế TP.HCM",
  "Đại học Ngoại thương",
  "Đại học Quốc gia Hà Nội",
  "Đại học Quốc gia TP.HCM",
  "Trường khác",
]

export const SITE_STATS = {
  totalTutors: 500,
  totalStudents: 2500,
  completedSessions: 15000,
  satisfactionRate: 98,
  verifiedTutors: 450,
  averageRating: 4.8,
}
