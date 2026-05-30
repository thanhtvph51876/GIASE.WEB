import type { Conversation, Message } from "@/types"
import { type CreateConversationData, messageApi } from "@/lib/api/message-api"

interface SendMessageData {
  conversationId: string
  senderId: string
  receiverId: string
  content: string
}

class MessageService {
  async getConversations(_userId: string): Promise<Conversation[]> {
    return messageApi.conversations()
  }

  async getAdminConversations(): Promise<Conversation[]> {
    return messageApi.adminConversations()
  }

  async createConversation(data: CreateConversationData): Promise<Conversation> {
    return messageApi.createConversation(data)
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return messageApi.messages(conversationId)
  }

  async sendMessage(data: SendMessageData) {
    const message = await messageApi.send(data.conversationId, data.content)
    return { success: true, message }
  }

  async markConversationAsRead(conversationId: string, _userId: string) {
    await messageApi.markRead(conversationId)
    return { success: true }
  }
}

export const messageService = new MessageService()
