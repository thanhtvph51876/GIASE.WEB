"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSkeleton } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { isAdminRole } from "@/lib/permissions"

export default function DashboardRouterPage() {
  const { user, isLoading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) router.replace("/login")
    else if (isAdminRole(user.role)) router.replace("/admin")
    else if (user.role === "tutor") router.replace("/dashboard/tutor")
    else if (user.role === "parent") router.replace("/dashboard/parent")
    else router.replace("/dashboard/student")
  }, [isLoading, router, user])

  return <LoadingSkeleton label="Đang mở dashboard phù hợp..." />
}
