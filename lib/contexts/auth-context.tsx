"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { User, LoginFormData, RegisterFormData } from "@/types"
import { authService } from "@/lib/services"
import { toast } from "sonner"

// ============================================
// AUTH CONTEXT
// Global authentication state management
// ============================================

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginFormData) => Promise<boolean>
  register: (data: RegisterFormData) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
          toast.success("Đăng nhập thành công", {
            description: `Chào mừng ${result.user.fullName}!`,
          })
          return true
        }

        toast.error("Đăng nhập thất bại", {
          description: result.error || "Vui lòng kiểm tra lại thông tin",
        })
        return false
      } catch {
        toast.error("Lỗi", {
          description: "Có lỗi xảy ra, vui lòng thử lại",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Register
  const register = useCallback(
    async (data: RegisterFormData): Promise<boolean> => {
      setIsLoading(true)
      try {
        const result = await authService.register(data)

        if (result.success && result.user) {
          setUser(result.user)
          toast.success("Đăng ký thành công", {
            description: "Tài khoản của bạn đã được tạo!",
          })
          return true
        }

        toast.error("Đăng ký thất bại", {
          description: result.error || "Vui lòng kiểm tra lại thông tin",
        })
        return false
      } catch {
        toast.error("Lỗi", {
          description: "Có lỗi xảy ra, vui lòng thử lại",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Logout
  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    toast.success("Đã đăng xuất", {
      description: "Hẹn gặp lại bạn!",
    })
  }, [])

  // Update profile
  const updateProfile = useCallback(
    async (data: Partial<User>): Promise<boolean> => {
      if (!user) return false

      try {
        const result = await authService.updateProfile(user.id, data)

        if (result.success && result.user) {
          setUser(result.user)
          toast.success("Cập nhật thành công", {
            description: "Thông tin của bạn đã được cập nhật",
          })
          return true
        }

        toast.error("Cập nhật thất bại", {
          description: result.error,
        })
        return false
      } catch {
        toast.error("Lỗi", {
          description: "Có lỗi xảy ra, vui lòng thử lại",
        })
        return false
      }
    },
    [user]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}

export const useAuth = useAuthContext
