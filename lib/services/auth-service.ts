import type { LoginFormData, RegisterFormData, User } from "@/types"
import { authApi } from "@/lib/api/auth-api"
import { isAuthApiError, isTransientApiError, tokenStore } from "@/lib/api/client"
import { storage, STORAGE_KEYS } from "@/lib/storage"

class AuthService {
  private currentUser: User | null = null

  async login(data: LoginFormData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await authApi.login(data)
      this.setCurrentUser(user)
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Đăng nhập thất bại" }
    }
  }

  async register(data: RegisterFormData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await authApi.register(data)
      this.setCurrentUser(user)
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Đăng ký thất bại" }
    }
  }

  async loadCurrentUser(): Promise<User | null> {
    if (!tokenStore.accessToken && !tokenStore.refreshToken) {
      this.clearSessionState()
      return null
    }
    const cachedUser = this.getCachedUser()
    try {
      this.setCurrentUser(await authApi.me())
      return this.currentUser
    } catch (error) {
      if (isAuthApiError(error)) {
        this.clearSessionState()
        tokenStore.clear()
        return null
      }
      if (isTransientApiError(error) && cachedUser) {
        this.currentUser = cachedUser
        return cachedUser
      }
      this.currentUser = cachedUser
      return null
    }
  }

  logout(): void {
    const logoutRequest = authApi.logout()
    this.clearLocalSession()
    void logoutRequest.catch(() => undefined)
  }

  clearLocalSession(): void {
    this.clearSessionState()
    tokenStore.clear()
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
      this.setCurrentUser(user)
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Cập nhật thất bại" }
    }
  }

  private setCurrentUser(user: User) {
    this.currentUser = user
    storage.set(STORAGE_KEYS.AUTH_USER, user)
  }

  private getCachedUser(): User | null {
    return storage.get<User | null>(STORAGE_KEYS.AUTH_USER, null)
  }

  private clearSessionState() {
    this.currentUser = null
    storage.remove(STORAGE_KEYS.AUTH_USER)
  }
}

export const authService = new AuthService()
