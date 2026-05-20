"use client"

import { useEffect, useState } from "react"
import { LifeBuoy, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useMessages } from "@/lib/hooks/use-messages"
import { formatDateTime } from "@/lib/helpers"
import { messageService } from "@/lib/services"

export default function StudentMessagesPage() {
  const { user } = useAuthContext()
  const { conversations, selectedConversation, setSelectedConversation, messages, sendMessage, refetch } = useMessages(user)
  const [content, setContent] = useState("")

  useEffect(() => {
    const conversationId = new URLSearchParams(window.location.search).get("conversationId")
    if (conversationId) setSelectedConversation(conversationId)
  }, [setSelectedConversation])

  const send = async () => {
    const ok = await sendMessage(content)
    if (ok) setContent("")
  }

  const openSupport = async () => {
    const conversation = await messageService.createConversation({ type: "support" })
    await refetch()
    setSelectedConversation(conversation.id)
  }

  return (
    <div className="space-y-5">
      <div className="surface-panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Tin nhắn</h1>
          <p className="text-muted-foreground">Trao đổi nhanh giữa học sinh, phụ huynh, gia sư và nhà trường.</p>
        </div>
        <Button variant="outline" onClick={openSupport} className="gap-2">
          <LifeBuoy className="size-4" />Liên hệ hỗ trợ
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cuộc trò chuyện</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            {conversations.length ? conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`w-full rounded-lg p-3 text-left text-sm font-medium transition ${selectedConversation === conversation.id ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-slate-700 hover:bg-primary/10 hover:text-primary"}`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <b>{conversation.participantNames.join(" · ")}</b>
                <p className="truncate opacity-80">{conversation.lastMessage}</p>
              </button>
            )) : <Empty text="Chưa có cuộc trò chuyện nào." />}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex h-[560px] flex-col p-4">
            <div className="flex-1 space-y-3 overflow-y-auto">
              {messages.length ? messages.map((message) => (
                <div key={message.id} className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-lg px-4 py-2 text-sm shadow-sm ${message.senderId === user?.id ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-800"}`}>
                    <p>{message.content}</p>
                    <p className="mt-1 text-[11px] opacity-70">{formatDateTime(message.createdAt)}</p>
                  </div>
                </div>
              )) : <Empty text="Chọn một cuộc trò chuyện để bắt đầu nhắn tin." />}
            </div>
            <div className="mt-4 flex gap-2">
              <Input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Nhập tin nhắn..." />
              <Button onClick={send} disabled={!selectedConversation || !content.trim()} className="gap-2"><Send className="size-4" />Gửi</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed bg-slate-50 p-4 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}
