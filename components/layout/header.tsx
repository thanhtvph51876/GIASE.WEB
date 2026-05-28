"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, GraduationCap, User, LogOut, Settings, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { NotificationMenu } from "@/components/notifications/notification-menu"
import { isAdminRole } from "@/lib/permissions"

const publicNavItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/tutors", label: "Tìm gia sư" },
  { href: "/register-student", label: "Đăng ký học" },
  { href: "/register-tutor", label: "Làm gia sư" },
  { href: "/how-it-works", label: "Quy trình" },
  { href: "/contact", label: "Liên hệ" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthContext()

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
  }

  const getDashboardLink = () => {
    if (!user) return "/login"
    if (isAdminRole(user.role)) return "/admin"
    switch (user.role) {
      case "tutor":
        return "/dashboard/tutor"
      case "student":
        return "/dashboard/student"
      case "parent":
        return "/dashboard/parent"
      default:
        return "/login"
    }
  }

  const getRoleLabel = () => {
    if (!user) return ""
    if (isAdminRole(user.role)) return "Quản trị viên"
    switch (user.role) {
      case "tutor":
        return "Gia sư"
      case "student":
        return "Học sinh"
      case "parent":
        return "Phụ huynh"
      default:
        return ""
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 shadow-sm shadow-slate-950/5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="app-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/25">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden text-lg font-bold text-slate-950 sm:inline-block">
            Gia Sư Sư Phạm
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-primary/10 hover:text-primary",
                pathname === item.href
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-slate-600"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && user ? (
            <>
              <NotificationMenu userId={user.id} />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden text-left lg:block">
                      <p className="text-sm font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Hồ sơ cá nhân
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Cài đặt
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Đăng ký</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Menu</span>
        </Button>
      </div>

      {/* Mobile Menu */}
      <div
        aria-hidden={!mobileMenuOpen}
        className={cn(
          "overflow-hidden border-t border-slate-200 bg-white/95 shadow-lg shadow-slate-950/5 backdrop-blur-xl transition-[max-height,opacity,transform] duration-300 ease-out md:hidden",
          mobileMenuOpen
            ? "max-h-[540px] translate-y-0 opacity-100"
            : "pointer-events-none max-h-0 -translate-y-2 opacity-0",
        )}
      >
        <nav className="app-container flex flex-col gap-1 py-4">
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-primary/10 hover:text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="my-2 border-t" />
          {isAuthenticated && user ? (
            <>
              <Link
                href={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-primary/10 hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-primary/10 hover:text-primary"
              >
                Hồ sơ cá nhân
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-destructive hover:bg-destructive/10"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-primary/10 hover:text-primary"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20"
              >
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
