"use client"

import Link from "next/link"
import { BookOpenCheck, CalendarDays, GraduationCap, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { DashboardMetricCard, EmptyState, EntityCard, InsightPanel, PageHero } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useClasses } from "@/lib/hooks/use-classes"
import { useTutorProfileByUser } from "@/lib/hooks/use-tutors"
import { formatCurrency } from "@/lib/helpers"

export default function TutorClassesPage() {
  const { user } = useAuthContext()
  const { tutor } = useTutorProfileByUser(user?.id)
  const { classes } = useClasses({ tutorId: tutor?.id, role: "tutor" })
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Teaching hub"
        title="Lớp đang dạy"
        description="Theo dõi học viên, lịch dạy, tiến độ session và học phí từng lớp trong cùng một màn hình."
        icon={GraduationCap}
        actions={<Button asChild><Link href="/dashboard/tutor/schedule">Lịch dạy</Link></Button>}
        stats={[
          { label: "Tổng lớp", value: classes.length },
          { label: "Active", value: classes.filter((item) => item.status === "active").length },
          { label: "Học thử", value: classes.filter((item) => item.status === "trial").length },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Tổng lớp" value={classes.length} icon={BookOpenCheck} tone="blue" />
        <DashboardMetricCard label="Active" value={classes.filter((item) => item.status === "active").length} icon={Users} tone="emerald" />
        <DashboardMetricCard label="Học thử" value={classes.filter((item) => item.status === "trial").length} icon={CalendarDays} tone="amber" />
      </div>
      <InsightPanel title="Session cần hoàn tất" description="Mở chi tiết lớp để đánh dấu buổi học hoàn thành, vắng mặt hoặc hủy lịch khi cần." href="/dashboard/tutor/schedule" />
      {classes.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {classes.map((item) => (
            <EntityCard
              key={item.id}
              title={`${item.studentName} · ${item.subject}`}
              subtitle={`${item.grade} · ${item.scheduleText}`}
              meta={`${formatCurrency(item.feePerSession)}/buổi · ${item.completedSessions}/${item.totalSessions} buổi`}
              icon={GraduationCap}
              tone={item.status === "active" ? "emerald" : item.status === "trial" ? "amber" : "slate"}
              badge={<StatusBadge kind="class" status={item.status} />}
              actions={<Button size="sm" asChild><Link href={`/dashboard/tutor/classes/${item.id}`}>Chi tiết</Link></Button>}
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
        <EmptyState title="Chưa có lớp dạy" description="Lớp sẽ xuất hiện khi booking học thử được chấp nhận hoặc admin gán lớp." />
      )}
    </div>
  )
}
