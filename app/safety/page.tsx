import { LegalPage } from "@/components/legal/legal-page"
import { pageMetadata } from "@/lib/config/site"
import { legalPages } from "@/lib/legal-content"

export const metadata = pageMetadata({
  title: "An toàn và niềm tin",
  description: legalPages.safety.description,
  path: "/safety",
})

export default function SafetyPage() {
  return <LegalPage content={legalPages.safety} />
}
