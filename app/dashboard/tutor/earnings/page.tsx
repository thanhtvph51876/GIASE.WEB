"use client"

import { useState } from "react"
import { BadgeDollarSign, Clock3, ReceiptText, Wallet } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardMetricCard, EmptyState, InsightPanel, PageHero } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useTutorEarnings } from "@/lib/hooks/use-tutor-earnings"
import { useTutorProfileByUser } from "@/lib/hooks/use-tutors"
import { payoutService } from "@/lib/services"
import { formatCurrency, formatDate } from "@/lib/helpers"

export default function TutorEarningsPage() {
  const { user } = useAuthContext()
  const { tutor } = useTutorProfileByUser(user?.id)
  const {
    earnings,
    payouts,
    availableBalance,
    pendingBalance,
    paidBalance,
    totalEarnings,
    refresh,
  } = useTutorEarnings(Boolean(tutor?.id))
  const [isRequesting, setIsRequesting] = useState(false)
  const chartData = Object.values(
    earnings.reduce<Record<string, { month: string; income: number }>>((acc, earning) => {
      const month = `Th${new Date(earning.createdAt).getMonth() + 1}`
      acc[month] = acc[month] || { month, income: 0 }
      acc[month].income += earning.netAmount
      return acc
    }, {})
  )

  const requestPayout = async () => {
    if (!tutor || availableBalance <= 0) return
    setIsRequesting(true)
    const result = await payoutService.requestPayout(tutor.id, tutor.fullName, availableBalance)
    setIsRequesting(false)
    if (result.success) {
      toast.success("Đã tạo yêu cầu rút tiền")
      refresh()
    }
    else toast.error(result.error || "Không thể tạo payout request")
  }
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Tutor finance"
        title="Thu nhập"
        description="Theo dõi học phí đã ghi nhận, khoản đang chờ xử lý và tạo yêu cầu rút tiền."
        icon={Wallet}
        actions={<Button onClick={requestPayout} disabled={isRequesting || availableBalance <= 0}>Tạo yêu cầu rút tiền</Button>}
        stats={[
          { label: "Tổng thu nhập", value: formatCurrency(totalEarnings) },
          { label: "Khả dụng", value: formatCurrency(availableBalance) },
          { label: "Đang chờ", value: formatCurrency(pendingBalance) },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardMetricCard label="Tổng thu nhập" value={formatCurrency(totalEarnings)} icon={BadgeDollarSign} tone="emerald" helper="Từ earning backend" />
        <DashboardMetricCard label="Khả dụng" value={formatCurrency(availableBalance)} icon={ReceiptText} tone="blue" />
        <DashboardMetricCard label="Đang chờ" value={formatCurrency(pendingBalance)} icon={Clock3} tone={pendingBalance ? "amber" : "emerald"} />
        <DashboardMetricCard label="Đã rút" value={formatCurrency(paidBalance)} icon={Wallet} tone="slate" />
      </div>
      <InsightPanel title="Payout" description="Yêu cầu rút tiền được lưu trên backend để admin duyệt hoặc từ chối." />
      <Card>
        <CardHeader>
          <CardTitle>Biểu đồ thu nhập</CardTitle>
          <CardDescription>Theo dõi học phí đã thanh toán và các khoản đang chờ xử lý.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="income" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 text-center">
              <p className="font-semibold text-slate-950">Chưa có dữ liệu thu nhập</p>
              <p className="mt-1 text-sm text-muted-foreground">Biểu đồ sẽ xuất hiện khi backend tạo earning cho gia sư.</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách earning</CardTitle>
          <CardDescription>Các khoản thu nhập theo session/payment, không lộ chi tiết payment của học viên.</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session / Payment</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Phí</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell>
                      <div className="font-medium">{earning.sessionId ? `Session ${earning.sessionId.slice(0, 8)}` : "Earning"}</div>
                      {earning.paymentId && <div className="text-xs text-muted-foreground">Payment {earning.paymentId.slice(0, 8)}</div>}
                    </TableCell>
                    <TableCell>{formatDate(earning.createdAt)}</TableCell>
                    <TableCell><StatusBadge kind="earning" status={earning.status} /></TableCell>
                    <TableCell className="text-right">{formatCurrency(earning.grossAmount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(earning.platformFee)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(earning.netAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Chưa có earning" description="Earning sẽ xuất hiện sau khi payment paid tạo thu nhập cho session/lớp của bạn." />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử payout</CardTitle>
          <CardDescription>Các yêu cầu rút tiền đã gửi cho admin xử lý.</CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày yêu cầu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>{formatDate(payout.requestedAt || payout.createdAt)}</TableCell>
                    <TableCell><StatusBadge kind="payout" status={payout.status} /></TableCell>
                    <TableCell>{payout.reason || payout.bankName || "Đang chờ xử lý"}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(payout.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Chưa có payout" description="Khi có số dư khả dụng, bạn có thể tạo yêu cầu rút tiền tại đây." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
