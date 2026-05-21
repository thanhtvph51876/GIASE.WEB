"use client"

import Link from "next/link"
import useSWR from "swr"
import {
  GraduationCap,
  Search,
  Shield,
  Clock,
  Star,
  Users,
  BookOpen,
  CheckCircle,
  ArrowRight,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header, Footer } from "@/components/layout"
import { TutorCard } from "@/components/tutor"
import { SubjectIcon } from "@/lib/helpers"
import { useTutors } from "@/lib/hooks/use-tutors"
import { emptySiteStats, publicApi } from "@/lib/api/public-api"

const features = [
  {
    icon: Shield,
    title: "Gia sư được xác minh",
    description:
      "100% gia sư là sinh viên hoặc cựu sinh viên các trường Sư phạm, hồ sơ được xác minh kỹ lưỡng.",
  },
  {
    icon: Search,
    title: "Tìm kiếm dễ dàng",
    description:
      "Bộ lọc thông minh giúp bạn tìm gia sư phù hợp theo môn học, khu vực, giá cả và thời gian.",
  },
  {
    icon: Clock,
    title: "Linh hoạt thời gian",
    description:
      "Đặt lịch học thử miễn phí và sắp xếp thời gian học linh hoạt theo nhu cầu của bạn.",
  },
  {
    icon: Star,
    title: "Đánh giá minh bạch",
    description:
      "Hệ thống đánh giá và nhận xét từ phụ huynh, học sinh giúp bạn chọn gia sư phù hợp nhất.",
  },
]

const steps = [
  {
    step: "01",
    title: "Tìm gia sư",
    description: "Sử dụng bộ lọc để tìm gia sư phù hợp với môn học, khu vực và ngân sách.",
  },
  {
    step: "02",
    title: "Xem hồ sơ",
    description: "Xem chi tiết hồ sơ, kinh nghiệm, đánh giá và lịch dạy của gia sư.",
  },
  {
    step: "03",
    title: "Đăng ký học thử",
    description: "Đặt lịch học thử miễn phí để trải nghiệm phương pháp giảng dạy.",
  },
  {
    step: "04",
    title: "Bắt đầu học",
    description: "Xác nhận đăng ký và bắt đầu lộ trình học tập cùng gia sư.",
  },
]

