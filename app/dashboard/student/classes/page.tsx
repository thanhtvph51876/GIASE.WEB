"use client"

import Link from "next/link"
import { BookOpenCheck, CalendarDays, GraduationCap, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { DashboardMetricCard, EmptyState, EntityCard, InsightPanel, PageHero } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useClasses } from "@/lib/hooks/use-classes"
import { formatCurrency } from "@/lib/helpers"

export default function StudentClassesPage() {
  const { user } = useAuthContext()
  const { classes } = useClasses({ userId: user?.id, role: "student" })
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Learning hub"
        title="Lớp đang học"
        description="Tập trung lớp học thử, lớp chính thức, lịch học và tiến độ buổi học để phụ huynh theo dõi nhanh."
        icon={GraduationCap}
        actions={<Button asChild><Link href="/tutors">Tìm gia sư mới</Link></Button>}
        stats={[
          { label: "Tổng lớp", value: classes.length },
          { label: "Đang học", value: classes.filter((item) => item.status === "active").length },
          { label: "Học thử", value: classes.filter((item) => item.status === "trial").length },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Tổng lớp" value={classes.length} icon={BookOpenCheck} tone="blue" />
        <DashboardMetricCard label="Đang học" value={classes.filter((item) => item.status === "active").length} icon={Users} tone="emerald" />
        <DashboardMetricCard label="Học thử" value={classes.filter((item) => item.status === "trial").length} icon={CalendarDays} tone="amber" />
      </div>
      <InsightPanel title="Tiến độ học tập" description="Vào chi tiết lớp để xem từng session, trạng thái hoàn thành và thông tin học phí." href="/dashboard/student/schedule" />
      {classes.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {classes.map((item) => (
            <EntityCard
              key={item.id}
              title={`${item.subject} · ${item.grade}`}
              subtitle={`${item.tutorName} · ${item.scheduleText}`}
              meta={`${formatCurrency(item.feePerSession)}/buổi · ${item.completedSessions}/${item.totalSessions} buổi`}
              icon={GraduationCap}
              tone={item.status === "active" ? "emerald" : item.status === "trial" ? "amber" : "slate"}
              badge={<StatusBadge kind="class" status={item.status} />}
              actions={<Button size="sm" asChild><Link href={`/dashboard/student/classes/${item.id}`}>Xem chi tiết</Link></Button>}
            >
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, Math.round((item.completedSessions / Math.max(item.totalSessions, 1)) * 100))}%` }}
                />
              </div>
            </EntityCard>
          ))}
        </div>
      ) : (
        <EmptyState title="Chưa có lớp học" description="Lớp sẽ được tạo sau khi học thử được xác nhận." actionLabel="Đặt học thử" href="/tutors" />
      )}
    </div>
  )
}
