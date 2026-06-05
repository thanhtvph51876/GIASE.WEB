"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Inbox, Mail, MessageSquare, PhoneCall } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AdminPagination, ADMIN_PAGE_SIZE, defaultPagination } from "@/components/admin/admin-pagination"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardMetricCard, EmptyState, EntityCard, PageHero } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { contactService } from "@/lib/services"
import { formatDateTime, getContactStatusLabel } from "@/lib/helpers"
import type { ContactRequest, ContactRequestStatus } from "@/types"

const statuses: ContactRequestStatus[] = ["new", "contacted", "resolved", "ignored"]

export default function AdminContactsPage() {
  const { user } = useAuthContext()
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(defaultPagination())
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ContactRequestStatus | "all">("all")
  const load = async (targetPage = page) => {
    setLoading(true)
    try {
      const result = await contactService.getAllContactRequestsPage({
        page: targetPage,
        pageSize: ADMIN_PAGE_SIZE,
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      setContacts(result.items)
      setPagination(result.pagination)
    } catch {
      toast.error("Không tải được liên hệ")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load(page) }, [page, statusFilter])
  const update = async (id: string, status: ContactRequestStatus) => {
    const result = await contactService.updateStatus(id, status, user)
    if (result.success) { toast.success("Đã cập nhật liên hệ"); load(page) } else toast.error(result.error)
  }
  const visibleContacts = statusFilter === "all" ? contacts : contacts.filter((item) => item.status === statusFilter)
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Contact inbox"
        title="Liên hệ từ website"
        description="Các yêu cầu từ form liên hệ được lưu trên backend và phân trạng thái để chăm sóc khách hàng."
        icon={MessageSquare}
        stats={[
          { label: "Tổng liên hệ", value: pagination.total },
          { label: "Mới", value: contacts.filter((item) => item.status === "new").length },
          { label: "Đã xử lý", value: contacts.filter((item) => item.status === "resolved").length },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Tổng liên hệ" value={pagination.total} icon={Inbox} tone="blue" />
        <DashboardMetricCard label="Cần gọi lại" value={contacts.filter((item) => item.status === "new").length} icon={PhoneCall} tone="amber" />
        <DashboardMetricCard label="Đã xử lý" value={contacts.filter((item) => item.status === "resolved").length} icon={CheckCircle2} tone="emerald" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3">
        <div className="text-sm text-muted-foreground">
          Luồng xử lý: Mới → Đã liên hệ → Đã xử lý. Bỏ qua dùng cho spam hoặc liên hệ không hợp lệ.
        </div>
        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value as ContactRequestStatus | "all"); setPage(1) }}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {statuses.map((status) => <SelectItem key={status} value={status}>{getContactStatusLabel(status)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {visibleContacts.length ? (
        <div className="space-y-3">
          {visibleContacts.map((contact) => (
            <EntityCard
              key={contact.id}
              title={contact.fullName}
              subtitle={`${contact.email} · ${contact.phone || "Không có SĐT"}`}
              meta={formatDateTime(contact.createdAt)}
              icon={Mail}
              tone={contact.status === "resolved" ? "emerald" : contact.status === "ignored" ? "slate" : contact.status === "contacted" ? "blue" : "amber"}
              badge={<Badge variant="secondary">{getContactStatusLabel(contact.status)}</Badge>}
              actions={(
                <>
                  <ContactDetailDialog contact={contact} />
                  {statuses.map((status) => (
                    <Button key={status} size="sm" variant={contact.status === status ? "default" : "outline"} onClick={() => update(contact.id, status)}>
                      {getContactStatusLabel(status)}
                    </Button>
                  ))}
                </>
              )}
            >
              <div className="space-y-2">
                <p className="text-sm leading-6 text-slate-700">{contact.message}</p>
                <p className="text-xs text-muted-foreground">Cập nhật gần nhất: {contact.updatedAt ? formatDateTime(contact.updatedAt) : "Chưa cập nhật"} · Người tiếp nhận: {rawText(contact, "handledBy", "assignedToName") || "Chưa tiếp nhận"}</p>
              </div>
            </EntityCard>
          ))}
        </div>
      ) : (
        <EmptyState title="Chưa có liên hệ" description="Khi khách gửi form ở trang chủ, yêu cầu sẽ xuất hiện tại đây." />
      )}
      <AdminPagination pagination={pagination} loading={loading} onPageChange={setPage} />
    </div>
  )
}

function ContactDetailDialog({ contact }: { contact: ContactRequest }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Chi tiết</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{contact.fullName}</DialogTitle>
          <DialogDescription>Thông tin tiếp nhận và trạng thái chăm sóc liên hệ.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Email" value={contact.email} />
          <Info label="SĐT" value={contact.phone || "Không nhập"} />
          <Info label="Trạng thái" value={getContactStatusLabel(contact.status)} />
          <Info label="Tạo lúc" value={formatDateTime(contact.createdAt)} />
          <Info label="Cập nhật" value={contact.updatedAt ? formatDateTime(contact.updatedAt) : "Chưa cập nhật"} />
          <Info label="Người xử lý" value={rawText(contact, "handledBy", "assignedToName") || "Chưa tiếp nhận"} />
          <Info label="Xử lý lúc" value={contact.handledAt ? formatDateTime(contact.handledAt) : "Chưa xử lý"} />
          <div className="rounded-lg border bg-slate-50 p-3 md:col-span-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Nội dung</p>
            <p className="mt-1 text-sm leading-6 text-slate-900">{contact.message}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function rawText(item: unknown, ...keys: string[]) {
  const raw = item && typeof item === "object" ? item as Record<string, unknown> : {}
  for (const key of keys) {
    const value = raw[key]
    if (value !== undefined && value !== null && String(value).trim()) return String(value)
  }
  return ""
}
