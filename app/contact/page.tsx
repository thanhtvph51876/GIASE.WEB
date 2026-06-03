import { ContactPageClient } from "./contact-page-client"
import { pageMetadata } from "@/lib/site-config"

export const metadata = pageMetadata({
  title: "Liên hệ tư vấn gia sư",
  description: "Liên hệ Gia Sư Sư Phạm để được hỗ trợ tìm gia sư, đăng ký làm gia sư hoặc xử lý vấn đề trong quá trình học.",
  path: "/contact",
})

export default function ContactPage() {
  return <ContactPageClient />
}
