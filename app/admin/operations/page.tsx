"use client"

import Link from "next/link"
import { AlertTriangle, BookOpen, CalendarDays, CreditCard, ShieldCheck, Star, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ErrorState, LoadingSkeleton } from "@/components/platform/operational-components"
import { useAdminOperations } from "@/lib/hooks/use-admin"

type QueueRow = Record<string, unknown>

export default function AdminOperationsPage() {
  const { data, error, isLoading, refresh } = useAdminOperations()

  if (isLoading) return <LoadingSkeleton label="Đang tải trung tâm vận hành..." />
  if (error) return <ErrorState message="Không tải được dữ liệu vận hành từ backend." onRetry={() => refresh()} />

  const overview = data?.overview || {}
  const queues = [
    {
      key: "matching",
      label: "Matching",
      title: "Request cần match/SLA",
      items: data?.matchingQueue || [],
      href: "/admin/learning-requests",
    },
    {
      key: "booking",
      label: "Booking risk",
      title: "Booking rủi ro",
      items: data?.bookingRisk || [],
      href: "/admin/bookings",
    },
    {
      key: "verification",
      label: "Verification",
      title: "Xác minh cần xử lý",
      items: data?.verificationRisk || [],
      href: "/admin/verifications",
    },
    {
      key: "payment",
      label: "Payment",
      title: "Đối soát thanh toán",
      items: data?.paymentReconciliation || [],
      href: "/admin/payments",
    },
    {
      key: "payout",
      label: "Payout",
      title: "Payout pending",
      items: data?.payoutQueue || [],
      href: "/admin/payouts",
    },
    {
      key: "quality",
      label: "Quality",
      title: "Cảnh báo chất lượng",
      items: data?.tutorQuality || [],
      href: "/admin/tutors",
    },
    {
      key: "disputes",
      label: "Disputes",
      title: "Tranh chấp",
      items: data?.disputes || [],
      href: "/admin/complaints",
    },
  ]

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Trung tâm vận hành marketplace</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Theo dõi SLA, matching, booking rủi ro, payment, payout, verification và chất lượng gia sư từ API operation backend.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-8">
        <Metric label="Request mới" value={overview.newRequests} icon={BookOpen} />
        <Metric label="Chưa có gia sư" value={overview.unmatchedRequests} icon={AlertTriangle} />
        <Metric label="Quá SLA" value={overview.overdueRequests} icon={AlertTriangle} />
        <Metric label="Trial sắp tới" value={overview.upcomingTrialBookings} icon={CalendarDays} />
        <Metric label="No-show" value={overview.noShowBookings} icon={AlertTriangle} />
        <Metric label="Payment pending" value={overview.pendingPayments} icon={CreditCard} />
        <Metric label="Payout pending" value={overview.pendingPayouts} icon={Wallet} />
        <Metric label="Verification" value={overview.pendingVerifications} icon={ShieldCheck} />
      </div>

      <Tabs defaultValue="matching" className="space-y-4">
        <TabsList className="h-auto flex-wrap">
          {queues.map((queue) => (
            <TabsTrigger key={queue.key} value={queue.key}>
              {queue.label}
              <Badge variant="secondary" className="ml-2">{queue.items.length}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {queues.map((queue) => (
          <TabsContent key={queue.key} value={queue.key}>
            <Queue title={queue.title} items={queue.items} href={queue.href} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function Metric({ label, value, icon: Icon }: { label: string; value?: unknown; icon: typeof BookOpen }) {
  return (
    <div className="metric-tile p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-950">{Number(value || 0).toLocaleString("vi-VN")}</p>
    </div>
  )
}

function Queue({ title, items, href }: { title: string; items: QueueRow[]; href: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{items.length} mục từ backend operation queue.</CardDescription>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={href}>Mở module</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length ? (
          items.slice(0, 20).map((item, index) => <Row key={String(item.id || index)} item={item} />)
        ) : (
          <div className="soft-panel border-dashed p-8 text-center text-sm text-muted-foreground">Không có việc cần xử lý.</div>
        )}
      </CardContent>
    </Card>
  )
}

function Row({ item }: { item: QueueRow }) {
  const title = text(item, "requestCode", "studentName", "fullName", "tutorName", "userName", "email", "id")
  const status = text(item, "status", "verificationStatus", "disputeStatus", "riskLevel")
  const meta = [
    text(item, "subject", "subjectName"),
    text(item, "grade", "gradeName"),
    values(item, "amount", "currency", "gateway", "proposalCount", "transactionCount", "riskScore", "duplicateFile").join(" · "),
    text(item, "createdAt", "scheduledStartTime", "scheduledStart", "requestedAt", "updatedAt"),
  ].filter(Boolean).join(" · ")

  return (
    <div className="item-row grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{title || "Bản ghi vận hành"}</p>
          {status && <Badge variant="secondary">{status}</Badge>}
        </div>
        {meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}
      </div>
      <Star className="h-4 w-4 text-amber-500" />
    </div>
  )
}

function text(item: QueueRow, ...keys: string[]) {
  for (const key of keys) {
    const value = item[key]
    if (value !== undefined && value !== null && String(value).trim()) return String(value)
  }
  return ""
}

function values(item: QueueRow, ...keys: string[]) {
  return keys.map((key) => item[key]).filter((value) => value !== undefined && value !== null && String(value).trim()).map(String)
}
