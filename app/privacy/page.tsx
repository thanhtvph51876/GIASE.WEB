import { LegalPage } from "@/components/legal/legal-page"
import { pageMetadata } from "@/lib/config/site"
import { legalPages } from "@/lib/legal-content"

export const metadata = pageMetadata({
  title: "Chính sách bảo mật",
  description: legalPages.privacy.description,
  path: "/privacy",
})

export default function PrivacyPage() {
  return <LegalPage content={legalPages.privacy} />
}
