"use client"

import { useState, useEffect, useCallback } from "react"
import type { User, LoginFormData, RegisterFormData } from "@/types"
import { authService } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"

// ============================================
// USE AUTH HOOK
// Manages authentication state
// ============================================

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginFormData) => Promise<boolean>
  register: (data: RegisterFormData) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  loginAsAdmin: () => Promise<boolean>
  loginAsTutor: () => Promise<boolean>
  loginAsStudent: () => Promise<boolean>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Load user on mount
  useEffect(() => {
    let active = true
    authService.loadCurrentUser().then((currentUser) => {
      if (!active) return
      setUser(currentUser)
      setIsLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  // Login
  const login = useCallback(
    async (data: LoginFormData): Promise<boolean> => {
      setIsLoading(true)
      try {
        const result = await authService.login(data)

        if (result.success && result.user) {
          setUser(result.user)
          toast({
            title: "Đăng nhập thành công",
            description: `Chào mừng ${result.user.fullName}!`,
          })
          return true
        }

        toast({
          title: "Đăng nhập thất bại",
          description: result.error || "Vui lòng kiểm tra lại thông tin",
          variant: "destructive",
        })
        return false
      } catch {
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra, vui lòng thử lại",
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [toast]
  )

  // Register
  const register = useCallback(
    async (data: RegisterFormData): Promise<boolean> => {
      setIsLoading(true)
      try {
        const result = await authService.register(data)

        if (result.success && result.user) {
          setUser(result.user)
          toast({
            title: "Đăng ký thành công",
            description: "Tài khoản của bạn đã được tạo!",
          })
          return true
        }

        toast({
          title: "Đăng ký thất bại",
          description: result.error || "Vui lòng kiểm tra lại thông tin",
          variant: "destructive",
        })
        return false
      } catch {
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra, vui lòng thử lại",
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [toast]
  )

  // Logout
  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    toast({
      title: "Đã đăng xuất",
      description: "Hẹn gặp lại bạn!",
    })
  }, [toast])

  // Update profile
  const updateProfile = useCallback(
    async (data: Partial<User>): Promise<boolean> => {
      if (!user) return false

      try {
        const result = await authService.updateProfile(user.id, data)

        if (result.success && result.user) {
          setUser(result.user)
          toast({
            title: "Cập nhật thành công",
            description: "Thông tin của bạn đã được cập nhật",
          })
          return true
        }

        toast({
          title: "Cập nhật thất bại",
          description: result.error,
          variant: "destructive",
        })
        return false
      } catch {
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra, vui lòng thử lại",
          variant: "destructive",
        })
        return false
      }
    },
    [user, toast]
  )

  // Demo login helpers
  const loginAsAdmin = useCallback(async () => {
    const result = await authService.loginAsAdmin()
    if (result.success && result.user) {
      setUser(result.user)
      toast({
        title: "Đăng nhập Admin Demo",
        description: `Chào mừng ${result.user.fullName}!`,
      })
      return true
    }
    return false
  }, [toast])

  const loginAsTutor = useCallback(async () => {
    const result = await authService.loginAsTutor()
    if (result.success && result.user) {
      setUser(result.user)
      toast({
        title: "Đăng nhập Gia sư Demo",
        description: `Chào mừng ${result.user.fullName}!`,
      })
      return true
    }
    return false
  }, [toast])

  const loginAsStudent = useCallback(async () => {
    const result = await authService.loginAsStudent()
    if (result.success && result.user) {
      setUser(result.user)
      toast({
        title: "Đăng nhập Học sinh Demo",
        description: `Chào mừng ${result.user.fullName}!`,
      })
      return true
    }
    return false
  }, [toast])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    loginAsAdmin,
    loginAsTutor,
    loginAsStudent,
  }
}
