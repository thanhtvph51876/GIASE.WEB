import { LegalPage } from "@/components/legal/legal-page"
import { pageMetadata } from "@/lib/config/site"
import { legalPages } from "@/lib/legal-content"

export const metadata = pageMetadata({
  title: "Điều khoản sử dụng",
  description: legalPages.terms.description,
  path: "/terms",
})

export default function TermsPage() {
  return <LegalPage content={legalPages.terms} />
}
