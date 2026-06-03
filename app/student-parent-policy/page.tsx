import { LegalPage } from "@/components/legal/legal-page"
import { pageMetadata } from "@/lib/config/site"
import { legalPages } from "@/lib/legal-content"

export const metadata = pageMetadata({
  title: "Chính sách học viên và phụ huynh",
  description: legalPages.studentParentPolicy.description,
  path: "/student-parent-policy",
})

export default function StudentParentPolicyPage() {
  return <LegalPage content={legalPages.studentParentPolicy} />
}
