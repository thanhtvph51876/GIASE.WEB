"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authService } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { GraduationCap, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { storage, STORAGE_KEYS } from "@/lib/storage"
import { loginSchema } from "@/lib/validations"

const loginPageSchema = loginSchema.extend({
  rememberEmail: z.boolean().default(true),
})

type LoginForm = z.infer<typeof loginPageSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthContext()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginPageSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberEmail: true,
    },
  })

  const rememberEmail = watch("rememberEmail")

  useEffect(() => {
    const rememberedEmail = storage.get(STORAGE_KEYS.REMEMBERED_EMAIL, "")
    if (!rememberedEmail) return
    setValue("email", rememberedEmail)
    setValue("rememberEmail", true)
  }, [setValue])

  const onSubmit = async ({ rememberEmail, ...credentials }: LoginForm) => {
    const ok = await login(credentials)
    if (rememberEmail) storage.set(STORAGE_KEYS.REMEMBERED_EMAIL, credentials.email)
    else storage.remove(STORAGE_KEYS.REMEMBERED_EMAIL)
    if (ok) redirectByCurrentUser()
  }

  const redirectByCurrentUser = () => {
    const currentUser = authService.getCurrentUser()
    if (currentUser?.role === "admin") router.push("/admin")
    else if (currentUser?.role === "tutor") router.push("/dashboard/tutor")
    else if (currentUser?.role === "student" || currentUser?.role === "parent") router.push("/dashboard/student")
    else router.push("/")
  }

  return (
    <div className="min-h-screen bg-slate-100/70 px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
        <section className="hidden rounded-lg border border-slate-200 bg-white p-8 shadow-sm lg:block">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/25">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-slate-950">Gia Sư Sư Phạm</span>
          </Link>

          <div className="mt-14 max-w-xl">
            <p className="text-sm font-semibold uppercase text-primary">Cổng truy cập</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">
              Quản lý học tập, lịch học và thanh toán trong một tài khoản.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Hệ thống tự điều hướng theo vai trò sau khi đăng nhập: quản trị, gia sư, học sinh hoặc phụ huynh.
            </p>
          </div>

          <div className="mt-10 grid gap-3">
            {[
              "Token đăng nhập được cấp từ backend và tự làm mới khi còn phiên hợp lệ.",
              "Mật khẩu không được lưu trên trình duyệt.",
              "Tài khoản gia sư chờ duyệt vẫn đi theo luồng kiểm duyệt hồ sơ.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <Card className="w-full border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <Link href="/" className="mb-2 inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary lg:hidden">
              <ArrowLeft className="h-4 w-4" />
              Trang chủ
            </Link>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Đăng nhập</CardTitle>
            <CardDescription>
              Nhập thông tin tài khoản để tiếp tục.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-sky-200 bg-sky-50 text-sky-900">
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription className="text-sky-800">
                Nếu bạn dùng máy công cộng, hãy bỏ chọn ghi nhớ email và đăng xuất sau khi hoàn tất.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="pl-9"
                  placeholder="email@example.com"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pl-9 pr-11"
                  placeholder="••••••••"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <label htmlFor="rememberEmail" className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <Checkbox
                  id="rememberEmail"
                  checked={rememberEmail}
                  onCheckedChange={(checked) => setValue("rememberEmail", checked === true)}
                />
                Ghi nhớ email
              </label>
              <Link href="/verify-email" className="text-sm text-primary hover:underline">
                Xác minh email
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng nhập
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
