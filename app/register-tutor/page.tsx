"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Calendar, CheckCircle2, Clock, DollarSign, GraduationCap, Loader2, Upload, Users } from "lucide-react"
import { Header, Footer } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { GRADES, LOCATIONS_HCM, SUBJECT_OPTIONS, UNIVERSITIES } from "@/lib/constants"
import { tutorRegistrationSchema, type TutorRegistrationValues } from "@/lib/validations"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useTutorRegistration } from "@/lib/hooks/use-tutors"
import type { Gender, TeachingMode } from "@/types"

const benefits = [
  { icon: DollarSign, label: "Tăng thu nhập" },
  { icon: Calendar, label: "Chủ động lịch dạy" },
  { icon: GraduationCap, label: "Rèn nghiệp vụ sư phạm" },
  { icon: Users, label: "Được hỗ trợ kết nối" },
]

export default function RegisterTutorPage() {
  const { user } = useAuthContext()
  const { createTutorProfile } = useTutorRegistration(user?.id)
  const [subjects, setSubjects] = useState<string[]>([])
  const [grades, setGrades] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TutorRegistrationValues>({
    resolver: zodResolver(tutorRegistrationSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      gender: "female",
      university: "Đại học Sư phạm TP.HCM",
      subjects: [],
      grades: [],
      locations: [],
      teachingModes: "both",
      availableSlots: [{ dayOfWeek: 1, startTime: "18:00", endTime: "21:00" }],
      experienceYears: 1,
      pricePerHour: 180000,
    },
  })
  const teachingMode = watch("teachingModes")

  const toggle = (
    value: string,
    values: string[],
    setter: (items: string[]) => void,
    field: "subjects" | "grades" | "locations"
  ) => {
    const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
    setter(next)
    setValue(field, next)
  }

  const onSubmit = async (values: TutorRegistrationValues) => {
    if (!confirmed) {
      toast.error("Vui lòng xác nhận cam kết thông tin")
      return
    }

    setIsSubmitting(true)
    const tutor = await createTutorProfile(
      {
        ...values,
        locations: values.locations || [],
        availableSlots: values.availableSlots || [],
      }
    )
    setIsSubmitting(false)

    if (tutor) {
      setIsSuccess(true)
      toast.success("Gửi hồ sơ gia sư thành công", {
        description: "Hồ sơ của bạn đang chờ xét duyệt.",
      })
    } else {
      toast.error("Không thể gửi hồ sơ")
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
          <Card className="max-w-2xl text-center shadow-lg">
            <CardContent className="p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-9 w-9 text-amber-600" />
              </div>
              <h1 className="mt-6 text-3xl font-bold">Hồ sơ của bạn đã được gửi xét duyệt</h1>
              <p className="mt-3 text-muted-foreground">
                Nhà trường sẽ phản hồi sau khi kiểm tra thông tin. Trạng thái sẽ được cập nhật trong dashboard gia sư.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <Button variant="outline" asChild>
                  <Link href="/">Trang chủ</Link>
                </Button>
                {user?.role === "tutor" && (
                  <Button asChild>
                    <Link href="/dashboard/tutor/profile">Xem hồ sơ</Link>
                  </Button>
                )}
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
      <main className="flex-1">
        <section className="page-band py-10">
          <div className="app-container text-center">
            <Badge className="mb-3 bg-orange-100 text-orange-700 hover:bg-orange-100">Dành cho sinh viên Sư phạm</Badge>
            <h1 className="text-3xl font-bold md:text-5xl">Trở thành gia sư cùng Gia Sư Sư Phạm</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Tăng thu nhập, rèn luyện nghiệp vụ sư phạm và tích lũy kinh nghiệm giảng dạy.
            </p>
            <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((item) => (
                <div key={item.label} className="surface-panel flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="h-5 w-5" /></div>
                  <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="app-container max-w-5xl py-8">
          <Card>
            <CardHeader>
              <CardTitle>Hồ sơ xét duyệt gia sư</CardTitle>
              <CardDescription>
                Vui lòng điền đầy đủ thông tin. Các trường dữ liệu được map đúng với TutorProfile để dễ nối backend sau này.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Section title="1. Thông tin cá nhân">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Họ tên" error={errors.fullName?.message}>
                      <Input {...register("fullName")} placeholder="Trần Thị Minh Anh" />
                    </Field>
                    <Field label="Email" error={errors.email?.message}>
                      <Input {...register("email")} type="email" placeholder="tutor@example.com" />
                    </Field>
                    <Field label="Số điện thoại" error={errors.phone?.message}>
                      <Input {...register("phone")} placeholder="0912345678" />
                    </Field>
                    <Field label="Giới tính" error={errors.gender?.message}>
                      <Select defaultValue="female" onValueChange={(value) => setValue("gender", value as Gender)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">Nữ</SelectItem>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Ảnh đại diện URL" error={errors.avatar?.message}>
                      <Input {...register("avatar")} placeholder="https://..." />
                    </Field>
                  </div>
                </Section>

                <Section title="2. Thông tin học tập">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Mã sinh viên" error={errors.studentCode?.message}>
                      <Input {...register("studentCode")} placeholder="46.01.101.001" />
                    </Field>
                    <Field label="Trường" error={errors.university?.message}>
                      <Select defaultValue="Đại học Sư phạm TP.HCM" onValueChange={(value) => setValue("university", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIVERSITIES.map((university) => (
                            <SelectItem key={university} value={university}>
                              {university}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Khoa" error={errors.faculty?.message}>
                      <Input {...register("faculty")} placeholder="Khoa Toán - Tin" />
                    </Field>
                    <Field label="Chuyên ngành" error={errors.major?.message}>
                      <Input {...register("major")} placeholder="Sư phạm Toán học" />
                    </Field>
                  </div>
                </Section>

                <Section title="3. Thông tin giảng dạy">
                  <div className="space-y-4">
                    <ChoiceGroup label="Môn có thể dạy" error={errors.subjects?.message}>
                      {SUBJECT_OPTIONS.map((subject) => (
                        <Button
                          key={subject.id}
                          type="button"
                          variant={subjects.includes(subject.name) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggle(subject.name, subjects, setSubjects, "subjects")}
                        >
                          {subject.name}
                        </Button>
                      ))}
                    </ChoiceGroup>
                    <ChoiceGroup label="Lớp có thể dạy" error={errors.grades?.message}>
                      {GRADES.map((grade) => (
                        <Button
                          key={grade}
                          type="button"
                          variant={grades.includes(grade) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggle(grade, grades, setGrades, "grades")}
                        >
                          {grade}
                        </Button>
                      ))}
                    </ChoiceGroup>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Field label="Số năm kinh nghiệm" error={errors.experienceYears?.message}>
                        <Input type="number" min={0} onChange={(event) => setValue("experienceYears", Number(event.target.value))} defaultValue={1} />
                      </Field>
                      <Field label="Học phí mong muốn/giờ" error={errors.pricePerHour?.message}>
                        <Input type="number" min={1} onChange={(event) => setValue("pricePerHour", Number(event.target.value))} defaultValue={180000} />
                      </Field>
                      <Field label="Hình thức dạy" error={errors.teachingModes?.message}>
                        <Select defaultValue="both" onValueChange={(value) => setValue("teachingModes", value as TeachingMode)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                            <SelectItem value="both">Cả hai</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    {(teachingMode === "offline" || teachingMode === "both") && (
                      <ChoiceGroup label="Khu vực có thể dạy Offline" error={errors.locations?.message}>
                        {LOCATIONS_HCM.slice(0, 12).map((location) => (
                          <Button
                            key={location}
                            type="button"
                            variant={locations.includes(location) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggle(location, locations, setLocations, "locations")}
                          >
                            {location}
                          </Button>
                        ))}
                      </ChoiceGroup>
                    )}
                    <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                      Lịch rảnh mặc định: Thứ 2, 18:00 - 21:00. Bạn có thể chỉnh chi tiết trong dashboard sau khi tạo hồ sơ.
                    </p>
                  </div>
                </Section>

                <Section title="4. Hồ sơ năng lực">
                  <div className="grid gap-4">
                    <Field label="Giới thiệu bản thân" error={errors.bio?.message}>
                      <Textarea {...register("bio")} rows={5} placeholder="Chia sẻ kinh nghiệm, phong cách đồng hành và điểm mạnh của bạn..." />
                    </Field>
                    <Field label="Phương pháp giảng dạy" error={errors.teachingMethod?.message}>
                      <Textarea {...register("teachingMethod")} rows={4} placeholder="Mô tả cách bạn đánh giá năng lực, xây lộ trình và theo dõi tiến bộ..." />
                    </Field>
                    <Field label="Thành tích" error={errors.achievements?.message}>
                      <Textarea
                        rows={3}
                        placeholder="Mỗi thành tích một dòng"
                        onChange={(event) => setValue("achievements", event.target.value.split("\n").filter(Boolean))}
                      />
                    </Field>
                    <Field label="Chứng chỉ" error={errors.certificates?.message}>
                      <Textarea
                        rows={3}
                        placeholder="Mỗi chứng chỉ một dòng"
                        onChange={(event) => setValue("certificates", event.target.value.split("\n").filter(Boolean))}
                      />
                    </Field>
                    <div className="soft-panel border-2 border-dashed p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm font-medium">Upload thẻ sinh viên/chứng nhận</p>
                      <p className="text-xs text-muted-foreground">Tệp minh chứng giúp admin xét duyệt hồ sơ nhanh hơn.</p>
                      <Input type="file" className="mx-auto mt-4 max-w-sm" />
                    </div>
                  </div>
                </Section>

                <div className="soft-panel flex items-start gap-2 bg-white p-4">
                  <Checkbox id="commit" checked={confirmed} onCheckedChange={(checked) => setConfirmed(checked === true)} />
                  <Label htmlFor="commit" className="leading-6">
                    Tôi cam kết thông tin cung cấp là chính xác và đồng ý để nhà trường kiểm tra hồ sơ.
                  </Label>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !confirmed}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Gửi hồ sơ xét duyệt
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-panel space-y-4 p-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        {title}
      </h2>
      {children}
    </section>
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

function ChoiceGroup({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">{children}</div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
