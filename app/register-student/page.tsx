import { pageMetadata } from "@/lib/config/site"
import RegisterStudentPageClient from "./page-client"

export const metadata = pageMetadata({
  title: "Đăng ký nhu cầu học",
  description:
    "Gửi nhu cầu học để đội ngũ Gia Sư Sư Phạm tư vấn, matching gia sư phù hợp và theo dõi trạng thái xử lý.",
  path: "/register-student",
})

export default function RegisterStudentPage() {
  return <RegisterStudentPageClient />
}
