import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
import { legalPages } from "@/lib/legal-content"

export const metadata: Metadata = {
  title: "An toàn và niềm tin",
  description: legalPages.safety.description,
}

export default function SafetyPage() {
  return <LegalPage content={legalPages.safety} />
}
