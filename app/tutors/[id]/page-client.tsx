"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Award, BookOpen, CheckCircle2, Clock, GraduationCap, Heart, MapPin, MessageSquare, ShieldCheck, Star, Users } from "lucide-react"
import { LoginRequiredDialog } from "@/components/auth/login-required-dialog"
import { Header, Footer } from "@/components/layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/platform/operational-components"
import { trialBookingSchema, type TrialBookingValues } from "@/lib/validations"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useBookings } from "@/lib/hooks/use-bookings"
import { useFavorites, useTutorDetail } from "@/lib/hooks/use-tutors"
import { useReviews } from "@/lib/hooks/use-reviews"
import { formatAvailableSlots, formatCurrency, getTeachingModeLabel } from "@/lib/helpers"

export default function TutorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuthContext()
  const { tutor, isLoading, error, isNotFound, errorStatus, refresh } = useTutorDetail(id)
  const {
    reviews,
    isLoading: reviewsLoading,
    error: reviewsError,
    refresh: refreshReviews,
  } = useReviews(id)
  const { createPublicTrialBookingRequest } = useBookings({ userId: user?.id })
  const { toggleFavorite, isFavorite } = useFavorites(
    user?.role === "student" || user?.role === "parent" ? user.id : undefined
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestCode, setRequestCode] = useState<string | null>(null)
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TrialBookingValues>({
    resolver: zodResolver(trialBookingSchema),
    defaultValues: {
      studentName: user?.fullName || "",
      phone: user?.phone || "",
      email: user?.email || "",
      subject: tutor?.subjects?.[0] || "",
      grade: tutor?.grades?.[0] || "",
    },
  })

  useEffect(() => {
    if (!tutor) return
    setValue("subject", tutor.subjects?.[0] || "Môn học đang cập nhật")
    setValue("grade", tutor.grades?.[0] || "Lớp học đang cập nhật")
  }, [setValue, tutor])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="app-container flex-1 py-10">
          <LoadingSkeleton label="Đang tải hồ sơ gia sư..." />
        </main>
        <Footer />
      </div>
    )
  }

  if (error && isNotFound) {
    return (
      <div className="premium-page-bg flex min-h-screen flex-col">
        <Header />
        <main className="app-container flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-2xl">
            <EmptyState
              title="Không tìm thấy hồ sơ gia sư"
              description="Hồ sơ có thể đã bị gỡ khỏi danh sách công khai hoặc đường dẫn không còn hợp lệ."
              actionLabel="Quay lại danh sách gia sư"
              href="/tutors"
            />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    const message =
      errorStatus === 401 || errorStatus === 403
        ? "Bạn không có quyền xem hồ sơ gia sư này."
        : "Không thể tải hồ sơ gia sư. Vui lòng thử lại."
    return (
      <div className="premium-page-bg flex min-h-screen flex-col">
        <Header />
        <main className="app-container flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-2xl">
            <ErrorState message={message} onRetry={() => refresh()} />
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/tutors">Quay lại danh sách gia sư</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!tutor) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy hồ sơ gia sư</h1>
          <Button asChild className="mt-4">
            <Link href="/tutors">Quay lại danh sách</Link>
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  const initials = tutor.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(-2)
    .toUpperCase()
  const subjects = tutor.subjects?.length ? tutor.subjects : ["Môn học đang cập nhật"]
  const grades = tutor.grades?.length ? tutor.grades : ["Lớp học đang cập nhật"]
  const locations = tutor.locations?.length ? tutor.locations : []
  const availableSlots = tutor.availableSlots || []
  const rating = Number.isFinite(tutor.rating) ? tutor.rating : 0
  const reviewCount = tutor.reviewCount || 0
  const totalStudents = tutor.totalStudents || 0
  const pricePerHour = Number.isFinite(tutor.pricePerHour) ? tutor.pricePerHour : 0

  const onSubmit = async (values: TrialBookingValues) => {
    setIsSubmitting(true)
    const request = await createPublicTrialBookingRequest(tutor.id, values)
    setIsSubmitting(false)

    if (request) {
      setRequestCode(request.requestCode)
      toast.success("Gửi yêu cầu học thử thành công", {
        description: `Mã yêu cầu: ${request.requestCode}. Tư vấn viên sẽ liên hệ để xác nhận lịch học.`,
      })
      reset()
    } else {
      toast.error("Không thể gửi yêu cầu")
    }
  }

  const officialBookingHref = `/tutors/${tutor.id}/booking?type=official`
  const handleOfficialBooking = () => {
    if (!user) {
      setLoginPromptOpen(true)
      return
    }
    window.location.href = officialBookingHref
  }

  const handleFavorite = () => {
    if (!user) {
      setLoginPromptOpen(true)
      return
    }
    if (user.role !== "student" && user.role !== "parent") {
      toast.info("Chức năng lưu gia sư dành cho học sinh hoặc phụ huynh.")
      return
    }
    toggleFavorite(tutor.id)
  }

  return (
    <div className="premium-page-bg flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="gradient-mesh py-10">
          <div className="app-container">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="flex flex-col gap-5 md:flex-row">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-2 ring-emerald-100">
                  <AvatarImage src={tutor.avatar} alt={tutor.fullName} />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-heading text-3xl font-bold text-slate-950">{tutor.fullName}</h1>
                    {tutor.verified && (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Đã xác minh
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    {tutor.university} · {tutor.faculty} · {tutor.major}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/80 px-3 py-1 shadow-sm">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <b>{rating ? rating.toFixed(1) : "Mới"}</b> ({reviewCount} đánh giá)
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/80 px-3 py-1 shadow-sm">
                      <Users className="h-4 w-4 text-blue-600" />
                      {totalStudents} học sinh
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/80 px-3 py-1 shadow-sm">
                      <Clock className="h-4 w-4 text-blue-600" />
                      {tutor.experienceYears} năm kinh nghiệm
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {subjects.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Card className="glass-card-strong rounded-2xl">
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">Học phí tham khảo</p>
                  <p className="text-3xl font-bold text-primary">
                    {pricePerHour ? `${formatCurrency(pricePerHour)}/giờ` : "Liên hệ tư vấn"}
                  </p>
                  <div className="mt-4 grid gap-2">
                    <Button asChild size="lg" className="h-auto rounded-full whitespace-normal py-3">
                      <a href="#booking">Đăng ký học thử - không cần đăng nhập</a>
                    </Button>
                    <Button type="button" variant="outline" size="lg" className="h-auto rounded-full whitespace-normal py-3" onClick={handleOfficialBooking}>
                      Đặt lịch chính thức - cần đăng nhập
                    </Button>
                    <Button
                      variant={isFavorite(tutor.id) ? "default" : "outline"}
                      className="h-auto rounded-full whitespace-normal py-2"
                      onClick={handleFavorite}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      {isFavorite(tutor.id) ? "Đã lưu gia sư" : user ? "Lưu gia sư" : "Lưu gia sư - cần đăng nhập"}
                    </Button>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    Gia sư chỉ được nhận lớp sau khi được kiểm duyệt hồ sơ và ký cam kết trách nhiệm.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="app-container grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Tabs defaultValue="overview" className="space-y-5">
              <TabsList className="grid h-auto grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="experience">Kinh nghiệm</TabsTrigger>
                <TabsTrigger value="schedule">Lịch rảnh</TabsTrigger>
                <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
                <TabsTrigger value="method">Phương pháp</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-5">
                <Card className="glass-card-strong rounded-2xl">
                  <CardHeader>
                    <CardTitle>Giới thiệu bản thân</CardTitle>
                  </CardHeader>
                  <CardContent className="leading-7 text-muted-foreground">{tutor.bio || "Gia sư đang cập nhật phần giới thiệu."}</CardContent>
                </Card>
                <Card className="rounded-2xl border-emerald-200 bg-emerald-50/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-900">
                      <ShieldCheck className="h-5 w-5" />
                      Hồ sơ tin cậy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm text-emerald-900 sm:grid-cols-2">
                    {[
                      "Đã xác thực danh tính",
                      "Đã xác thực bằng cấp/chứng chỉ",
                      "Đã ký cam kết gia sư",
                      "Được nền tảng duyệt trước khi nhận lớp",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard icon={BookOpen} title="Môn có thể dạy" value={subjects.join(", ")} />
                  <InfoCard icon={GraduationCap} title="Lớp có thể dạy" value={grades.join(", ")} />
                  <InfoCard icon={MapPin} title="Khu vực Offline" value={locations.length ? locations.join(", ") : "Chỉ dạy Online"} />
                  <InfoCard icon={ShieldCheck} title="Hình thức" value={getTeachingModeLabel(tutor.teachingModes)} />
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-5">
                <Card className="glass-card-strong rounded-2xl">
                  <CardHeader>
                    <CardTitle>Học vấn và năng lực</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      <b>{tutor.university}</b> · {tutor.faculty} · {tutor.major}
                    </p>
                    <List title="Thành tích" items={tutor.achievements || []} icon={Award} />
                    <List title="Chứng chỉ" items={tutor.certificates || []} icon={ShieldCheck} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>Lịch rảnh theo tuần</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-muted-foreground">{formatAvailableSlots(availableSlots)}</p>
                    {availableSlots.length ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {availableSlots.map((slot) => (
                        <div key={`${slot.dayOfWeek}-${slot.startTime}`} className="soft-panel bg-white p-3 text-sm">
                          <b>{["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][slot.dayOfWeek]}</b>
                          <p className="text-muted-foreground">{slot.startTime} - {slot.endTime}</p>
                        </div>
                      ))}
                    </div>
                    ) : (
                      <p className="rounded-xl bg-slate-50 p-4 text-sm text-muted-foreground">Gia sư chưa công khai lịch rảnh. Tư vấn viên sẽ xác nhận lịch khi bạn gửi yêu cầu.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {reviewsLoading ? (
                  <LoadingSkeleton label="Đang tải đánh giá gia sư..." />
                ) : reviewsError ? (
                  <ErrorState message="Không thể tải đánh giá." onRetry={() => refreshReviews()} />
                ) : reviews.length ? (
                  reviews.map((review) => (
                    <Card key={review.id} className="glass-card rounded-2xl">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={review.avatar} />
                            <AvatarFallback>{maskReviewerName(review.studentName).charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <b>{maskReviewerName(review.studentName)}</b>
                              <Rating value={review.rating} />
                            </div>
                            <p className="mt-2 text-muted-foreground">{review.content}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="glass-card rounded-2xl">
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <MessageSquare className="mx-auto mb-3 h-10 w-10" />
                      <p className="font-medium text-slate-800">Chưa có đánh giá nào.</p>
                      <p className="mt-1 text-sm text-muted-foreground">Đánh giá sẽ xuất hiện sau khi học sinh hoàn thành buổi học.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="method">
                <Card className="glass-card-strong rounded-2xl">
                  <CardHeader>
                    <CardTitle>Phương pháp giảng dạy</CardTitle>
                  </CardHeader>
                  <CardContent className="leading-7 text-muted-foreground">{tutor.teachingMethod || "Gia sư đang cập nhật phương pháp giảng dạy."}</CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <aside id="booking" className="lg:sticky lg:top-24 lg:self-start">
            <Card className="glass-card-strong rounded-2xl">
              <CardHeader>
                <CardTitle>Đăng ký học thử nhanh</CardTitle>
              </CardHeader>
              <CardContent>
                {requestCode ? (
                  <div className="space-y-4 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">Đã gửi yêu cầu học thử</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Mã yêu cầu: <b>{requestCode}</b></p>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Tư vấn viên sẽ liên hệ để xác nhận lịch học và thông tin phù hợp.
                    </p>
                    <div className="grid gap-2">
                      <Button asChild>
                        <Link href={`/register?role=student&redirect=%2Fdashboard%2Fstudent`}>Tạo tài khoản để theo dõi</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/tutors">Tiếp tục tìm gia sư</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                    Không cần đăng nhập. Thông tin này chỉ dùng để tư vấn viên liên hệ xác nhận lịch học thử.
                  </p>
                  <Field label="Họ tên học sinh" error={errors.studentName?.message}>
                    <Input {...register("studentName")} placeholder="Nguyễn Minh Anh" />
                  </Field>
                  <Field label="Số điện thoại" error={errors.phone?.message}>
                    <Input {...register("phone")} placeholder="0901234567" />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <Field label="Môn học" error={errors.subject?.message}>
                      <Select defaultValue={subjects[0]} onValueChange={(value) => setValue("subject", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Lớp" error={errors.grade?.message}>
                      <Select defaultValue={grades[0]} onValueChange={(value) => setValue("grade", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field label="Thời gian mong muốn" error={errors.preferredTime?.message}>
                    <Input {...register("preferredTime")} placeholder="Tối thứ 3, 19h-21h" />
                  </Field>
                  <Field label="Ghi chú" error={errors.message?.message}>
                    <Textarea {...register("message")} rows={3} placeholder="Mục tiêu học, tình trạng hiện tại..." />
                  </Field>
                  <Button type="submit" className="w-full rounded-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu học thử"}
                  </Button>
                </form>
                )}
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
      <LoginRequiredDialog
        open={loginPromptOpen}
        onOpenChange={setLoginPromptOpen}
        title="Đăng nhập để tiếp tục"
        description="Đặt lịch chính thức hoặc lưu gia sư cần đăng nhập để hệ thống xác nhận và theo dõi trạng thái."
        redirectTo={officialBookingHref}
      />
      <Footer />
    </div>
  )
}

function InfoCard({ icon: Icon, title, value }: { icon: typeof BookOpen; title: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="font-medium">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function List({ title, items, icon: Icon }: { title: string; items: string[]; icon: typeof Award }) {
  if (!items.length) return null
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Rating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={index < value ? "h-4 w-4 fill-amber-400 text-amber-400" : "h-4 w-4 text-muted"}
        />
      ))}
    </div>
  )
}

function maskReviewerName(name: string) {
  const clean = name.trim()
  if (!clean) return "Phụ huynh đã xác thực"
  const parts = clean.split(/\s+/)
  const initials = parts.map((part) => part[0]?.toUpperCase()).filter(Boolean).join(".")
  return `Phụ huynh ${initials || clean[0]?.toUpperCase() || ""}`
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
