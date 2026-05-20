"use client"

import { useEffect, useState } from "react"
import type { Conversation, Message, User } from "@/types"
import { messageService } from "@/lib/services"
import { canSendMessage } from "@/lib/permissions"
import { useToast } from "@/hooks/use-toast"

export function useMessages(user?: User | null) {
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const refetchConversations = async () => {
    if (!user) return
    setLoading(true)
    const items = await messageService.getConversations(user.id)
    setConversations(items)
    setSelectedConversation((current) => current || items[0]?.id || "")
    setLoading(false)
  }

  const refetchMessages = async (conversationId = selectedConversation) => {
    if (!conversationId) {
      setMessages([])
      return
    }
    setMessages(await messageService.getMessages(conversationId))
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
    selectedConversation,
    setSelectedConversation,
    messages,
    loading,
    sendMessage,
    markAsRead,
    refetch: refetchConversations,
  }
}
