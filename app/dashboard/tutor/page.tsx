"use client"

import Link from "next/link"
import useSWR from "swr"
import { AlertCircle, BookOpen, Calendar, CheckCircle2, CircleDashed, ShieldCheck, Star, Users, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useBookings } from "@/lib/hooks/use-bookings"
import { useClasses } from "@/lib/hooks/use-classes"
import { useTutorLearningRequests } from "@/lib/hooks/use-learning-requests"
import { useReviews } from "@/lib/hooks/use-reviews"
import { useSchedule } from "@/lib/hooks/use-schedule"
import { useTutorEarnings } from "@/lib/hooks/use-tutor-earnings"
import { useTutorProfileByUser } from "@/lib/hooks/use-tutors"
import { useTutorVerifications } from "@/lib/hooks/use-verifications"
import { tutorService } from "@/lib/services"
import { formatCurrency, formatDateTime, getStatusLabel } from "@/lib/helpers"
import type { TutorApprovalEligibility } from "@/types"

export default function TutorDashboardPage() {
  const { user } = useAuthContext()
  const { tutor } = useTutorProfileByUser(user?.id)
  const { bookings } = useBookings({ tutorId: tutor?.id, role: "tutor", user, tutorProfile: tutor })
  const { requests } = useTutorLearningRequests(tutor?.id)
  const { sessions } = useSchedule({ userId: tutor?.id || "", role: "tutor", actor: user })
  const { reviews } = useReviews(tutor?.id)
  const { totalEarnings } = useTutorEarnings(Boolean(tutor?.id))
  const { classes } = useClasses({ tutorId: tutor?.id, role: "tutor" })
  const { latest: verification } = useTutorVerifications(Boolean(user))
  const eligibilityQuery = useSWR(user ? "tutor-dashboard-eligibility" : null, () => tutorService.getMyApprovalEligibility(), { revalidateOnFocus: false })

  const income = totalEarnings
  const pending = bookings.filter((booking) => booking.status === "pending" || booking.status === "assigned").length + requests.filter((request) => request.status === "matched").length
  const onboardingItems = buildOnboardingItems(tutor, verification, eligibilityQuery.data)
  const onboardingDone = onboardingItems.filter((item) => item.status === "DONE").length
  const canReceiveLeads = tutor?.approvalStatus === "approved" && eligibilityQuery.data?.eligibleForApproval !== false

  return (
    <div className="space-y-6">
      <div className="surface-panel overflow-hidden border-l-4 border-l-primary p-6">
        <p className="text-sm font-semibold text-primary">Xin chào, {user?.fullName}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Quản lý lớp dạy và hồ sơ gia sư</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Theo dõi yêu cầu mới, lịch dạy, thu nhập và đánh giá trong một dashboard.</p>
      </div>

      {tutor && tutor.approvalStatus !== "approved" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-amber-800">
            Hồ sơ của bạn đang ở trạng thái <b>{getStatusLabel("approval", tutor.approvalStatus)}</b>. Một số tính năng sẽ bị giới hạn cho đến khi admin duyệt.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">Xác thực giấy tờ</p>
                <StatusBadge kind="verification" status={verification?.status || "draft"} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {verification?.status === "approved"
                  ? "Hồ sơ giấy tờ đã được duyệt."
                  : verification?.status === "pending_review"
                    ? "Hồ sơ đang chờ admin duyệt."
                    : verification?.rejectReason || "Hoàn tất xác thực để mở payout và các thao tác nhạy cảm."}
              </p>
            </div>
          </div>
          <Button asChild variant={verification?.status === "approved" ? "outline" : "default"}>
            <Link href="/dashboard/tutor/verification">{verification?.status === "approved" ? "Xem hồ sơ" : "Xác thực ngay"}</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className={canReceiveLeads ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Checklist nhận lớp</CardTitle>
            <CardDescription className={canReceiveLeads ? "text-emerald-700" : "text-amber-700"}>
              {canReceiveLeads
                ? "Hồ sơ của bạn đã sẵn sàng nhận lead và gửi proposal."
                : "Bạn chưa thể nhận lớp/gửi proposal cho đến khi hoàn tất hồ sơ và xác thực."}
            </CardDescription>
          </div>
          <Button asChild variant={canReceiveLeads ? "default" : "outline"}>
            <Link href={canReceiveLeads ? "/dashboard/tutor/leads" : "/dashboard/tutor/verification"}>
              {canReceiveLeads ? "Xem lead phù hợp" : "Hoàn tất xác thực"}
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-3 text-sm font-medium text-slate-800">
            Đã hoàn thành {onboardingDone}/{onboardingItems.length} bước
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {onboardingItems.map((item) => (
              <Link key={item.label} href={item.href} className="rounded-lg border bg-white p-3 transition hover:border-primary/40 hover:bg-slate-50">
                <div className="flex items-start gap-2">
                  {item.status === "DONE"
                    ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                    : item.status === "REJECTED"
                      ? <AlertCircle className="mt-0.5 h-4 w-4 text-rose-600" />
                      : <CircleDashed className="mt-0.5 h-4 w-4 text-amber-600" />}
                  <div>
                    <p className="font-medium text-slate-950">{item.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat title="Lớp đang dạy" value={classes.filter((item) => item.status === "active" || item.status === "trial").length} icon={Users} />
        <Stat title="Buổi dạy tuần này" value={sessions.filter((s) => s.status === "upcoming").length} icon={Calendar} />
        <Stat title="Thu nhập tháng này" value={formatCurrency(income)} icon={Wallet} />
        <Stat title="Rating trung bình" value={(tutor?.rating || 0).toFixed(1)} icon={Star} />
        <Stat title="Yêu cầu mới" value={pending} icon={BookOpen} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Yêu cầu dạy học mới</CardTitle><CardDescription>Booking học thử và request được admin gán.</CardDescription></div>
            <Button variant="ghost" asChild><Link href="/dashboard/tutor/requests">Xem tất cả</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...bookings.filter((b) => b.status === "pending").slice(0, 3), ...requests.slice(0, 2)].length ? (
              <>
                {bookings.filter((b) => b.status === "pending" || b.status === "assigned").slice(0, 3).map((booking) => (
                  <div key={booking.id} className="item-row">
                    <p className="font-medium">{booking.studentName} · {booking.subject}</p>
                    <p className="text-sm text-muted-foreground">{booking.grade} · {booking.preferredTime}</p>
                  </div>
                ))}
                {requests.slice(0, 2).map((request) => (
                  <div key={request.id} className="item-row">
                    <p className="font-medium">{request.studentName} · {request.subject}</p>
                    <p className="text-sm text-muted-foreground">{request.grade} · {request.preferredSchedule || "Linh hoạt"}</p>
                  </div>
                ))}
              </>
            ) : <p className="text-sm text-muted-foreground">Chưa có yêu cầu mới.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Lịch dạy sắp tới</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {sessions.filter((s) => s.status === "upcoming").slice(0, 4).map((session) => (
              <div key={session.id} className="item-row flex items-center justify-between">
                <div>
                  <p className="font-medium">{session.subject} · {session.studentName}</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(session.startTime)}</p>
                </div>
                <StatusBadge kind="teachingMode" status={session.mode} />
              </div>
            ))}
            {!sessions.filter((s) => s.status === "upcoming").length && <p className="text-sm text-muted-foreground">Chưa có lịch dạy sắp tới.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Đánh giá gần đây</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="item-row">
              <div className="flex items-center gap-1 text-amber-500">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
              <p className="mt-2 text-sm font-medium">{review.studentName}</p>
            </div>
          ))}
          {!reviews.length && <p className="text-sm text-muted-foreground">Chưa có đánh giá.</p>}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ title, value, icon: Icon }: { title: string; value: string | number; icon: typeof Users }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
        <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  )
}

function buildOnboardingItems(
  tutor: ReturnType<typeof useTutorProfileByUser>["tutor"],
  verification: ReturnType<typeof useTutorVerifications>["latest"],
  eligibility?: TutorApprovalEligibility
) {
  const checklist = eligibility?.checklist
  const profileComplete = Boolean(tutor?.fullName && tutor.bio && tutor.pricePerHour && tutor.teachingMethod)
  const hasSubjects = Boolean(tutor?.subjects?.length && tutor?.grades?.length)
  const hasAreas = Boolean(tutor?.teachingModes && (tutor.teachingModes === "online" || tutor?.locations?.length))
  const hasSlots = Boolean(tutor?.availableSlots?.length)
  const rejected = verification?.status === "rejected"

  return [
    {
      label: "Hoàn thiện thông tin cá nhân",
      description: profileComplete ? "Thông tin cơ bản đã đủ." : "Bổ sung bio, học phí và phương pháp dạy.",
      href: "/dashboard/tutor/profile",
      status: profileComplete ? "DONE" : "PENDING",
    },
    {
      label: "Thêm môn/lớp dạy",
      description: hasSubjects ? "Đã có môn và khối lớp." : "Cần chọn môn học và lớp có thể dạy.",
      href: "/dashboard/tutor/profile",
      status: hasSubjects ? "DONE" : "PENDING",
    },
    {
      label: "Thêm khu vực/hình thức",
      description: hasAreas ? "Đã có khu vực hoặc hình thức dạy." : "Cần khu vực/hình thức để matching chính xác.",
      href: "/dashboard/tutor/profile",
      status: hasAreas ? "DONE" : "PENDING",
    },
    {
      label: "Thêm lịch rảnh",
      description: hasSlots ? "Đã có lịch rảnh." : "Lịch rảnh giúp phụ huynh chọn lịch học thử.",
      href: "/dashboard/tutor/profile",
      status: hasSlots ? "DONE" : "PENDING",
    },
    {
      label: "Upload giấy tờ danh tính",
      description: checklist?.identityApproved ? "Danh tính đã được duyệt." : rejected ? verification?.rejectReason || "Giấy tờ cần bổ sung." : "Cần giấy tờ để admin duyệt.",
      href: "/dashboard/tutor/verification",
      status: checklist?.identityApproved ? "DONE" : rejected ? "REJECTED" : "PENDING",
    },
    {
      label: "Upload bằng cấp/chứng chỉ",
      description: checklist?.certificateApproved ? "Bằng cấp/chứng chỉ đã duyệt." : "Bổ sung bằng cấp hoặc chứng chỉ liên quan.",
      href: "/dashboard/tutor/verification",
      status: checklist?.certificateApproved ? "DONE" : "PENDING",
    },
    {
      label: "Ký bản cam kết",
      description: checklist?.commitmentSigned ? "Đã ký bản cam kết." : "Cần ký cam kết trách nhiệm trước khi nhận lớp.",
      href: "/dashboard/tutor/verification",
      status: checklist?.commitmentSigned ? "DONE" : "PENDING",
    },
    {
      label: "Chờ admin duyệt",
      description: tutor?.approvalStatus === "approved" ? "Admin đã duyệt hồ sơ." : `Trạng thái hiện tại: ${tutor?.approvalStatus || "chưa có hồ sơ"}.`,
      href: "/dashboard/tutor/verification",
      status: tutor?.approvalStatus === "approved" ? "DONE" : rejected ? "REJECTED" : "IN_REVIEW",
    },
    {
      label: "Đủ điều kiện nhận lớp",
      description: tutor?.approvalStatus === "approved" ? "Có thể xem lead và gửi proposal." : "Hoàn tất các bước trên để mở lead.",
      href: "/dashboard/tutor/leads",
      status: tutor?.approvalStatus === "approved" ? "DONE" : "PENDING",
    },
  ] as Array<{ label: string; description: string; href: string; status: "DONE" | "PENDING" | "REJECTED" | "IN_REVIEW" }>
}
