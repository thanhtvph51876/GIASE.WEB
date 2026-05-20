"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { authService } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Loader2, Eye, EyeOff } from "lucide-react"
import { useAuthContext } from "@/lib/contexts/auth-context"

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, loginAsAdmin, loginAsTutor, loginAsStudent, loginAsParent, isLoading } = useAuthContext()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    const ok = await login(data)
    if (ok) redirectByCurrentUser()
  }

  const redirectByCurrentUser = () => {
    const currentUser = authService.getCurrentUser()
    if (currentUser?.role === "admin") router.push("/admin")
    else if (currentUser?.role === "tutor") router.push("/dashboard/tutor")
    else if (currentUser?.role === "student" || currentUser?.role === "parent") router.push("/dashboard/student")
    else router.push("/")
  }

  const handleDemoLogin = async (role: "admin" | "tutor" | "student" | "parent") => {
    const ok =
      role === "admin"
        ? await loginAsAdmin()
        : role === "tutor"
          ? await loginAsTutor()
          : role === "parent"
            ? await loginAsParent()
            : await loginAsStudent()
    if (ok) redirectByCurrentUser()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100/70 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/25">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-slate-950">Gia Sư Sư Phạm</span>
          </Link>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập email và mật khẩu để truy cập tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng nhập
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Tài khoản thử nghiệm
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <Button type="button" variant="outline" onClick={() => handleDemoLogin("admin")}>
                Đăng nhập Admin Demo
              </Button>
              <Button type="button" variant="outline" onClick={() => handleDemoLogin("tutor")}>
                Đăng nhập Gia sư Demo
              </Button>
              <Button type="button" variant="outline" onClick={() => handleDemoLogin("student")}>
                Đăng nhập Học sinh Demo
              </Button>
              <Button type="button" variant="outline" onClick={() => handleDemoLogin("parent")}>
                Đăng nhập Phụ huynh Demo
              </Button>
            </div>

            <div className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
              <p>admin@example.com / 123456</p>
              <p>tutor@example.com / 123456</p>
              <p>student@example.com / 123456</p>
              <p>binh.parent@example.com / 123456</p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
