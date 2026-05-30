"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import useSWR from "swr"
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  GraduationCap,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header, Footer } from "@/components/layout"
import { TutorCard } from "@/components/tutor"
import { ErrorState } from "@/components/platform/operational-components"
import { SubjectIcon } from "@/lib/helpers"
import { useMasterDataCatalog } from "@/lib/hooks/use-master-data"
import { useTutors } from "@/lib/hooks/use-tutors"
import { publicApi } from "@/lib/api/public-api"

const trustBadges = [
  "Gia sư đã xác thực",
  "Có cam kết trách nhiệm",
  "Hỗ trợ phụ huynh",
  "Chính sách an toàn",
]

const features = [
  {
    icon: Shield,
    title: "Gia sư được xác thực",
    description: "Hồ sơ gia sư được kiểm tra giấy tờ, năng lực và trạng thái cam kết trước khi hiển thị.",
  },
  {
    icon: CheckCircle,
    title: "Quy trình minh bạch",
    description: "Từ đăng ký nhu cầu, matching, học thử đến đánh giá đều có trạng thái rõ ràng.",
  },
  {
    icon: Search,
    title: "Phù hợp nhu cầu học",
    description: "Tìm theo môn, lớp, hình thức học, khu vực, học phí và lịch rảnh.",
  },
  {
    icon: HeartHandshake,
    title: "Hỗ trợ khiếu nại/an toàn",
    description: "Đội ngũ vận hành tiếp nhận hỗ trợ khi có vấn đề về lịch học, chất lượng hoặc thanh toán.",
  },
  {
    icon: Star,
    title: "Review thật sau buổi học",
    description: "Đánh giá được gắn với trải nghiệm học thật để phụ huynh dễ ra quyết định.",
  },
  {
    icon: MessageCircle,
    title: "Phụ huynh dễ theo dõi",
    description: "Dashboard giúp theo dõi yêu cầu học, proposal, lịch học và thanh toán.",
  },
]

const steps = [
  {
    step: "01",
    title: "Gửi nhu cầu",
    description: "Phụ huynh mô tả môn học, lớp, mục tiêu, khu vực và thời gian mong muốn.",
  },
  {
    step: "02",
    title: "Nhận gợi ý",
    description: "Hệ thống và tư vấn viên đề xuất gia sư phù hợp đã được kiểm duyệt.",
  },
  {
    step: "03",
    title: "Học thử",
    description: "Hai bên thống nhất lịch học thử, ghi nhận kết quả và phản hồi.",
  },
  {
    step: "04",
    title: "Bắt đầu học",
    description: "Chuyển sang lớp chính thức, theo dõi lịch học, thanh toán và đánh giá.",
  },
]

