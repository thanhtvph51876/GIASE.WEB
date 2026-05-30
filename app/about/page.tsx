import Link from "next/link"
import { CheckCircle2, FileCheck2, HeartHandshake, LockKeyhole, MessageSquareText, ShieldCheck, Users } from "lucide-react"
import { Header, Footer } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const principles = [
  {
    icon: ShieldCheck,
    title: "Kiểm duyệt trước khi nhận lớp",
    text: "Gia sư chỉ được public hồ sơ và nhận lớp sau khi hoàn thiện hồ sơ, giấy tờ và cam kết trách nhiệm.",
  },
  {
    icon: LockKeyhole,
    title: "Bảo mật thông tin",
    text: "Thông tin liên hệ, giấy tờ và dữ liệu nhạy cảm không hiển thị trên các màn public.",
  },
  {
    icon: MessageSquareText,
    title: "Có kênh hỗ trợ/khiếu nại",
    text: "Phụ huynh, học viên và gia sư có thể gửi yêu cầu hỗ trợ khi phát sinh vấn đề trong quá trình học.",
  },
]

export default function AboutPage() {
  return (
    <div className="premium-page-bg flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="gradient-mesh py-14">
          <div className="app-container max-w-4xl text-center">
            <Badge className="premium-badge mb-4">Về Gia Sư Sư Phạm</Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Nền tảng kết nối học viên, phụ huynh với gia sư đã được kiểm duyệt
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600">
              Gia Sư Sư Phạm được xây dựng để giúp phụ huynh tìm gia sư phù hợp, giúp gia sư có quy trình nhận lớp minh bạch và giúp đội ngũ vận hành quản lý chất lượng có kiểm soát.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full">
                <Link href="/register-student">Tạo yêu cầu học</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-white/75">
                <Link href="/register-tutor">Ứng tuyển gia sư</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="app-container py-10">
          <div className="grid gap-5 md:grid-cols-3">
            {principles.map((item) => (
              <Card key={item.title} className="glass-card gradient-border-hover premium-hover-lift rounded-2xl">
                <CardContent className="p-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-semibold text-slate-950">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="gradient-mesh bg-white/45 py-10">
          <div className="app-container grid gap-8 lg:grid-cols-[380px_1fr]">
            <div>
              <Badge variant="secondary" className="mb-3">Cách nền tảng vận hành</Badge>
              <h2 className="text-2xl font-bold text-slate-950">Từ nhu cầu học đến lớp học ổn định</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Quy trình được thiết kế để guest dễ gửi nhu cầu, admin dễ theo dõi và gia sư chỉ nhận lớp khi đã đủ điều kiện.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                "Phụ huynh/học viên gửi nhu cầu hoặc đăng ký học thử công khai.",
                "Tư vấn viên xác nhận thông tin và ưu tiên các yêu cầu cần xử lý trước.",
                "Hệ thống/admin matching gia sư theo môn học, lớp, khu vực, lịch rảnh và chất lượng.",
                "Gia sư xác nhận nhận lớp, lịch học thử hoặc lịch học chính thức.",
                "Lớp học, thanh toán, đánh giá và hỗ trợ được theo dõi trong dashboard.",
                "Khi có khiếu nại, hệ thống lưu lại lịch sử xử lý và audit action quan trọng.",
              ].map((item) => (
                <div key={item} className="glass-card flex items-start gap-2 rounded-2xl p-4 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="app-container py-10">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="glass-card-strong rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-primary" />
                  Kiểm duyệt gia sư
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>Gia sư cần hoàn thiện hồ sơ, upload giấy tờ xác thực và ký cam kết điện tử trước khi được admin duyệt.</p>
                <p>Public chỉ hiển thị badge tin cậy, không hiển thị file gốc hoặc thông tin định danh.</p>
              </CardContent>
            </Card>
            <Card className="glass-card-strong rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartHandshake className="h-5 w-5 text-primary" />
                  Hỗ trợ và khiếu nại
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>Nền tảng hỗ trợ kết nối, theo dõi phản hồi và tiếp nhận khiếu nại khi có vấn đề về lịch học, chất lượng hoặc thanh toán.</p>
                <Button variant="outline" asChild>
                  <Link href="/complaint-policy">Xem chính sách khiếu nại</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="glass-card-strong rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Liên hệ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>Hotline: 0123 456 789</p>
                <p>Email: contact@giasusupham.vn</p>
                <p>Địa chỉ: 280 An Dương Vương, Quận 5, TP. Hồ Chí Minh</p>
                <Button asChild>
                  <Link href="/contact">Gửi yêu cầu hỗ trợ</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
