import Link from "next/link"
import {
  ArrowRight,
  Award,
  Banknote,
  CalendarCheck,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
} from "lucide-react"
import { Header, Footer } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const benefits = [
  { icon: Banknote, title: "Tăng thu nhập minh bạch", text: "Nhận lớp phù hợp, theo dõi lịch học và thu nhập trong dashboard gia sư." },
  { icon: CalendarCheck, title: "Chủ động lịch dạy", text: "Khai báo lịch rảnh, khu vực, hình thức online/offline và mức học phí mong muốn." },
  { icon: Users, title: "Được hỗ trợ kết nối", text: "Đội ngũ vận hành hỗ trợ tư vấn, matching và xử lý vấn đề phát sinh." },
  { icon: Award, title: "Xây uy tín nghề nghiệp", text: "Hồ sơ được xác minh, có đánh giá thật và badge tin cậy trên nền tảng." },
]

const steps = [
  "Tạo tài khoản gia sư",
  "Hoàn thiện hồ sơ dạy học",
  "Upload giấy tờ xác thực",
  "Ký cam kết trách nhiệm",
  "Chờ admin duyệt hồ sơ",
  "Bắt đầu nhận lớp phù hợp",
]

const requirements = [
  "Thông tin cá nhân, email và số điện thoại đang sử dụng",
  "Ảnh đại diện rõ mặt, lịch sự",
  "Môn dạy, lớp dạy, khu vực và hình thức dạy",
  "Bằng cấp, chứng chỉ hoặc giấy tờ chứng minh năng lực",
  "Giấy tờ định danh hoặc thẻ sinh viên còn hiệu lực",
  "Đồng ý ký cam kết điện tử trước khi được duyệt",
]

export default function RegisterTutorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="page-band py-12">
          <div className="app-container grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-100">
                Ứng tuyển gia sư cần tạo tài khoản
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
                Trở thành gia sư được kiểm duyệt trên Gia Sư Sư Phạm
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                Trang này là phần giới thiệu quy trình. Để nộp hồ sơ thật, bạn cần tạo tài khoản gia sư rồi hoàn thiện hồ sơ, upload giấy tờ và ký cam kết trong dashboard bảo mật.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/register?role=tutor&redirect=%2Fdashboard%2Ftutor%2Fprofile">
                    Tạo tài khoản gia sư
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/tutor-agreement">Tìm hiểu quy trình xác thực</Link>
                </Button>
              </div>
            </div>

            <Card className="border-emerald-200 bg-emerald-50/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <ShieldCheck className="h-5 w-5" />
                  Hồ sơ chỉ được duyệt khi đủ điều kiện
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-emerald-900">
                {requirements.slice(0, 4).map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="app-container py-10">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((item) => (
              <Card key={item.title} className="shadow-sm">
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

        <section className="bg-white py-10">
          <div className="app-container grid gap-8 lg:grid-cols-[360px_1fr]">
            <div>
              <Badge variant="secondary" className="mb-3">Quy trình 6 bước</Badge>
              <h2 className="text-2xl font-bold text-slate-950">Từ ứng tuyển đến nhận lớp</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Quy trình này giúp phụ huynh tin tưởng hơn và giúp admin kiểm soát chất lượng trước khi gia sư nhận lớp.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {steps.map((step, index) => (
                <div key={step} className="surface-panel flex items-start gap-3 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{step}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {index === 0 && "CTA sẽ đưa bạn tới /register?role=tutor, không gửi form vào API cần auth."}
                      {index === 1 && "Hồ sơ được lưu trong dashboard sau khi đăng nhập."}
                      {index === 2 && "Giấy tờ nhạy cảm được lưu private, không public qua trang gia sư."}
                      {index === 3 && "Cam kết điện tử là điều kiện bắt buộc trước khi xét duyệt."}
                      {index === 4 && "Admin kiểm tra checklist, giấy tờ và rủi ro trước khi duyệt."}
                      {index === 5 && "Gia sư đã duyệt mới hiển thị public và nhận yêu cầu học."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="app-container py-10">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-primary" />
                  Giấy tờ cần chuẩn bị
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {requirements.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-primary" />
                  Cam kết trách nhiệm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>Gia sư cam kết thông tin đúng sự thật, bằng cấp hợp lệ, không gian lận và bảo vệ thông tin học viên/phụ huynh.</p>
                <p>Bản cam kết được ký trong dashboard và gắn thông tin kỹ thuật như thời điểm ký, IP, user-agent và phiên bản nội dung.</p>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Sẵn sàng ứng tuyển
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  Tạo tài khoản gia sư để bắt đầu quy trình chính thức. Sau khi đăng ký, hệ thống sẽ đưa bạn tới dashboard để hoàn thiện hồ sơ.
                </p>
                <Button className="w-full" asChild>
                  <Link href="/register?role=tutor&redirect=%2Fdashboard%2Ftutor%2Fprofile">
                    Tạo tài khoản gia sư
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/safety">Xem cam kết an toàn</Link>
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
