"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { messageService } from "@/lib/services"
import { formatDateTime } from "@/lib/helpers"
import type { Conversation } from "@/types"

export default function AdminMessagesPage() {
  const { user } = useAuthContext()
  const [conversations, setConversations] = useState<Conversation[]>([])
  useEffect(() => { if (user) messageService.getConversations(user.id).then(setConversations) }, [user])
  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6"><h1 className="text-2xl font-bold">Tin nhắn admin</h1><p className="text-sm text-muted-foreground">Các conversation giữa admin và người dùng.</p></div>
      <Card><CardHeader><CardTitle>{conversations.length} cuộc trò chuyện</CardTitle></CardHeader><CardContent className="space-y-3">
        {conversations.map((conversation) => <div key={conversation.id} className="item-row"><p className="font-semibold">{conversation.participantNames.join(" · ")}</p><p className="mt-1 text-sm text-muted-foreground">{conversation.lastMessage}</p><p className="mt-1 text-xs text-muted-foreground">{conversation.lastMessageAt ? formatDateTime(conversation.lastMessageAt) : "Chưa có tin nhắn"}</p></div>)}
      </CardContent></Card>
    </div>
  )
}
