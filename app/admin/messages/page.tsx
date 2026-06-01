"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AdminPagination, ADMIN_PAGE_SIZE, defaultPagination } from "@/components/admin/admin-pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { messageService } from "@/lib/services"
import { formatDateTime } from "@/lib/helpers"
import type { Conversation } from "@/types"

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(defaultPagination())
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    messageService.getAdminConversationsPage({ page, pageSize: ADMIN_PAGE_SIZE })
      .then((result) => {
        setConversations(result.items)
        setPagination(result.pagination)
      })
      .catch(() => toast.error("Không tải được tin nhắn admin"))
      .finally(() => setLoading(false))
  }, [page])
  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6"><h1 className="text-2xl font-bold">Tin nhắn admin</h1><p className="text-sm text-muted-foreground">Các conversation giữa admin và người dùng.</p></div>
      <Card><CardHeader><CardTitle>{pagination.total} cuộc trò chuyện</CardTitle></CardHeader><CardContent className="space-y-3">
        {conversations.map((conversation) => <div key={conversation.id} className="item-row"><p className="font-semibold">{conversation.participantNames.join(" · ")}</p><p className="mt-1 text-sm text-muted-foreground">{conversation.lastMessage}</p><p className="mt-1 text-xs text-muted-foreground">{conversation.lastMessageAt ? formatDateTime(conversation.lastMessageAt) : "Chưa có tin nhắn"}</p></div>)}
      </CardContent></Card>
      <AdminPagination pagination={pagination} loading={loading} onPageChange={setPage} />
    </div>
  )
}
