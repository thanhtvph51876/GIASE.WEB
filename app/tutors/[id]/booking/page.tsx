"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeft, CheckCircle2, LockKeyhole, Star } from "lucide-react"
import { Header, Footer } from "@/components/layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useBookings } from "@/lib/hooks/use-bookings"
import { useTutorDetail } from "@/lib/hooks/use-tutors"
import { formatCurrency, formatAvailableSlots } from "@/lib/helpers"
import { trialBookingSchema, type TrialBookingValues } from "@/lib/validations"

export default function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string; mode?: string }>
}) {
  const { id } = use(params)
  const query = use(searchParams)
  const { user } = useAuthContext()
  const { tutor, isLoading } = useTutorDetail(id)
  const { createBooking, createPublicTrialBookingRequest } = useBookings({ userId: user?.id })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [requestCode, setRequestCode] = useState<string | null>(null)
  const isOfficialBooking = query.type === "official" || query.mode === "official"

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TrialBookingValues>({
    resolver: zodResolver(trialBookingSchema),
    defaultValues: {
      studentName: user?.fullName || "",
      phone: user?.phone || "",
      email: user?.email || "",
      subject: tutor?.subjects[0] || "",
      grade: tutor?.grades[0] || "",
    },
  })

  useEffect(() => {
    if (!tutor) return
    setValue("subject", tutor.subjects[0] || "")
    setValue("grade", tutor.grades[0] || "")
  }, [setValue, tutor])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto flex flex-1 items-center justify-center px-4 text-center">
          <p className="text-muted-foreground">Đang tải hồ sơ gia sư...</p>
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
          <h1 className="text-2xl font-bold">Không tìm thấy gia sư</h1>
          <Button asChild className="mt-4">
            <Link href="/tutors">Quay lại danh sách</Link>
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  const onSubmit = async (values: TrialBookingValues) => {
    setIsSubmitting(true)
    const result = isOfficialBooking
      ? await createBooking(tutor.id, values)
      : await createPublicTrialBookingRequest(tutor.id, values)
    setIsSubmitting(false)
    if (result) {
      if (!isOfficialBooking && "requestCode" in result) setRequestCode(result.requestCode)
      toast.success(isOfficialBooking ? "Đặt lịch chính thức thành công" : "Đăng ký học thử thành công", {
        description: isOfficialBooking
          ? "Bạn có thể theo dõi trạng thái booking trong dashboard."
          : "Tư vấn viên sẽ liên hệ để xác nhận lịch học.",
      })
      setSubmitted(true)
    } else {
      toast.error("Không thể gửi yêu cầu")
    }
  }

  if (isOfficialBooking && !user) {
    const redirect = `/tutors/${tutor.id}/booking?type=official`
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="app-container flex flex-1 items-center justify-center py-12">
          <Card className="max-w-xl text-center">
            <CardContent className="p-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <LockKeyhole className="h-7 w-7" />
              </div>
              <h1 className="mt-5 text-2xl font-bold text-slate-950">Đặt lịch chính thức cần đăng nhập</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Học thử/tư vấn có thể gửi không cần đăng nhập. Booking chính thức cần tài khoản để xác nhận lịch, theo dõi trạng thái và bảo vệ thông tin thanh toán.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href={`/login?redirect=${encodeURIComponent(redirect)}`}>Đăng nhập để tiếp tục</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/register?role=student&redirect=${encodeURIComponent(redirect)}`}>Tạo tài khoản</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href={`/tutors/${tutor.id}/booking`}>Đăng ký học thử</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="app-container flex-1 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/tutors/${tutor.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại hồ sơ gia sư
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>{isOfficialBooking ? "Đặt lịch chính thức" : "Đăng ký học thử / tư vấn"}</CardTitle>
              <CardDescription>
                {isOfficialBooking
                  ? "Cần đăng nhập để xác nhận booking chính thức và theo dõi trạng thái trong dashboard."
                  : "Không cần đăng nhập. Tư vấn viên sẽ liên hệ để xác nhận lịch học thử."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                  <CheckCircle2 className="h-14 w-14 text-emerald-600" />
                  <h2 className="mt-4 text-2xl font-bold text-slate-950">
                    {isOfficialBooking ? "Booking chính thức đã được tạo" : "Yêu cầu học thử đã được gửi"}
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    {isOfficialBooking
                      ? "Bạn có thể theo dõi trạng thái trong dashboard."
                      : "Tư vấn viên sẽ liên hệ để xác nhận lịch học."}
                  </p>
                  {!isOfficialBooking && requestCode && (
                    <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
                      Mã yêu cầu: <b>{requestCode}</b>
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <Button asChild>
                      <Link href={isOfficialBooking ? "/dashboard/student/bookings" : "/register?role=student&redirect=%2Fdashboard%2Fstudent"}>
                        {isOfficialBooking ? "Về dashboard" : "Tạo tài khoản để theo dõi"}
                      </Link>
                    </Button>
                    <Button variant="outline" asChild><Link href={`/tutors/${tutor.id}`}>Xem lại hồ sơ</Link></Button>
                    {!isOfficialBooking && <Button variant="outline" asChild><Link href="/tutors">Tiếp tục tìm gia sư</Link></Button>}
                  </div>
                </div>
              ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-2 sm:grid-cols-4">
                  {["Môn/lớp", "Lịch học thử", "Mục tiêu", "Xác nhận"].map((step, index) => (
                    <div key={step} className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm font-semibold text-primary">
                      Bước {index + 1}: {step}
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Họ tên học sinh" error={errors.studentName?.message}>
                    <Input {...register("studentName")} placeholder="Nguyễn Minh Anh" />
                  </Field>
                  <Field label="Số điện thoại" error={errors.phone?.message}>
                    <Input {...register("phone")} placeholder="0901234567" />
                  </Field>
                </div>
                <Field label="Email" error={errors.email?.message}>
                  <Input {...register("email")} type="email" placeholder="email@example.com" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Môn học" error={errors.subject?.message}>
                    <Select defaultValue={tutor.subjects[0]} onValueChange={(value) => setValue("subject", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tutor.subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Lớp" error={errors.grade?.message}>
                    <Select defaultValue={tutor.grades[0]} onValueChange={(value) => setValue("grade", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tutor.grades.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Thời gian mong muốn" error={errors.preferredTime?.message}>
                  <Input {...register("preferredTime")} placeholder="Ví dụ: Tối thứ 3, 19h-21h" />
                </Field>
                <Field label="Ghi chú" error={errors.message?.message}>
                  <Textarea {...register("message")} rows={5} placeholder="Mục tiêu học, tình trạng hiện tại, yêu cầu đặc biệt..." />
                </Field>
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Đang gửi yêu cầu..."
                    : isOfficialBooking
                    ? "Xác nhận đặt lịch chính thức"
                    : "Gửi yêu cầu học thử"}
                </Button>
              </form>
              )}
            </CardContent>
          </Card>

          <aside className="space-y-5">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={tutor.avatar} />
                    <AvatarFallback>{tutor.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{tutor.fullName}</h2>
                      {tutor.verified && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{tutor.university}</p>
                    <div className="mt-1 flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {tutor.rating.toFixed(1)} ({tutor.reviewCount})
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin học thử</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Học phí sau học thử</span>
                  <b>{formatCurrency(tutor.pricePerHour)}/giờ</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thanh toán hôm nay</span>
                  <b className="text-emerald-600">0đ</b>
                </div>
                <p className="soft-panel bg-primary/10 p-3 text-primary">
                  Lịch rảnh: {formatAvailableSlots(tutor.availableSlots)}
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
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
