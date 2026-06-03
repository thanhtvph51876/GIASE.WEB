import { LegalPage } from "@/components/legal/legal-page"
import { pageMetadata } from "@/lib/config/site"
import { legalPages } from "@/lib/legal-content"

export const metadata = pageMetadata({
  title: "Chính sách hoàn tiền",
  description: legalPages.refundPolicy.description,
  path: "/refund-policy",
})

export default function RefundPolicyPage() {
  return <LegalPage content={legalPages.refundPolicy} />
}
