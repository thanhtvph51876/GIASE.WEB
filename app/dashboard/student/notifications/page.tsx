"use client"

import Link from "next/link"
import { Bell, CheckCheck, ExternalLink, MailOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardMetricCard, EmptyState, EntityCard, PageHero } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { formatDateTime } from "@/lib/helpers"

export default function StudentNotificationsPage() {
  const { user } = useAuthContext()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.id)

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Notification center"
        title="Thông báo"
        description="Tập trung cập nhật booking, lớp học, thanh toán và hành động vận hành cần theo dõi."
        icon={Bell}
        actions={<Button variant="outline" onClick={() => markAllAsRead()} disabled={unreadCount === 0}>Đánh dấu tất cả đã đọc</Button>}
        stats={[
          { label: "Tổng thông báo", value: notifications.length },
          { label: "Chưa đọc", value: unreadCount },
          { label: "Đã đọc", value: notifications.length - unreadCount },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Tổng thông báo" value={notifications.length} icon={Bell} tone="blue" />
        <DashboardMetricCard label="Chưa đọc" value={unreadCount} icon={MailOpen} tone={unreadCount ? "amber" : "emerald"} />
        <DashboardMetricCard label="Đã xử lý" value={notifications.length - unreadCount} icon={CheckCheck} tone="emerald" />
      </div>
      {notifications.length ? (
        <div className="space-y-3">
          {notifications.map((item) => (
            <EntityCard
              key={item.id}
              title={item.title}
              subtitle={item.content || item.message}
              meta={formatDateTime(item.createdAt)}
              icon={item.read ? CheckCheck : Bell}
              tone={item.read ? "slate" : item.type === "error" ? "rose" : item.type === "warning" ? "amber" : item.type === "success" ? "emerald" : "blue"}
              badge={!item.read ? <Badge>Chưa đọc</Badge> : <Badge variant="secondary">Đã đọc</Badge>}
              actions={(
                <>
                  {!item.read && <Button size="sm" variant="outline" onClick={() => markAsRead(item.id)}>Đã đọc</Button>}
                  {(item.actionUrl || item.link) && (
                    <Button size="sm" asChild>
                      <Link href={item.actionUrl || item.link || "#"}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Mở
                      </Link>
                    </Button>
                  )}
                </>
              )}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="Chưa có thông báo" description="Các cập nhật booking, lớp học và thanh toán sẽ xuất hiện tại đây." />
      )}
    </div>
  )
}
