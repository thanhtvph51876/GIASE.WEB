import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
import { legalPages } from "@/lib/legal-content"

export const metadata: Metadata = {
  title: "Chính sách học viên và phụ huynh",
  description: legalPages.studentParentPolicy.description,
}

export default function StudentParentPolicyPage() {
  return <LegalPage content={legalPages.studentParentPolicy} />
}