export default function HomePage() {
  const { data: stats = emptySiteStats } = useSWR("public-stats", () => publicApi.stats(), {
    revalidateOnFocus: false,
  })
  const { data: subjects = [] } = useSWR("catalog-subjects", () => publicApi.subjects(), {
    revalidateOnFocus: false,
  })
  const { tutors } = useTutors({
    initialFilters: { verified: true },
    initialSortBy: "rating_desc",
  })
  const featuredTutors = tutors.slice(0, 3)
  const popularSubjects = subjects.slice(0, 8)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="page-band relative overflow-hidden py-12 md:py-16">
          <div className="app-container">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
              <div>
                <Badge variant="secondary" className="mb-4 shadow-sm">
                  <GraduationCap className="mr-1 h-3 w-3" />
                  Gia sư từ trường Sư phạm
                </Badge>
                <h1 className="mb-6 text-balance text-4xl font-bold text-slate-950 md:text-5xl lg:text-6xl">
                  Tìm gia sư chất lượng cho con bạn
                </h1>
                <p className="mb-8 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
                  Kết nối với gia sư đã xác minh, có lịch học thử rõ ràng và quy trình vận hành minh bạch.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="gap-2" asChild>
                    <Link href="/tutors">
                      <Search className="h-4 w-4" />
                      Tìm gia sư ngay
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/register-tutor">Đăng ký làm gia sư</Link>
                  </Button>
                </div>
              </div>

              <div className="surface-panel overflow-hidden">
                <div className="border-b border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">Gia sư nổi bật hôm nay</p>
                      <p className="text-sm text-muted-foreground">Dựa trên rating, phản hồi và lịch rảnh.</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Đang hoạt động</Badge>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  {featuredTutors.map((tutor) => (
                    <Link key={tutor.id} href={`/tutors/${tutor.id}`} className="item-row flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                          <AvatarImage src={tutor.avatar} alt={tutor.fullName} />
                          <AvatarFallback>{tutor.fullName.slice(-2)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">{tutor.fullName}</p>
                          <p className="truncate text-sm text-muted-foreground">{tutor.subjects.slice(0, 2).join(", ")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{tutor.rating.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">{tutor.responseRate}% phản hồi</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <form
              action="/tutors"
              className="surface-panel mx-auto mt-10 grid max-w-5xl gap-3 p-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
            >
              <select name="subject" className="h-11 rounded-lg border bg-white px-3 text-sm">
                <option value="">Chọn môn học</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <select name="grade" className="h-11 rounded-lg border bg-white px-3 text-sm">
                <option value="">Chọn lớp</option>
                {["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12", "Luyện thi THPT"].map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
              <select name="mode" className="h-11 rounded-lg border bg-white px-3 text-sm">
                <option value="">Hình thức học</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="both">Cả hai</option>
              </select>
              <select name="location" className="h-11 rounded-lg border bg-white px-3 text-sm">
                <option value="">Khu vực</option>
                {["Quận 1", "Quận 3", "Quận 7", "Quận 10", "Bình Thạnh", "Cầu Giấy", "Đống Đa"].map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              <Button type="submit" className="h-11">
                <Search className="mr-2 h-4 w-4" />
                Tìm kiếm
              </Button>
            </form>

            {/* Stats */}
            <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary">{stats.totalTutors}</div>
                  <div className="text-sm text-muted-foreground">Gia sư</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary">{stats.totalStudents}</div>
                  <div className="text-sm text-muted-foreground">Học sinh</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary">
                    {stats.completedSessions}
                  </div>
                  <div className="text-sm text-muted-foreground">Buổi học</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary">
                    {stats.satisfactionRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">Hài lòng</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="app-container">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Tại sao chọn chúng tôi?</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Chúng tôi kết nối bạn với những gia sư giỏi nhất từ các trường Sư phạm uy tín
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="hover:border-primary/30">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Subjects */}
        <section className="bg-slate-100/60 py-20">
          <div className="app-container">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold">Môn học phổ biến</h2>
                <p className="text-muted-foreground">
                  Tìm gia sư theo môn học bạn cần
                </p>
              </div>
              <Button variant="ghost" className="hidden gap-1 md:flex" asChild>
                <Link href="/tutors">
                  Xem tất cả
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
              {popularSubjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/tutors?subject=${encodeURIComponent(subject.name)}`}
                  className="group"
                >
                  <Card className="transition-colors hover:border-primary/30">
                    <CardContent className="p-4 text-center">
                      <div className="mb-2 flex justify-center">
                        <SubjectIcon name={subject.icon} className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-sm font-medium group-hover:text-primary">
                        {subject.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{subject.tutorCount} gia sư</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Tutors */}
        <section className="py-20">
          <div className="app-container">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold">Gia sư nổi bật</h2>
                <p className="text-muted-foreground">
                  Những gia sư được đánh giá cao nhất từ phụ huynh và học sinh
                </p>
              </div>
              <Button variant="ghost" className="hidden gap-1 md:flex" asChild>
                <Link href="/tutors">
                  Xem tất cả
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredTutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Button asChild>
                <Link href="/tutors">
                  Xem tất cả gia sư
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-slate-100/60 py-20">
          <div className="app-container">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Cách thức hoạt động</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Chỉ với 4 bước đơn giản, bạn có thể bắt đầu học cùng gia sư chất lượng
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-4xl font-bold text-primary/20">{item.step}</span>
                    {index < steps.length - 1 && (
                      <div className="hidden h-0.5 flex-1 bg-border lg:block" />
                    )}
                  </div>
                  <h3 className="mb-2 font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="app-container">
            <Card className="overflow-hidden border-slate-900 bg-slate-950">
              <CardContent className="p-8 md:p-12">
                <div className="grid items-center gap-8 md:grid-cols-2">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">
                      Bạn là sinh viên Sư phạm?
                    </h2>
                    <p className="mb-6 text-slate-300">
                      Đăng ký làm gia sư để có thêm thu nhập và tích lũy kinh nghiệm giảng dạy. 
                      Hoàn toàn miễn phí đăng ký!
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button size="lg" variant="secondary" asChild>
                        <Link href="/register?role=tutor">Đăng ký ngay</Link>
                      </Button>
                      <Button size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" asChild>
                        <Link href="/how-it-works">Tìm hiểu thêm</Link>
                      </Button>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="grid grid-cols-2 gap-4 text-white">
                      <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                        <Users className="mb-2 h-8 w-8" />
                        <div className="text-2xl font-bold">{stats.totalTutors}</div>
                        <div className="text-sm opacity-80">Gia sư đăng ký</div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                        <BookOpen className="mb-2 h-8 w-8" />
                        <div className="text-2xl font-bold">{subjects.length}</div>
                        <div className="text-sm opacity-80">Môn học</div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                        <CheckCircle className="mb-2 h-8 w-8" />
                        <div className="text-2xl font-bold">{stats.verifiedTutors}</div>
                        <div className="text-sm opacity-80">Đã xác minh</div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                        <Star className="mb-2 h-8 w-8" />
                        <div className="text-2xl font-bold">{stats.averageRating}</div>
                        <div className="text-sm opacity-80">Đánh giá TB</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
