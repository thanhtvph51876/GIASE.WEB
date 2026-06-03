import Link from "next/link"
import { FileText, ShieldCheck } from "lucide-react"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ContactInfoBlock } from "@/components/platform/operational-components"
import type { LegalPageContent } from "@/lib/legal-content"

interface LegalPageProps {
  content: LegalPageContent
}

export function LegalPage({ content }: LegalPageProps) {
  return (
    <div className="premium-page-bg min-h-screen">
      <Header />
      <main>
        <section className="gradient-mesh border-b border-white/60 bg-white/45">
          <div className="app-container py-12 sm:py-16">
            <div className="max-w-3xl">
              <Badge variant="outline" className="premium-badge mb-4 gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Chính sách nền tảng
              </Badge>
              <h1 className="font-heading text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                {content.title}
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{content.description}</p>
              <p className="mt-3 text-sm text-slate-500">Cập nhật lần cuối: {content.updatedAt}</p>
            </div>
          </div>
        </section>

        <section className="app-container py-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <article className="space-y-6">
              {content.sections.map((section) => (
                <section
                  key={section.heading}
                  className="glass-card-strong rounded-2xl p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">{section.heading}</h2>
                      <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                        {section.items.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              ))}
            </article>

            <aside className="glass-card-strong h-fit rounded-2xl p-5">
              <h2 className="text-sm font-semibold uppercase text-slate-500">Cần hỗ trợ?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Nếu bạn cần làm rõ chính sách, khiếu nại hoặc yêu cầu hỗ trợ dữ liệu, hãy gửi thông tin qua
                kênh liên hệ chính thức.
              </p>
              <Button asChild className="mt-4 w-full">
                <Link href="/contact">Liên hệ hỗ trợ</Link>
              </Button>
              <ContactInfoBlock className="mt-4" />
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
