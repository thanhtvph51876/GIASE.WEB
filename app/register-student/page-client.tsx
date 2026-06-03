"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { Header, Footer } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PublicDataNotice } from "@/components/platform/operational-components"
import { studentRegistrationSchema, type StudentRegistrationValues } from "@/lib/validations"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useLearningRequests } from "@/lib/hooks/use-learning-requests"
import { useMasterDataCatalog } from "@/lib/hooks/use-master-data"

const steps = ["Thông tin", "Nhu cầu", "Xác nhận"]

export default function RegisterStudentPage() {
  const { user } = useAuthContext()
  const { createRequest } = useLearningRequests(user?.id)
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successCode, setSuccessCode] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const {
    subjects,
    grades,
    locations,
    teachingModes,
    error: masterDataError,
    isLoading: masterDataLoading,
    refresh: refreshMasterData,
  } = useMasterDataCatalog()
  const locationOptions = locations?.map((item) => item.fullPath || item.name) || []

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentRegistrationValues>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      studentName: user?.role === "student" ? user.fullName : "",
      phone: user?.phone || "",
      email: user?.email || "",
      teachingMode: "both",
      goal: "",
    },
  })

  const values = watch()
  const isOnlineOnly = values.teachingMode === "online"

  const handleTeachingModeChange = (value: StudentRegistrationValues["teachingMode"]) => {
    setValue("teachingMode", value, { shouldValidate: true })
    if (value === "online") {
      setValue("location", "", { shouldValidate: true })
    }
  }

  const nextStep = async () => {
    const fields: Array<keyof StudentRegistrationValues> =
      step === 0 ? ["studentName", "phone", "grade"] : ["subject", "goal", "teachingMode"]
    const ok = await trigger(fields)
    if (ok) setStep((current) => Math.min(current + 1, 2))
  }

  const onSubmit = async (data: StudentRegistrationValues) => {
    if (!confirmed) {
      toast.error("Vui lòng xác nhận thông tin trước khi gửi")
      return
    }
    setIsSubmitting(true)
    const request = await createRequest(data)
    setIsSubmitting(false)
    if (request) {
      setSuccessCode(request.requestCode)
      toast.success("Gửi yêu cầu học thành công", {
        description: `Mã yêu cầu của bạn: ${request.requestCode}`,
      })
    } else {
      toast.error("Không thể gửi yêu cầu")
    }
  }

  if (successCode) {
    return (
      <div className="premium-page-bg flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
          <Card className="glass-card-strong max-w-2xl rounded-2xl text-center">
            <CardContent className="p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-9 w-9 text-emerald-600" />
              </div>
              <h1 className="mt-6 text-3xl font-bold">Yêu cầu của bạn đã được ghi nhận</h1>
              <p className="mt-3 text-muted-foreground">
                Đội ngũ tư vấn sẽ liên hệ trong thời gian sớm nhất. Mã yêu cầu: <b>{successCode}</b>
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button variant="outline" asChild>
                  <Link href="/">Quay về trang chủ</Link>
                </Button>
                {user && (
                  <Button asChild>
                    <Link href={user.role === "parent" ? "/dashboard/parent" : "/dashboard/student/requests"}>Xem trong dashboard</Link>
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
    <div className="premium-page-bg flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="gradient-mesh py-12">
          <div className="app-container text-center">
            <Badge className="premium-badge mb-3">Đăng ký học</Badge>
            <h1 className="font-heading text-3xl font-bold md:text-5xl">Cho chúng tôi biết nhu cầu học tập của bạn</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Đội ngũ tư vấn sẽ hỗ trợ tìm gia sư phù hợp nhất theo mục tiêu, khu vực và ngân sách.
            </p>
          </div>
        </section>

        <section className="app-container max-w-4xl py-8">
          {(masterDataLoading || masterDataError) && (
            <PublicDataNotice
              className="mb-4"
              isLoading={masterDataLoading}
              loadingMessage="Đang tải danh mục từ backend. Bạn vẫn có thể điền form bằng danh mục dự phòng."
              message="Không tải đủ danh mục từ backend. Form đang dùng dữ liệu dự phòng và vẫn gửi yêu cầu được."
              onRetry={masterDataError ? () => refreshMasterData() : undefined}
              retryLabel="Thử lại danh mục"
            />
          )}
          <Card className="glass-card-strong rounded-2xl">
            <CardHeader>
              <CardTitle>Tạo yêu cầu tìm gia sư</CardTitle>
              <CardDescription>Hoàn tất 3 bước để gửi yêu cầu. Trạng thái sẽ được đồng bộ trong dashboard.</CardDescription>
              <div className="pt-4">
                <div className="mb-2 flex justify-between text-sm">
                  {steps.map((item, index) => (
                    <span key={item} className={index <= step ? "font-medium text-primary" : "text-muted-foreground"}>
                      {item}
                    </span>
                  ))}
                </div>
                <Progress value={((step + 1) / steps.length) * 100} />
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {step === 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Họ tên học sinh" error={errors.studentName?.message}>
                      <Input {...register("studentName")} placeholder="Nguyễn Minh Anh" />
                    </Field>
                    <Field label="Họ tên phụ huynh" error={errors.parentName?.message}>
                      <Input {...register("parentName")} placeholder="Nguyễn Văn Bình" />
                    </Field>
                    <Field label="Số điện thoại" error={errors.phone?.message}>
                      <Input {...register("phone")} placeholder="0901234567" />
                    </Field>
                    <Field label="Email" error={errors.email?.message}>
                      <Input {...register("email")} type="email" placeholder="email@example.com" />
                    </Field>
                    <Field label="Lớp hiện tại" error={errors.grade?.message}>
                      <Select value={values.grade} onValueChange={(value) => setValue("grade", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn lớp" />
                        </SelectTrigger>
                          <SelectContent>
                          {grades?.map((grade) => (
                            <SelectItem key={grade.id} value={grade.name}>
                              {grade.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Hoặc nhập lớp khác"
                        onChange={(event) => setValue("grade", event.target.value, { shouldValidate: true })}
                      />
                    </Field>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Môn cần học" error={errors.subject?.message}>
                      <Select value={values.subject} onValueChange={(value) => setValue("subject", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn môn học" />
                        </SelectTrigger>
                          <SelectContent>
                          {subjects?.map((subject) => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Hoặc nhập môn khác"
                        onChange={(event) => setValue("subject", event.target.value, { shouldValidate: true })}
                      />
                    </Field>
                    <Field label="Mục tiêu học" error={errors.goal?.message}>
                      <Textarea {...register("goal")} rows={3} placeholder="Ví dụ: củng cố kiến thức mất gốc, ôn thi lớp 10, luyện IELTS 6.5..." />
                    </Field>
                    <Field label="Hình thức học" error={errors.teachingMode?.message}>
                      <Select
                        value={values.teachingMode}
                        onValueChange={(value) => handleTeachingModeChange(value as StudentRegistrationValues["teachingMode"])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {teachingModes?.map((mode) => (
                            <SelectItem key={mode.id} value={mode.value}>
                              {mode.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Khu vực học offline" error={errors.location?.message}>
                      {isOnlineOnly ? (
                        <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-muted-foreground">
                          Hình thức online không cần khu vực học offline. Bạn có thể bỏ trống mục này.
                        </p>
                      ) : (
                        <>
                          <Select value={values.location || ""} onValueChange={(value) => setValue("location", value, { shouldValidate: true })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn khu vực" />
                            </SelectTrigger>
                            <SelectContent>
                              {locationOptions.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Hoặc nhập khu vực khác nếu không có trong danh sách"
                            value={values.location || ""}
                            onChange={(event) => setValue("location", event.target.value, { shouldValidate: true })}
                          />
                        </>
                      )}
                    </Field>
                    <Field label="Thời gian mong muốn" error={errors.preferredSchedule?.message}>
                      <Input {...register("preferredSchedule")} placeholder="Tối thứ 2, 4, 6" />
                    </Field>
                    <Field label="Mức học phí mong muốn" error={errors.expectedFee?.message}>
                      <Input
                        type="number"
                        placeholder="200000"
                        onChange={(event) => setValue("expectedFee", event.target.value ? Number(event.target.value) : undefined)}
                      />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="Ghi chú thêm" error={errors.note?.message}>
                        <Textarea {...register("note")} rows={4} placeholder="Tình trạng học hiện tại, mục tiêu điểm số, yêu cầu về gia sư..." />
                      </Field>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div className="soft-panel grid gap-3 rounded-2xl p-5 sm:grid-cols-2">
                      <Summary label="Học sinh" value={values.studentName} />
                      <Summary label="Phụ huynh" value={values.parentName || "Không nhập"} />
                      <Summary label="Liên hệ" value={`${values.phone} · ${values.email || "Chưa có email"}`} />
                      <Summary label="Lớp" value={values.grade} />
                      <Summary label="Môn học" value={values.subject} />
                      <Summary label="Hình thức" value={values.teachingMode} />
                      <Summary label="Khu vực" value={values.location || "Linh hoạt"} />
                      <Summary label="Lịch học" value={values.preferredSchedule || "Trao đổi thêm"} />
                    </div>
                    <div className="flex items-start gap-2">
                      <Checkbox id="confirm" checked={confirmed} onCheckedChange={(checked) => setConfirmed(checked === true)} />
                      <Label htmlFor="confirm" className="leading-6">
                        Tôi xác nhận thông tin đã chính xác và đồng ý để Gia Sư Sư Phạm liên hệ tư vấn.
                      </Label>
                    </div>
                  </div>
                )}

                <div className="flex justify-between gap-3 border-t pt-5">
                  <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((current) => Math.max(current - 1, 0))}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                  </Button>
                  {step < 2 ? (
                    <Button type="button" onClick={nextStep}>
                      Tiếp tục
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting || !confirmed}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Gửi yêu cầu
                    </Button>
                  )}
                </div>
                <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                  Thông tin của bạn chỉ dùng để tư vấn và xếp lớp. Chúng tôi không công khai số điện thoại của bạn.
                </p>
              </form>
            </CardContent>
          </Card>
        </section>
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

function Summary({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "Chưa nhập"}</p>
    </div>
  )
}
