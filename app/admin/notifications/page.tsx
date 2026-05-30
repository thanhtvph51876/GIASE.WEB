"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DashboardMetricCard, EmptyState, PageHero } from "@/components/platform/operational-components"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { hasAdminPermission } from "@/lib/admin/admin-permissions"
import { notificationService } from "@/lib/services"
import { formatDateTime } from "@/lib/helpers"
import type { Notification, NotificationType, UserRole } from "@/types"

const roles: Array<UserRole | "all"> = ["all", "student", "parent", "tutor", "admin"]
const types: NotificationType[] = ["info", "success", "warning", "error"]

export default function AdminNotificationsPage() {
  const { user } = useAuthContext()
  const canSend = hasAdminPermission(user, "notifications.send")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [targetRole, setTargetRole] = useState<UserRole | "all">("all")
  const [userId, setUserId] = useState("")
  const [type, setType] = useState<NotificationType>("info")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [link, setLink] = useState("")
  const [loading, setLoading] = useState(false)

  const load = async () => setNotifications(await notificationService.getAdminNotifications())
  useEffect(() => { load().catch(() => toast.error("Không tải được notification admin")) }, [])

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications])

  const send = async (_reason: string, note: string) => {
    if (!title.trim() || !content.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung")
      return
    }
    if (!userId.trim()) {
      toast.error("Backend hiện yêu cầu User ID cụ thể khi gửi notification admin")
      return
    }
    setLoading(true)
    const result = await notificationService.sendAdminNotification({
      userId: userId.trim(),
      targetRole: targetRole === "all" ? undefined : targetRole,
      type,
      title,
      content,
      message: content,
      link: link.trim() || undefined,
      actionUrl: link.trim() || undefined,
    })
    setLoading(false)
    if (result.success) {
      toast.success("Đã gửi thông báo")
      setTitle("")
      setContent("")
      setLink("")
      setUserId("")
      await load()
    } else {
      toast.error(result.error || "Không thể gửi thông báo", { description: note })
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Admin notifications"
        title="Trung tâm thông báo"
        description="Xem log thông báo toàn hệ thống và gửi thông báo theo role hoặc user cụ thể."
        icon={Bell}
        stats={[
          { label: "Tổng thông báo", value: notifications.length },
          { label: "Chưa đọc", value: unreadCount },
          { label: "Có quyền gửi", value: canSend ? "Có" : "Chỉ xem" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Tổng thông báo" value={notifications.length} icon={Bell} tone="blue" />
        <DashboardMetricCard label="Chưa đọc" value={unreadCount} icon={Bell} tone={unreadCount ? "amber" : "emerald"} />
        <DashboardMetricCard label="Quyền gửi" value={canSend ? "Có" : "Chỉ xem"} icon={Send} tone={canSend ? "emerald" : "slate"} />
      </div>

      {canSend && (
        <Card>
          <CardHeader>
            <CardTitle>Gửi thông báo</CardTitle>
          <CardDescription>Thông báo admin đi qua endpoint `/admin/notifications/send`; backend hiện nhận User ID cụ thể.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Target role</Label>
              <Select value={targetRole} onValueChange={(value) => setTargetRole(value as UserRole | "all")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roles.map((role) => <SelectItem key={role} value={role}>{role === "all" ? "Tất cả" : role}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>User ID cụ thể</Label>
              <Input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Bắt buộc theo backend hiện tại" />
            </div>
            <div className="space-y-2">
              <Label>Loại</Label>
              <Select value={type} onValueChange={(value) => setType(value as NotificationType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{types.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Link</Label>
              <Input value={link} onChange={(event) => setLink(event.target.value)} placeholder="/dashboard hoặc /admin/..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Tiêu đề</Label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Nội dung</Label>
              <Textarea value={content} onChange={(event) => setContent(event.target.value)} rows={4} />
            </div>
            <div className="md:col-span-2">
              <ConfirmReasonDialog
                trigger={<Button disabled={loading || !title.trim() || !content.trim() || !userId.trim()}><Send className="h-4 w-4" />Gửi thông báo</Button>}
                title="Xác nhận gửi thông báo"
                description="Thông báo sẽ được gửi tới nhóm người dùng đã chọn."
                actionName="Gửi"
                severity="warning"
                requireReason={false}
                onConfirm={send}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Log thông báo</CardTitle>
          <CardDescription>{notifications.length} thông báo mới nhất từ backend admin endpoint.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length ? notifications.map((item) => (
            <div key={item.id} className="item-row">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.content || item.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(item.createdAt)} · {item.userId || item.targetRole || "target"}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{item.type}</Badge>
                  <Badge variant={item.read ? "outline" : "default"}>{item.read ? "Đã đọc" : "Chưa đọc"}</Badge>
                </div>
              </div>
            </div>
          )) : <EmptyState title="Chưa có notification" description="Log thông báo toàn hệ thống sẽ xuất hiện tại đây." />}
        </CardContent>
      </Card>
    </div>
  )
}
