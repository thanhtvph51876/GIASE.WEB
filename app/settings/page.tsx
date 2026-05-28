"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSkeleton } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { isAdminRole } from "@/lib/permissions"

export default function SettingsRouterPage() {
  const { user, isLoading } = useAuthContext()
  const router = useRouter()
  useEffect(() => {
    if (isLoading) return
    if (!user) router.replace("/login")
    else if (isAdminRole(user.role)) router.replace("/admin/settings")
    else if (user.role === "tutor") router.replace("/dashboard/tutor/settings")
    else router.replace("/dashboard/student/settings")
  }, [isLoading, router, user])
  return <LoadingSkeleton label="Đang mở cài đặt..." />
}
