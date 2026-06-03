import { pageMetadata } from "@/lib/config/site"
import LoginPageClient from "./page-client"

export const metadata = pageMetadata({
  title: "Đăng nhập",
  description:
    "Đăng nhập Gia Sư Sư Phạm để vào đúng dashboard theo vai trò học sinh, phụ huynh, gia sư hoặc admin.",
  path: "/login",
})

export default function LoginPage() {
  return <LoginPageClient />
}
