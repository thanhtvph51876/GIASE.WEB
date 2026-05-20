"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { formatRelativeTime } from "@/lib/helpers"

interface NotificationMenuProps {
  userId?: string
}

export function NotificationMenu({ userId }: NotificationMenuProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Thông báo</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Thông báo</span>
          {unreadCount > 0 && (
            <button type="button" className="text-xs font-normal text-primary" onClick={() => markAllAsRead()}>
              Đánh dấu đã đọc
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.slice(0, 8).length ? (
          notifications.slice(0, 8).map((notification) => {
            const body = notification.content || notification.message || ""
            const item = (
              <DropdownMenuItem
                key={notification.id}
                className="flex cursor-pointer items-start gap-2 whitespace-normal"
                onClick={() => markAsRead(notification.id)}
              >
                {!notification.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                <div className="min-w-0">
                  <p className="font-medium">{notification.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{formatRelativeTime(notification.createdAt)}</p>
                </div>
              </DropdownMenuItem>
            )

            return notification.link ? (
              <Link key={notification.id} href={notification.link}>
                {item}
              </Link>
            ) : (
              item
            )
          })
        ) : (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">Chưa có thông báo.</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