export default function HomePage() {
  const { data: stats, error: statsError, mutate: refreshStats } = useSWR("public-stats", () => publicApi.stats(), {
    revalidateOnFocus: false,
  })
  const { subjects, grades, locations, teachingModes, error: masterDataError, refresh: refreshMasterData } = useMasterDataCatalog()
  const { tutors } = useTutors({
    initialFilters: { verified: true },
    initialSortBy: "rating_desc",
  })
  const featuredTutors = tutors.slice(0, 3)
  const popularSubjects = (subjects || []).slice(0, 8)
  const locationOptions = locations?.map((item) => item.fullPath || item.name) || []

  const statCards = [
    { value: stats?.totalTutors ? `${stats.totalTutors}+` : "500+", label: "Gia sư chất lượng" },
    { value: stats?.completedSessions ? `${stats.completedSessions}+` : "1.000+", label: "Buổi học đã kết nối" },
    { value: stats?.averageRating ? `${stats.averageRating}/5` : "4.9/5", label: "Đánh giá trung bình" },
    { value: "24h", label: "Hỗ trợ phản hồi" },
  ]

  return (
    <div className="page-shell page-enter premium-page-bg flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="gradient-mesh relative overflow-hidden pb-12 pt-14 md:pb-16 md:pt-20">
          <div className="premium-container">
            <div className="grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
              <div className="content-fade-up">
                <div className="premium-badge mb-5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Gia Sư Sư Phạm
                </div>
                <h1 className="max-w-4xl text-balance font-heading text-4xl font-bold tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
                  Tìm gia sư chất lượng cho con bạn
                </h1>
                <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-slate-600 md:text-xl">
                  Kết nối phụ huynh với gia sư đã được kiểm duyệt, xác thực hồ sơ và ký cam kết trách nhiệm.
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {trustBadges.map((item) => (
                    <span key={item} className="premium-badge bg-white/70">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 shadow-emerald-700/20 hover:from-emerald-700 hover:to-emerald-600" asChild>
                    <Link href="/tutors">
                      <Search className="h-4 w-4" />
                      Tìm gia sư ngay
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full bg-white/75" asChild>
                    <Link href="/register-student">Đăng ký nhu cầu học</Link>
                  </Button>
                </div>
              </div>

              <div className="glass-card-strong content-fade-up overflow-hidden rounded-2xl">
                <div className="border-b border-white/60 bg-white/50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-heading text-lg font-semibold text-slate-950">Gia sư nổi bật hôm nay</p>
                      <p className="text-sm text-slate-600">Dựa trên xác thực, rating và phản hồi.</p>
                    </div>
                    <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Đã lọc</Badge>
                  </div>
                </div>
                <div className="stagger-list space-y-3 p-4">
                  {featuredTutors.length ? featuredTutors.map((tutor) => (
                    <Link key={tutor.id} href={`/tutors/${tutor.id}`} className="item-row stagger-item flex items-center justify-between gap-3 rounded-xl">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                          <AvatarImage src={tutor.avatar} alt={tutor.fullName} />
                          <AvatarFallback>{tutor.fullName.slice(-2)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">{tutor.fullName}</p>
                          <p className="truncate text-sm text-slate-600">{tutor.subjects.slice(0, 2).join(", ")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{tutor.rating.toFixed(1)}</p>
                        <p className="text-xs text-slate-500">{tutor.responseRate}% phản hồi</p>
                      </div>
                    </Link>
                  )) : (
                    <div className="soft-panel p-5 text-sm text-slate-600">Đang tải gia sư nổi bật...</div>
                  )}
                </div>
              </div>
            </div>

            <form action="/tutors" className="premium-search-capsule reveal mx-auto mt-10 grid max-w-6xl gap-3 p-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:items-center md:gap-0">
              <SearchField label="Subject">
                <select name="subject" className="h-11 w-full rounded-xl border-0 bg-transparent px-3 text-sm md:rounded-none">
                  <option value="">Chọn môn học</option>
                  {subjects?.map((subject) => (
                    <option key={subject.id} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
              </SearchField>
              <SearchField label="Grade">
                <select name="grade" className="h-11 w-full rounded-xl border-0 bg-transparent px-3 text-sm md:rounded-none">
                  <option value="">Chọn lớp</option>
                  {grades?.map((grade) => (
                    <option key={grade.id} value={grade.name}>{grade.name}</option>
                  ))}
                </select>
              </SearchField>
              <SearchField label="Mode">
                <select name="mode" className="h-11 w-full rounded-xl border-0 bg-transparent px-3 text-sm md:rounded-none">
                  <option value="">Hình thức học</option>
                  {teachingModes?.map((mode) => (
                    <option key={mode.id} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </SearchField>
              <SearchField label="Location" last>
                <select name="location" className="h-11 w-full rounded-xl border-0 bg-transparent px-3 text-sm md:rounded-none">
                  <option value="">Khu vực</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </SearchField>
              <Button type="submit" className="h-12 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 shadow-emerald-700/20 hover:from-emerald-700 hover:to-emerald-600">
                <Search className="h-4 w-4" />
                Tìm kiếm
              </Button>
            </form>

            {statsError || masterDataError ? (
              <div className="mx-auto mt-12 max-w-4xl">
                <ErrorState
                  message={statsError ? "Không tải được thống kê public." : "Không tải được master data."}
                  onRetry={() => {
                    refreshStats()
                    refreshMasterData()
                  }}
                />
              </div>
            ) : (
              <div className="stagger-list mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
                {statCards.map((item, index) => (
                  <div key={item.label} className="glass-card premium-float stagger-item rounded-2xl p-5 text-center" style={{ animationDelay: `${index * 120}ms` }}>
                    <div className="emerald-glow-text font-heading text-3xl font-bold md:text-4xl">{item.value}</div>
                    <div className="mt-2 text-sm font-medium text-slate-600">{item.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="premium-section">
          <div className="premium-container">
            <div className="mb-12 text-center">
              <p className="premium-badge mx-auto mb-4 w-fit">Vì sao phụ huynh tin chọn</p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Tại sao chọn chúng tôi</h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">Nền tảng được thiết kế để vừa dễ bắt đầu, vừa đủ minh bạch cho những quyết định học tập quan trọng.</p>
            </div>
            <div className="stagger-list grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="glass-card gradient-border-hover premium-hover-lift stagger-item rounded-2xl">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-primary">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-slate-950">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="premium-section gradient-mesh bg-white/35">
          <div className="premium-container">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="premium-badge mb-4">Môn học phổ biến</p>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Chọn môn, tìm đúng gia sư</h2>
                <p className="mt-3 text-slate-600">Bắt đầu từ môn học con đang cần hỗ trợ nhất.</p>
              </div>
              <Button variant="ghost" className="hidden rounded-full md:flex" asChild>
                <Link href="/tutors">
                  Xem tất cả
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="stagger-list grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
              {popularSubjects.map((subject) => (
                <Link key={subject.id} href={`/tutors?subject=${encodeURIComponent(subject.name)}`} className="stagger-item group">
                  <div className="glass-card gradient-border-hover premium-hover-lift rounded-2xl p-4 text-center">
                    <div className="mb-3 flex justify-center text-primary">
                      <SubjectIcon name={subject.icon || subject.name} className="h-7 w-7" />
                    </div>
                    <h3 className="font-heading text-sm font-semibold text-slate-900 group-hover:text-primary">{subject.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">{subject.tutorCount === undefined ? "Đang cập nhật" : `${subject.tutorCount} gia sư`}</p>
                    <p className="mt-3 text-xs font-semibold text-primary">Tìm gia sư môn này</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="premium-section">
          <div className="premium-container">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="premium-badge mb-4">Gia sư nổi bật</p>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Hồ sơ đáng tin để bắt đầu</h2>
                <p className="mt-3 text-slate-600">Thông tin công khai tập trung vào năng lực, môn dạy, khu vực, rating và học phí.</p>
              </div>
              <Button variant="ghost" className="hidden rounded-full md:flex" asChild>
                <Link href="/tutors">
                  Xem tất cả
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="stagger-list grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredTutors.map((tutor) => (
                <div key={tutor.id} className="stagger-item">
                  <TutorCard tutor={tutor} />
                </div>
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Button className="rounded-full" asChild>
                <Link href="/tutors">
                  Xem tất cả gia sư
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="premium-section gradient-mesh bg-white/35">
          <div className="premium-container">
            <div className="mb-12 text-center">
              <p className="premium-badge mx-auto mb-4 w-fit">Quy trình kết nối</p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Từ nhu cầu học đến lớp học ổn định</h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">Mỗi bước đều có trạng thái rõ để phụ huynh, học viên và gia sư cùng theo dõi.</p>
            </div>
            <div className="stagger-list grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((item) => (
                <div key={item.step} className="glass-card gradient-border-hover stagger-item rounded-2xl p-5">
                  <span className="font-heading text-4xl font-bold text-emerald-600/20">{item.step}</span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="premium-section">
          <div className="premium-container">
            <div className="relative overflow-hidden rounded-2xl bg-[#064e3b] p-8 text-white shadow-[0_28px_90px_-52px_rgba(6,78,59,0.7)] md:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(253,230,138,0.20),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.12),transparent_30%)]" />
              <div className="relative grid items-center gap-8 md:grid-cols-[1fr_.9fr]">
                <div>
                  <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50">
                    <Sparkles className="h-3.5 w-3.5 text-[#fde68a]" />
                    Bạn là sinh viên Sư phạm?
                  </p>
                  <h2 className="font-heading text-3xl font-bold md:text-5xl">
                    Xây hồ sơ gia sư <span className="text-[#fde68a]">minh bạch và có trách nhiệm</span>
                  </h2>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50/85">
                    Gia sư cần hoàn thiện hồ sơ, xác thực giấy tờ và ký cam kết trước khi được duyệt. Nền tảng hỗ trợ bạn nhận lớp phù hợp, theo dõi lịch dạy và xây uy tín nghề nghiệp.
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Button size="lg" variant="secondary" className="rounded-full bg-white text-emerald-900 hover:bg-emerald-50" asChild>
                      <Link href="/register?role=tutor&redirect=%2Fdashboard%2Ftutor%2Fprofile">Tạo tài khoản gia sư</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/15 hover:text-white" asChild>
                      <Link href="/tutor-agreement">Xem quy trình xác thực</Link>
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: ShieldCheck, label: "Xác thực giấy tờ" },
                    { icon: CheckCircle, label: "Ký cam kết" },
                    { icon: BookOpen, label: "Nhận lớp phù hợp" },
                    { icon: Clock, label: "Theo dõi lịch dạy" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                      <item.icon className="mb-4 h-7 w-7 text-[#fde68a]" />
                      <p className="font-semibold">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function SearchField({ label, last, children }: { label: string; last?: boolean; children: ReactNode }) {
  return (
    <label className={`min-w-0 px-2 md:border-r md:border-slate-200/70 ${last ? "md:border-r-0" : ""}`}>
      <span className="mb-1 flex items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label === "Location" && <MapPin className="h-3.5 w-3.5" />}
        {label}
      </span>
      {children}
    </label>
  )
}
