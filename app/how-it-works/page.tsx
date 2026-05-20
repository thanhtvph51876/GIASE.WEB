import { CheckCircle2, Search, Send, ShieldCheck, Video } from "lucide-react"
import { Header, Footer } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"

const steps = [
  { icon: Search, title: "Tìm gia sư phù hợp", text: "Lọc theo môn, lớp, khu vực, học phí và hình thức học." },
  { icon: Send, title: "Gửi yêu cầu học", text: "Phụ huynh/học sinh điền nhu cầu và lịch học mong muốn." },
  { icon: ShieldCheck, title: "Xác nhận hồ sơ", text: "Gia sư hoặc đội ngũ tư vấn xác nhận thông tin và lịch học thử." },
  { icon: Video, title: "Bắt đầu học thử", text: "Theo dõi lịch học, nhắn tin và đánh giá sau buổi học." },
]

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="page-band py-16 text-center">
          <h1 className="text-4xl font-bold text-slate-950">Học đúng người, đúng mục tiêu, đúng lộ trình</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Quy trình kết nối được thiết kế để phụ huynh dễ lựa chọn và gia sư dễ bắt đầu lớp học.</p>
        </section>
        <section className="app-container grid gap-5 py-10 md:grid-cols-4">
          {steps.map((step) => <Card key={step.title}><CardContent className="p-5"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"><step.icon className="h-6 w-6" /></div><h2 className="mt-4 font-semibold text-slate-950">{step.title}</h2><p className="mt-2 text-sm text-muted-foreground">{step.text}</p><CheckCircle2 className="mt-4 h-5 w-5 text-emerald-600" /></CardContent></Card>)}
        </section>
      </main>
      <Footer />
    </div>
  )
}
