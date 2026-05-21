import type { LoginFormData, RegisterFormData, User } from "@/types"
import { authApi } from "@/lib/api/auth-api"
import { tokenStore } from "@/lib/api/client"

class AuthService {
  private currentUser: User | null = null

  async login(data: LoginFormData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await authApi.login(data)
      this.currentUser = user
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Đăng nhập thất bại" }
    }
  }

  async register(data: RegisterFormData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await authApi.register(data)
      this.currentUser = user
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Đăng ký thất bại" }
    }
  }

  async loadCurrentUser(): Promise<User | null> {
    if (!tokenStore.accessToken) {
      this.currentUser = null
      return null
    }
    try {
      this.currentUser = await authApi.me()
      return this.currentUser
    } catch {
      tokenStore.clear()
      this.currentUser = null
      return null
    }
  }

  logout(): void {
    this.currentUser = null
    void authApi.logout()
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  async updateProfile(
    _userId: string,
    data: Partial<User>
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await authApi.updateProfile(data)
      this.currentUser = user
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Cập nhật thất bại" }
    }
  }
}

export const authService = new AuthService()
