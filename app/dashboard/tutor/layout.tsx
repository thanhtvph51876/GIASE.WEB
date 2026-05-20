"use client"

import { ReactNode, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Bell, BookOpen, Calendar, GraduationCap, Home, LogOut, Menu, MessageSquare, Settings, Star, User, Users, Wallet } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { NotificationMenu } from "@/components/notifications/notification-menu"

const items = [
  { href: "/dashboard/tutor", label: "Tổng quan", icon: Home },
  { href: "/dashboard/tutor/profile", label: "Hồ sơ của tôi", icon: User },
  { href: "/dashboard/tutor/requests", label: "Yêu cầu dạy học", icon: BookOpen },
  { href: "/dashboard/tutor/classes", label: "Lớp đang dạy", icon: Users },
  { href: "/dashboard/tutor/schedule", label: "Lịch dạy", icon: Calendar },
  { href: "/dashboard/tutor/students", label: "Học sinh của tôi", icon: Users },
  { href: "/dashboard/tutor/earnings", label: "Thu nhập", icon: Wallet },
  { href: "/dashboard/tutor/reviews", label: "Đánh giá", icon: Star },
  { href: "/dashboard/tutor/messages", label: "Tin nhắn", icon: MessageSquare },
  { href: "/dashboard/tutor/notifications", label: "Thông báo", icon: Bell },
  { href: "/dashboard/tutor/settings", label: "Cài đặt", icon: Settings },
]

export default function TutorDashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login")
  }, [isLoading, router, user])

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-10 text-center text-sm font-medium text-slate-600">Đang kiểm tra phiên đăng nhập...</div>
  if (!user) return null
  if (user.role !== "tutor") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <div className="surface-panel max-w-md p-8">
          <h1 className="text-2xl font-bold">Không có quyền truy cập</h1>
          <p className="mt-2 text-muted-foreground">Khu vực này chỉ dành cho gia sư.</p>
          <Button asChild className="mt-5"><Link href="/">Về trang chủ</Link></Button>
        </div>
      </div>
    )
  }

  const Sidebar = (
    <div className="flex h-full flex-col bg-white">
      <Link href="/" className="flex h-16 items-center gap-2.5 border-b border-slate-200/80 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="font-bold text-slate-950">Gia Sư Sư Phạm</span>
      </Link>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                active ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-slate-600 hover:bg-primary/10 hover:text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100/70">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200/80 bg-white shadow-sm lg:block">{Sidebar}</aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 shadow-sm shadow-slate-950/5 backdrop-blur-xl lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">{Sidebar}</SheetContent>
          </Sheet>
          <div className="hidden items-center gap-2 text-sm font-semibold text-slate-600 sm:flex">
            <BarChart3 className="h-4 w-4" />
            Dashboard gia sư
          </div>
          <div className="ml-auto flex items-center gap-2">
            <NotificationMenu userId={user.id} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8"><AvatarImage src={user.avatar} /><AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback></Avatar>
                  <span className="hidden font-medium md:inline">{user.fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link href="/dashboard/tutor/profile"><User className="mr-2 h-4 w-4" />Hồ sơ</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); router.push("/") }} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
