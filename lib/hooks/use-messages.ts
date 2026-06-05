"use client"

import { useEffect, useState } from "react"
import type { Conversation, Message, User } from "@/types"
import type { ApiPagination } from "@/lib/api/client"
import { messageService } from "@/lib/services"
import { canSendMessage } from "@/lib/permissions"
import { useToast } from "@/hooks/use-toast"

const CONVERSATION_PAGE_SIZE = 50
const MESSAGE_PAGE_SIZE = 50

function emptyPagination(pageSize: number): ApiPagination {
  return { page: 1, pageSize, total: 0, totalPages: 1 }
}

export function useMessages(user?: User | null) {
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationPagination, setConversationPagination] = useState<ApiPagination>(emptyPagination(CONVERSATION_PAGE_SIZE))
  const [selectedConversation, setSelectedConversation] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [messagePagination, setMessagePagination] = useState<ApiPagination>(emptyPagination(MESSAGE_PAGE_SIZE))
  const [loading, setLoading] = useState(true)

  const refetchConversations = async () => {
    if (!user) return
    setLoading(true)
    const result = await messageService.getConversationsPage(user.id, { page: 1, pageSize: CONVERSATION_PAGE_SIZE })
    setConversations(result.items)
    setConversationPagination(result.pagination)
    setSelectedConversation((current) => current || result.items[0]?.id || "")
    setLoading(false)
  }

  const refetchMessages = async (conversationId = selectedConversation) => {
    if (!conversationId) {
      setMessages([])
      setMessagePagination(emptyPagination(MESSAGE_PAGE_SIZE))
      return
    }
    const result = await messageService.getMessagesPage(conversationId, { page: 1, pageSize: MESSAGE_PAGE_SIZE })
    setMessages(result.items)
    setMessagePagination(result.pagination)
  }

  useEffect(() => {
    void refetchConversations()
  }, [user?.id])

  useEffect(() => {
    void refetchMessages(selectedConversation)
  }, [selectedConversation])

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!user || !selectedConversation || !content.trim()) return false
    const conversation = conversations.find((item) => item.id === selectedConversation)
    if (!canSendMessage(user, conversation)) {
      toast({ title: "Không có quyền", description: "Bạn không có quyền gửi tin nhắn trong hội thoại này.", variant: "destructive" })
      return false
    }
    const receiverId = conversation?.participantIds.find((id) => id !== user.id) || "user-admin-001"
    await messageService.sendMessage({
      conversationId: selectedConversation,
      senderId: user.id,
      receiverId,
      content,
    })
    await refetchMessages()
    await refetchConversations()
    toast({ title: "Gửi tin nhắn thành công" })
    return true
  }

  const markAsRead = async (conversationId = selectedConversation): Promise<void> => {
    if (!user || !conversationId) return
    await messageService.markConversationAsRead(conversationId, user.id)
    await refetchConversations()
  }

  return {
    conversations,
    conversationPagination,
    selectedConversation,
    setSelectedConversation,
    messages,
    messagePagination,
    loading,
    sendMessage,
    markAsRead,
    refetch: refetchConversations,
  }
}
