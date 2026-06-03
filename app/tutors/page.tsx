import { pageMetadata } from "@/lib/config/site"
import TutorsPageClient from "./page-client"

export const metadata = pageMetadata({
  title: "Tìm gia sư",
  description:
    "Tra cứu danh sách gia sư đã xác minh theo môn học, lớp, khu vực, học phí, hình thức dạy và đánh giá.",
  path: "/tutors",
})

export default function TutorsPage() {
  return <TutorsPageClient />
}
