"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Inbox, Mail, MessageSquare, PhoneCall } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardMetricCard, EmptyState, EntityCard, PageHero } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { contactService } from "@/lib/services"
import { formatDateTime } from "@/lib/helpers"
import type { ContactRequest, ContactRequestStatus } from "@/types"

const statuses: ContactRequestStatus[] = ["new", "contacted", "resolved", "ignored"]
const statusLabels: Record<ContactRequestStatus, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  resolved: "Đã xử lý",
  ignored: "Bỏ qua",
}

export default function AdminContactsPage() {
  const { user } = useAuthContext()
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const load = async () => setContacts(await contactService.getAllContactRequests())
  useEffect(() => { load() }, [])
  const update = async (id: string, status: ContactRequestStatus) => {
    const result = await contactService.updateStatus(id, status, user)
    if (result.success) { toast.success("Đã cập nhật liên hệ"); load() } else toast.error(result.error)
  }
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Contact inbox"
        title="Liên hệ từ website"
        description="Các yêu cầu từ form liên hệ được lưu trên backend và phân trạng thái để chăm sóc khách hàng."
        icon={MessageSquare}
        stats={[
          { label: "Tổng liên hệ", value: contacts.length },
          { label: "Mới", value: contacts.filter((item) => item.status === "new").length },
          { label: "Đã xử lý", value: contacts.filter((item) => item.status === "resolved").length },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Tổng liên hệ" value={contacts.length} icon={Inbox} tone="blue" />
        <DashboardMetricCard label="Cần gọi lại" value={contacts.filter((item) => item.status === "new").length} icon={PhoneCall} tone="amber" />
        <DashboardMetricCard label="Đã xử lý" value={contacts.filter((item) => item.status === "resolved").length} icon={CheckCircle2} tone="emerald" />
      </div>
      {contacts.length ? (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <EntityCard
              key={contact.id}
              title={contact.fullName}
              subtitle={`${contact.email} · ${contact.phone || "Không có SĐT"}`}
              meta={formatDateTime(contact.createdAt)}
              icon={Mail}
              tone={contact.status === "resolved" ? "emerald" : contact.status === "ignored" ? "slate" : contact.status === "contacted" ? "blue" : "amber"}
              badge={<Badge variant="secondary">{statusLabels[contact.status]}</Badge>}
              actions={(
                <>
                  {statuses.map((status) => (
                    <Button key={status} size="sm" variant={contact.status === status ? "default" : "outline"} onClick={() => update(contact.id, status)}>
                      {statusLabels[status]}
                    </Button>
                  ))}
                </>
              )}
            >
              <p className="text-sm leading-6 text-slate-700">{contact.message}</p>
            </EntityCard>
          ))}
        </div>
      ) : (
        <EmptyState title="Chưa có liên hệ" description="Khi khách gửi form ở trang chủ, yêu cầu sẽ xuất hiện tại đây." />
      )}
    </div>
  )
}
