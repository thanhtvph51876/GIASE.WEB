import type { LoginFormData, RegisterFormData, User } from "@/types"
import { apiRequest, tokenStore } from "./client"
import { mapUser } from "./mappers"

interface AuthPayload {
  accessToken: string
  refreshToken?: string
  user: User
  emailVerificationToken?: string
}

function persistAuth(payload: AuthPayload) {
  tokenStore.accessToken = payload.accessToken
  tokenStore.refreshToken = payload.refreshToken || null
  return mapUser(payload.user)
}

export const authApi = {
  async login(data: LoginFormData) {
    return persistAuth(await apiRequest<AuthPayload>("/auth/login", { method: "POST", body: data, auth: false }))
  },
  async register(data: RegisterFormData) {
    return persistAuth(await apiRequest<AuthPayload>("/auth/register", { method: "POST", body: data, auth: false }))
  },
  async me() {
    return mapUser(await apiRequest<User>("/auth/me"))
  },
  async updateProfile(data: Partial<User>) {
    return mapUser(await apiRequest<User>("/users/me", { method: "PATCH", body: data }))
  },
  async logout() {
    const refreshToken = tokenStore.refreshToken
    try {
      await apiRequest("/auth/logout", { method: "POST", body: refreshToken ? { refreshToken } : {} })
    } finally {
      tokenStore.clear()
    }
  },
  forgotPassword(email: string) {
    return apiRequest<{ accepted: boolean; resetToken?: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
    })
  },
  resetPassword(token: string, newPassword: string) {
    return apiRequest<{ accepted: boolean }>("/auth/reset-password", {
      method: "POST",
      body: { token, newPassword },
      auth: false,
    })
  },
  verifyEmail(token: string) {
    return apiRequest<{ verified: boolean }>("/auth/verify-email", {
      method: "POST",
      body: { token },
      auth: false,
    })
  },
}
