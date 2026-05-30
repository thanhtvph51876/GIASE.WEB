import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
import { legalPages } from "@/lib/legal-content"

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description: legalPages.privacy.description,
}

export default function PrivacyPage() {
  return <LegalPage content={legalPages.privacy} />
}
