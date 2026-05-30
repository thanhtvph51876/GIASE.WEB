import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
import { legalPages } from "@/lib/legal-content"

export const metadata: Metadata = {
  title: "Chính sách hoàn tiền",
  description: legalPages.refundPolicy.description,
}

export default function RefundPolicyPage() {
  return <LegalPage content={legalPages.refundPolicy} />
}
