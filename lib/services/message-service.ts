import type { Conversation, Message } from "@/types"
import type { PageRequestParams } from "@/lib/api/client"
import { type CreateConversationData, messageApi } from "@/lib/api/message-api"

interface SendMessageData {
  conversationId: string
  senderId: string
  receiverId: string
  content: string
}

class MessageService {
  async getConversations(_userId: string, params?: PageRequestParams): Promise<Conversation[]> {
    return messageApi.conversations(params)
  }

  getConversationsPage(_userId: string, params?: PageRequestParams) {
    return messageApi.conversationsPage(params)
  }

  async getAdminConversations(): Promise<Conversation[]> {
    return messageApi.adminConversations()
  }

  getAdminConversationsPage(params?: PageRequestParams) {
    return messageApi.adminConversationsPage(params)
  }

  async createConversation(data: CreateConversationData): Promise<Conversation> {
    return messageApi.createConversation(data)
  }

  async getMessages(conversationId: string, params?: PageRequestParams): Promise<Message[]> {
    return messageApi.messages(conversationId, params)
  }

  getMessagesPage(conversationId: string, params?: PageRequestParams) {
    return messageApi.messagesPage(conversationId, params)
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
