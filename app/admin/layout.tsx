"use client"

import { ReactNode, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, BookOpen, CalendarDays, GraduationCap, Home, LogOut, Menu, MessageSquare, Settings, ShieldCheck, UserRoundCheck, Users, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { NotificationMenu } from "@/components/notifications/notification-menu"

const items = [
  { href: "/admin", label: "Tổng quan", icon: Home },
  { href: "/admin/tutors", label: "Quản lý gia sư", icon: GraduationCap },
  { href: "/admin/tutor-approvals", label: "Duyệt hồ sơ", icon: UserRoundCheck },
  { href: "/admin/verifications", label: "Xác thực giấy tờ", icon: ShieldCheck },
  { href: "/admin/students", label: "Quản lý học sinh", icon: Users },
  { href: "/admin/requests", label: "Yêu cầu tìm gia sư", icon: BookOpen },
  { href: "/admin/bookings", label: "Booking học thử", icon: CalendarDays },
  { href: "/admin/classes", label: "Lớp học", icon: CalendarDays },
  { href: "/admin/payments", label: "Thanh toán", icon: Wallet },
  { href: "/admin/payouts", label: "Payout", icon: Wallet },
  { href: "/admin/contacts", label: "Liên hệ", icon: MessageSquare },
  { href: "/admin/operations", label: "Vận hành", icon: ShieldCheck },
  { href: "/admin/audit-logs", label: "Nhật ký", icon: BarChart3 },
  { href: "/admin/reports", label: "Báo cáo", icon: BarChart3 },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login")
  }, [isLoading, router, user])

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-10 text-center text-sm font-medium text-slate-600">Đang kiểm tra quyền truy cập...</div>
  if (!user) return null
  if (user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <div className="surface-panel max-w-md p-8">
          <h1 className="text-2xl font-bold">Không có quyền truy cập</h1>
          <p className="mt-2 text-muted-foreground">Khu vực này chỉ dành cho quản trị viên.</p>
          <Button asChild className="mt-5"><Link href="/">Về trang chủ</Link></Button>
        </div>
      </div>
    )
  }

  const Sidebar = (
    <div className="flex h-full flex-col bg-white">
      <Link href="/" className="flex h-16 items-center gap-2.5 border-b border-slate-200/80 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25"><ShieldCheck className="h-5 w-5" /></div>
        <span className="font-bold text-slate-950">Admin Gia Sư</span>
      </Link>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const active = pathname === item.href
          return <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors", active ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-slate-600 hover:bg-primary/10 hover:text-primary")}><item.icon className="h-4 w-4" />{item.label}</Link>
        })}
      </nav>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100/70">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200/80 bg-white shadow-sm lg:block">{Sidebar}</aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 shadow-sm shadow-slate-950/5 backdrop-blur-xl lg:px-6">
          <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden"><Menu className="h-5 w-5" /></Button></SheetTrigger><SheetContent side="left" className="w-72 p-0">{Sidebar}</SheetContent></Sheet>
          <div><p className="font-bold text-slate-950">Quản lý hệ thống gia sư tập trung</p><p className="hidden text-sm text-muted-foreground sm:block">Theo dõi yêu cầu học, duyệt hồ sơ và kết nối gia sư phù hợp</p></div>
          <div className="flex items-center gap-2">
            <NotificationMenu userId={user.id} />
            <Button variant="outline" onClick={() => { logout(); router.push("/") }}><LogOut className="mr-2 h-4 w-4" />Đăng xuất</Button>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
