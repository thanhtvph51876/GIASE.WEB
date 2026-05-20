import type { User } from "@/types"
import { adminApi } from "@/lib/api/admin-api"
import { authApi } from "@/lib/api/auth-api"

class UserService {
  async getAllUsers(): Promise<User[]> {
    return adminApi.users()
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getAllUsers()
    return users.find((user) => user.id === id) || null
  }

  async updateUser(_id: string, data: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await authApi.updateProfile(data)
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật người dùng" }
    }
  }
}

export const userService = new UserService()
