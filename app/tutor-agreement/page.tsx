import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
import { legalPages } from "@/lib/legal-content"

export const metadata: Metadata = {
  title: "Cam kết gia sư",
  description: legalPages.tutorAgreement.description,
}

export default function TutorAgreementPage() {
  return <LegalPage content={legalPages.tutorAgreement} />
}
