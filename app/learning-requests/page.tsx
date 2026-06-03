import { pageMetadata } from "@/lib/config/site"
import LearningRequestsPageClient from "./page-client"

export const metadata = pageMetadata({
  title: "Yêu cầu tìm gia sư đang mở",
  description:
    "Xem các nhu cầu học đang mở đã được ẩn thông tin nhạy cảm để gia sư tìm lớp phù hợp và ứng tuyển.",
  path: "/learning-requests",
})

export default function LearningRequestsPage() {
  return <LearningRequestsPageClient />
}
