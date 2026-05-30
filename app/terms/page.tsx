import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
import { legalPages } from "@/lib/legal-content"

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description: legalPages.terms.description,
}

export default function TermsPage() {
  return <LegalPage content={legalPages.terms} />
}
