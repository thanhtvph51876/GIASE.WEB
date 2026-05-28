"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/lib/contexts/auth-context"
import type { UserRole } from "@/types"
import { Spinner } from "@/components/ui/spinner"
import { isAdminRole } from "@/lib/permissions"

// ============================================
// ROUTE GUARD COMPONENT
// Protects routes based on authentication and role
// ============================================

interface RouteGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function RouteGuard({
  children,
  allowedRoles,
  redirectTo = "/login",
}: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    // Not authenticated
    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    // Check role if specified
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized")
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, redirectTo, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Wrong role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}

// ============================================
// UNAUTHORIZED PAGE COMPONENT
// ============================================

export function UnauthorizedPage() {
  const router = useRouter()
  const { user } = useAuthContext()

  const handleGoBack = () => {
    if (user) {
      if (isAdminRole(user.role)) {
        router.push("/admin")
        return
      }
      switch (user.role) {
        case "tutor":
          router.push("/dashboard/tutor")
          break
        case "student":
          router.push("/dashboard/student")
          break
        case "parent":
          router.push("/dashboard/parent")
          break
        default:
          router.push("/")
      }
    } else {
      router.push("/")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-destructive">403</h1>
        <h2 className="mt-2 text-2xl font-semibold">Không có quyền truy cập</h2>
        <p className="mt-2 text-muted-foreground">
          Bạn không có quyền truy cập trang này.
        </p>
        <button
          onClick={handleGoBack}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Quay lại
        </button>
      </div>
    </div>
  )
}

// ============================================
// HIGHER ORDER COMPONENT FOR ROUTE PROTECTION
// ============================================

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <RouteGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </RouteGuard>
    )
  }
}
