import type { Conversation, Message } from "@/types"
import { apiRequest } from "./client"
import { mapConversation, mapList, mapMessage } from "./mappers"

export interface CreateConversationData {
  type: "booking" | "class" | "support"
  bookingId?: string
  classId?: string
  initialMessage?: string
  title?: string
}

export const messageApi = {
  async conversations() {
    return mapList(await apiRequest<Conversation[]>("/conversations"), mapConversation)
  },
  async createConversation(data: CreateConversationData) {
    return mapConversation(await apiRequest<Conversation>("/conversations", { method: "POST", body: data }))
  },
  async messages(conversationId: string) {
    return mapList(await apiRequest<Message[]>(`/conversations/${conversationId}/messages`), mapMessage)
  },
  async send(conversationId: string, content: string) {
    return mapMessage(await apiRequest<Message>(`/conversations/${conversationId}/messages`, { method: "POST", body: { content } }))
  },
  markRead(conversationId: string) {
    return apiRequest(`/conversations/${conversationId}/mark-read`, { method: "POST" })
  },
}
