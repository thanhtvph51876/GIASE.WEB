"use client"

import { ReactNode, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, BookOpen, CalendarDays, GraduationCap, Home, LogOut, Menu, MessageSquare, Settings, ShieldCheck, UserRoundCheck, Users, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { NotificationMenu } from "@/components/notifications/notification-menu"
import { canAccessAdmin } from "@/lib/permissions"
import {
  ADMIN_MODULES,
  canAccessAdminModule,
  getAdminModuleForPath,
  isAdminModuleReadOnly,
  type AdminModuleKey,
} from "@/lib/admin/admin-permissions"
import { AdminForbiddenState } from "@/components/admin/admin-permission-guard"

const moduleIcons: Record<AdminModuleKey, LucideIcon> = {
  dashboard: Home,
  operations: ShieldCheck,
  tutors: GraduationCap,
  tutorApprovals: UserRoundCheck,
  verifications: ShieldCheck,
  learningRequests: BookOpen,
  bookings: CalendarDays,
  classes: CalendarDays,
  sessions: CalendarDays,
  payments: Wallet,
  payouts: Wallet,
  reports: BarChart3,
  auditLogs: BarChart3,
  students: Users,
  parents: Users,
  contacts: MessageSquare,
  messages: MessageSquare,
  notifications: MessageSquare,
  reviews: BarChart3,
  settings: Settings,
  complaints: MessageSquare,
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login")
  }, [isLoading, router, user])

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7] p-10 text-center text-sm font-medium text-slate-600">Đang kiểm tra quyền truy cập...</div>
  if (!user) return null
  if (!canAccessAdmin(user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7] p-6 text-center">
        <div className="surface-panel max-w-md p-8">
          <h1 className="text-2xl font-bold">Không có quyền truy cập</h1>
          <p className="mt-2 text-muted-foreground">Khu vực này chỉ dành cho quản trị viên.</p>
          <Button asChild className="mt-5"><Link href="/">Về trang chủ</Link></Button>
        </div>
      </div>
    )
  }

  const currentModule = getAdminModuleForPath(pathname)
  const canAccessCurrentModule = !currentModule || canAccessAdminModule(user, currentModule)
  const visibleItems = ADMIN_MODULES.filter((item) => canAccessAdminModule(user, item.key))

  const Sidebar = (
    <div className="flex h-full flex-col bg-white">
      <Link href="/" className="flex h-16 items-center gap-2.5 border-b border-slate-200/80 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25"><ShieldCheck className="h-5 w-5" /></div>
        <span className="font-bold text-slate-950">Admin Gia Sư</span>
      </Link>
      <nav className="flex-1 space-y-1 p-4">
        {visibleItems.map((item) => {
          const active = currentModule === item.key
          const Icon = moduleIcons[item.key]
          const readOnly = isAdminModuleReadOnly(user, item.key)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                active ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-slate-600 hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {readOnly && item.key !== "dashboard" && (
                <Badge variant="secondary" className={cn("px-1.5 py-0 text-[10px]", active && "bg-white/20 text-white")}>
                  Chỉ xem
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200/80 bg-white shadow-sm lg:block">{Sidebar}</aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 shadow-sm shadow-slate-950/5 lg:px-6">
          <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden"><Menu className="h-5 w-5" /></Button></SheetTrigger><SheetContent side="left" className="w-72 p-0">{Sidebar}</SheetContent></Sheet>
          <div><p className="font-bold text-slate-950">Quản lý hệ thống gia sư tập trung</p><p className="hidden text-sm text-muted-foreground sm:block">Theo dõi yêu cầu học, duyệt hồ sơ và kết nối gia sư phù hợp</p></div>
          <div className="flex items-center gap-2">
            <NotificationMenu userId={user.id} />
            <Button variant="outline" onClick={() => { logout(); router.push("/") }}><LogOut className="mr-2 h-4 w-4" />Đăng xuất</Button>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] p-4 lg:p-6">
          {canAccessCurrentModule ? children : <AdminForbiddenState />}
        </main>
      </div>
    </div>
  )
}
