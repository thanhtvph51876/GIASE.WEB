import { LegalPage } from "@/components/legal/legal-page"
import { pageMetadata } from "@/lib/config/site"
import { legalPages } from "@/lib/legal-content"

export const metadata = pageMetadata({
  title: "Chính sách khiếu nại",
  description: legalPages.complaintPolicy.description,
  path: "/complaint-policy",
})

export default function ComplaintPolicyPage() {
  return <LegalPage content={legalPages.complaintPolicy} />
}
