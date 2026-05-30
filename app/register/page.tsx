"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { GraduationCap, Loader2, Eye, EyeOff, User, BookOpen } from "lucide-react"
import { useAuthContext } from "@/lib/contexts/auth-context"

const registerSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự."),
  confirmPassword: z.string(),
  role: z.enum(["student", "parent", "tutor"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
})

type RegisterForm = z.infer<typeof registerSchema>

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register: registerUser, isLoading } = useAuthContext()
  const [showPassword, setShowPassword] = useState(false)

  const roleParam = searchParams.get("role")
  const redirectParam = searchParams.get("redirect")
  const defaultRole = roleParam === "student" || roleParam === "parent" || roleParam === "tutor" ? roleParam : "student"

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: defaultRole,
    },
  })

  const selectedRole = watch("role")

  const onSubmit = async (data: RegisterForm) => {
    const ok = await registerUser({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
    })

    if (ok) {
      const safeRedirect = redirectParam?.startsWith("/") && !redirectParam.startsWith("//") ? redirectParam : null
      if (safeRedirect) router.push(safeRedirect)
      else if (data.role === "tutor") router.push("/dashboard/tutor/profile")
      else if (data.role === "parent") router.push("/dashboard/parent")
      else router.push("/dashboard/student")
    } else {
      toast.error("Đăng ký thất bại. Vui lòng thử lại.")
    }
  }

  return (
    <div className="page-shell page-enter gradient-mesh flex min-h-screen items-center justify-center bg-slate-100/70 px-4 py-8">
      <Card className="reveal soft-glow w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/25">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-slate-950">Gia Sư Sư Phạm</span>
          </Link>
          <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
          <CardDescription>
            Tạo tài khoản để bắt đầu sử dụng dịch vụ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label>Bạn là</Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={(value) => setValue("role", value as "student" | "parent" | "tutor")}
                className="grid gap-4 sm:grid-cols-3"
              >
                <Label
                  htmlFor="student"
                  className={`gradient-border-card hover-lift group flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    selectedRole === "student"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="student" id="student" className="sr-only" />
                  <User className="icon-float h-8 w-8" />
                  <span className="font-medium">Học sinh</span>
                </Label>
                <Label
                  htmlFor="parent"
                  className={`gradient-border-card hover-lift group flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    selectedRole === "parent"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="parent" id="parent" className="sr-only" />
                  <User className="icon-float h-8 w-8" />
                  <span className="font-medium">Phụ huynh</span>
                </Label>
                <Label
                  htmlFor="tutor"
                  className={`gradient-border-card hover-lift group flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    selectedRole === "tutor"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="tutor" id="tutor" className="sr-only" />
                  <BookOpen className="icon-float h-8 w-8" />
                  <span className="font-medium">Gia sư</span>
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                placeholder="0901234567"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
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
              <p className="text-xs text-muted-foreground">Mật khẩu tối thiểu 8 ký tự.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng ký
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="page-shell page-enter flex min-h-screen items-center justify-center">Đang tải form đăng ký...</div>}>
      <RegisterContent />
    </Suspense>
  )
}
