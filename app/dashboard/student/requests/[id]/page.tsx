"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, CalendarCheck, CreditCard, GraduationCap, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { ConfirmReasonDialog, type ReasonOption } from "@/components/dashboard/confirm-reason-dialog"
import { DashboardMetricCard, EmptyState, ErrorState, LoadingSkeleton, PageHero, RequestStatusTimeline } from "@/components/platform/operational-components"
import { learningRequestService } from "@/lib/services/learning-request-service"
import { bookingService, classService, paymentService } from "@/lib/services"
import { formatCurrency, formatDate, getStatusLabel } from "@/lib/helpers"
import type { Class as LearningClass, LearningRequest, Payment, TrialBooking } from "@/types"

const cancelReasons: ReasonOption[] = [
  { value: "FOUND_TUTOR", label: "Đã tìm được gia sư" },
  { value: "NO_LONGER_NEEDED", label: "Không còn nhu cầu" },
  { value: "WRONG_INFORMATION", label: "Thông tin yêu cầu bị sai" },
  { value: "OTHER", label: "Lý do khác" },
]

export default function StudentRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [request, setRequest] = useState<LearningRequest | null>(null)
  const [bookings, setBookings] = useState<TrialBooking[]>([])
  const [classes, setClasses] = useState<LearningClass[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const detail = await learningRequestService.getRequestById(id)
      if (!detail) throw new Error("Không tìm thấy yêu cầu học.")
      const [bookingRows, classRows, paymentRows] = await Promise.all([
        bookingService.getBookingsByUser(detail.userId || ""),
        classService.getClassesByStudent(detail.userId || ""),
        paymentService.getPaymentsByStudent(detail.userId || ""),
      ])
      setRequest(detail)
      setBookings(bookingRows.filter((item) => item.learningRequestId === id))
      setClasses(classRows.filter((item) => item.learningRequestId === id))
      setPayments(paymentRows.filter((item) => classRows.some((learningClass) => learningClass.learningRequestId === id && learningClass.id === item.classId)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được chi tiết yêu cầu.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const cancelRequest = async (reason: string, note: string) => {
    setCancelling(true)
    const finalReason = reason === "OTHER" ? note : `${reason}${note ? `: ${note}` : ""}`
    const result = await learningRequestService.cancelRequest(id, finalReason)
    setCancelling(false)
    if (result.success) {
      toast.success("Đã hủy yêu cầu học")
      router.push("/dashboard/student/requests")
    } else {
      toast.error(result.error || "Không thể hủy yêu cầu")
    }
  }

  if (loading) return <LoadingSkeleton label="Đang tải chi tiết yêu cầu..." />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!request) return <EmptyState title="Không tìm thấy yêu cầu học" description="Yêu cầu có thể đã bị xóa hoặc không thuộc tài khoản hiện tại." />

  const canCancel = !["cancelled", "completed", "closed", "converted_to_class"].includes(String(request.status))

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Request detail"
        title={`${request.subject} · ${request.grade}`}
        description={`Mã yêu cầu ${request.requestCode}. Theo dõi trạng thái, booking, lớp học và thanh toán liên quan.`}
        icon={BookOpen}
        actions={(
          <>
            <Button variant="outline" asChild><Link href="/dashboard/student/requests"><ArrowLeft className="mr-2 h-4 w-4" />Quay lại</Link></Button>
            {canCancel && (
              <ConfirmReasonDialog
                confirmLabel="Hủy yêu cầu"
                description="Hành động này sẽ dừng xử lý ghép gia sư cho yêu cầu hiện tại."
                loading={cancelling}
                onConfirm={cancelRequest}
                reasonLabel="Lý do hủy"
                reasons={cancelReasons}
                requireReason
                title="Xác nhận hủy yêu cầu học"
                trigger={<Button variant="outline"><XCircle className="mr-2 h-4 w-4" />Hủy yêu cầu</Button>}
              />
            )}
          </>
        )}
        stats={[
          { label: "Trạng thái", value: getStatusLabel("learningRequest", request.status) },
          { label: "Booking", value: bookings.length },
          { label: "Lớp liên quan", value: classes.length },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Booking liên quan" value={bookings.length} icon={CalendarCheck} tone="blue" />
        <DashboardMetricCard label="Lớp học" value={classes.length} icon={GraduationCap} tone="emerald" />
        <DashboardMetricCard label="Thanh toán" value={payments.length} icon={CreditCard} tone="amber" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Timeline trạng thái</CardTitle>
          <CardDescription>Timeline này dùng trạng thái hiện tại từ backend để người học biết bước tiếp theo.</CardDescription>
        </CardHeader>
        <CardContent><RequestStatusTimeline status={request.status} /></CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Thông tin yêu cầu</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Học sinh" value={request.studentName} />
            <Info label="Phụ huynh" value={request.parentName || "Không nhập"} />
            <Info label="Môn học" value={request.subject} />
            <Info label="Lớp" value={request.grade} />
            <Info label="Hình thức" value={request.teachingMode} />
            <Info label="Khu vực" value={request.location || "Linh hoạt"} />
            <Info label="Ngân sách" value={request.expectedFee ? formatCurrency(request.expectedFee) : "Trao đổi thêm"} />
            <Info label="Ngày tạo" value={formatDate(request.createdAt)} />
            <div className="sm:col-span-2"><Info label="Mục tiêu/Ghi chú" value={request.goal || request.note || "Chưa nhập"} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Booking và lớp liên quan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="item-row">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{booking.subject} · {booking.preferredTime || "Chưa có lịch"}</p>
                  <StatusBadge kind="booking" status={booking.status} />
                </div>
              </div>
            ))}
            {classes.map((item) => (
              <div key={item.id} className="item-row">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{item.tutorName} · {item.scheduleText}</p>
                  <StatusBadge kind="class" status={item.status} />
                </div>
              </div>
            ))}
            {!bookings.length && !classes.length && <p className="text-sm text-muted-foreground">Chưa có booking hoặc lớp liên quan.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value || "Chưa có"}</p>
    </div>
  )
}
