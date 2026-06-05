import type { Conversation, Message } from "@/types"
import { apiPageRequest, apiRequest, type PageRequestParams } from "./client"
import { mapConversation, mapMessage } from "./mappers"

export interface CreateConversationData {
  type: "booking" | "class" | "support"
  bookingId?: string
  classId?: string
  initialMessage?: string
  title?: string
}

export const messageApi = {
  async conversations(params?: PageRequestParams) {
    return (await this.conversationsPage(params)).items
  },
  conversationsPage(params?: PageRequestParams) {
    return apiPageRequest<Conversation>("/conversations", { params }, mapConversation)
  },
  async adminConversations(params?: PageRequestParams) {
    return (await this.adminConversationsPage(params)).items
  },
  adminConversationsPage(params?: PageRequestParams) {
    return apiPageRequest<Conversation>("/admin/conversations", { params }, mapConversation)
  },
  async createConversation(data: CreateConversationData) {
    return mapConversation(await apiRequest<Conversation>("/conversations", { method: "POST", body: data }))
  },
  async messages(conversationId: string, params?: PageRequestParams) {
    return (await this.messagesPage(conversationId, params)).items
  },
  messagesPage(conversationId: string, params?: PageRequestParams) {
    return apiPageRequest<Message>(`/conversations/${conversationId}/messages`, { params }, mapMessage)
  },
  async send(conversationId: string, content: string) {
    return mapMessage(await apiRequest<Message>(`/conversations/${conversationId}/messages`, { method: "POST", body: { content } }))
  },
  markRead(conversationId: string) {
    return apiRequest(`/conversations/${conversationId}/mark-read`, { method: "POST" })
  },
}
