"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSkeleton } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"

export default function DashboardRouterPage() {
  const { user, isLoading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) router.replace("/login")
    else if (user.role === "admin") router.replace("/admin")
    else if (user.role === "tutor") router.replace("/dashboard/tutor")
    else router.replace("/dashboard/student")
  }, [isLoading, router, user])

  return <LoadingSkeleton label="Đang mở dashboard phù hợp..." />
}
