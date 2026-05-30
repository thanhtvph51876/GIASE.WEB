import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
import { legalPages } from "@/lib/legal-content"

export const metadata: Metadata = {
  title: "Chính sách khiếu nại",
  description: legalPages.complaintPolicy.description,
}

export default function ComplaintPolicyPage() {
  return <LegalPage content={legalPages.complaintPolicy} />
}
