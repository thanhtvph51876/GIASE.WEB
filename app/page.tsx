import { pageMetadata } from "@/lib/config/site"
import HomePageClient from "./page-client"

export const metadata = pageMetadata({
  title: "Kết nối gia sư chất lượng",
  description:
    "Tìm gia sư sư phạm đã xác minh hồ sơ, đăng ký nhu cầu học và theo dõi quy trình matching minh bạch.",
  path: "/",
})

export default function HomePage() {
  return <HomePageClient />
}
