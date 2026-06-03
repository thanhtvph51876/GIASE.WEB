import { LegalPage } from "@/components/legal/legal-page"
import { pageMetadata } from "@/lib/config/site"
import { legalPages } from "@/lib/legal-content"

export const metadata = pageMetadata({
  title: "Cam kết gia sư",
  description: legalPages.tutorAgreement.description,
  path: "/tutor-agreement",
})

export default function TutorAgreementPage() {
  return <LegalPage content={legalPages.tutorAgreement} />
}
