"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSkeleton } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"

export default function NotificationsRouterPage() {
  const { user, isLoading } = useAuthContext()
  const router = useRouter()
  useEffect(() => {
    if (isLoading) return
    if (!user) router.replace("/login")
    else if (user.role === "admin") router.replace("/admin/notifications")
    else if (user.role === "tutor") router.replace("/dashboard/tutor/notifications")
    else router.replace("/dashboard/student/notifications")
  }, [isLoading, router, user])
  return <LoadingSkeleton label="Đang mở thông báo..." />
}
