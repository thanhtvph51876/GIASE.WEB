import type { ContactRequest, ContactRequestStatus, User } from "@/types"
import type { PageRequestParams } from "@/lib/api/client"
import { contactApi } from "@/lib/api/contact-api"

interface CreateContactRequestData {
  fullName: string
  email: string
  phone?: string
  message: string
}

class ContactService {
  async createContactRequest(data: CreateContactRequestData): Promise<{ success: boolean; request?: ContactRequest; error?: string }> {
    if (!data.fullName.trim() || !data.email.trim() || !data.message.trim()) {
      return { success: false, error: "Vui lòng nhập họ tên, email và nội dung." }
    }
    try {
      const request = (await contactApi.create(data)) as ContactRequest
      return { success: true, request }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể gửi liên hệ" }
    }
  }

  async getAllContactRequests(): Promise<ContactRequest[]> {
    return (await contactApi.list()) as ContactRequest[]
  }

  getAllContactRequestsPage(params?: PageRequestParams) {
    return contactApi.listPage(params)
  }

  async updateStatus(id: string, status: ContactRequestStatus, _actor?: User | null): Promise<{ success: boolean; request?: ContactRequest; error?: string }> {
    try {
      void _actor
      const request = (await contactApi.updateStatus(id, status)) as ContactRequest
      return { success: true, request }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật liên hệ" }
    }
  }
}

export const contactService = new ContactService()
