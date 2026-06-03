import { pageMetadata } from "@/lib/config/site"
import RegisterPageClient from "./page-client"

export const metadata = pageMetadata({
  title: "Đăng ký tài khoản",
  description:
    "Tạo tài khoản học sinh, phụ huynh hoặc gia sư để sử dụng đầy đủ quy trình học thử, dashboard và hỗ trợ.",
  path: "/register",
})

export default function RegisterPage() {
  return <RegisterPageClient />
}
