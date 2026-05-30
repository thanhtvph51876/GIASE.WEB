"use client"

import { useState } from "react"
import { BadgeDollarSign, Clock3, ReceiptText, Wallet } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/ui/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmReasonDialog } from "@/components/dashboard/confirm-reason-dialog"
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
  const [payoutOpen, setPayoutOpen] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAccount, setBankAccount] = useState("")
  const [accountHolder, setAccountHolder] = useState("")
  const [payoutNote, setPayoutNote] = useState("")
  const chartData = Object.values(
    earnings.reduce<Record<string, { month: string; income: number }>>((acc, earning) => {
      const month = `Th${new Date(earning.createdAt).getMonth() + 1}`
      acc[month] = acc[month] || { month, income: 0 }
      acc[month].income += earning.netAmount
      return acc
    }, {})
  )

  const requestPayout = async () => {
    if (!tutor) return
    const amount = Number(payoutAmount)
    if (!amount || amount <= 0) {
      toast.error("Số tiền rút phải lớn hơn 0")
      return
    }
    if (amount > availableBalance) {
      toast.error("Số tiền rút không được vượt số dư khả dụng")
      return
    }
    if (!bankName.trim() || !bankAccount.trim() || !accountHolder.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin ngân hàng")
      return
    }
    setIsRequesting(true)
    const result = await payoutService.requestPayout(tutor.id, tutor.fullName, {
      amount,
      bankName: bankName.trim(),
      bankAccount: bankAccount.trim(),
      accountHolder: accountHolder.trim(),
      note: payoutNote.trim() || undefined,
    })
    setIsRequesting(false)
    if (result.success) {
      toast.success("Đã tạo yêu cầu rút tiền")
      setPayoutOpen(false)
      setPayoutAmount("")
      setBankName("")
      setBankAccount("")
      setAccountHolder("")
      setPayoutNote("")
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
        actions={(
          <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
            <DialogTrigger asChild>
              <Button disabled={isRequesting || availableBalance <= 0}>Tạo yêu cầu rút tiền</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo yêu cầu rút tiền</DialogTitle>
                <DialogDescription>
                  Backend sẽ kiểm tra số dư khả dụng, khóa earning liên quan và chuyển yêu cầu cho admin duyệt.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Số tiền muốn rút</Label>
                  <Input
                    disabled={isRequesting}
                    max={availableBalance}
                    min={0}
                    type="number"
                    value={payoutAmount}
                    onChange={(event) => setPayoutAmount(event.target.value)}
                    placeholder={String(availableBalance)}
                  />
                  <p className="text-xs text-muted-foreground">Khả dụng: {formatCurrency(availableBalance)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Ngân hàng</Label>
                  <Input disabled={isRequesting} value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="VD: Vietcombank" />
                </div>
                <div className="space-y-2">
                  <Label>Số tài khoản</Label>
                  <Input disabled={isRequesting} value={bankAccount} onChange={(event) => setBankAccount(event.target.value)} placeholder="Nhập số tài khoản nhận tiền" />
                </div>
                <div className="space-y-2">
                  <Label>Chủ tài khoản</Label>
                  <Input disabled={isRequesting} value={accountHolder} onChange={(event) => setAccountHolder(event.target.value)} placeholder="Tên chủ tài khoản" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Ghi chú</Label>
                  <Textarea disabled={isRequesting} rows={3} value={payoutNote} onChange={(event) => setPayoutNote(event.target.value)} placeholder="Ghi chú thêm cho admin nếu cần" />
                </div>
              </div>
              <ConfirmReasonDialog
                confirmLabel="Gửi yêu cầu rút tiền"
                description="Yêu cầu này sẽ khóa các khoản earning tương ứng cho tới khi admin duyệt hoặc từ chối."
                loading={isRequesting}
                noteLabel="Ghi chú xác nhận"
                onConfirm={() => requestPayout()}
                title="Xác nhận tạo payout"
                trigger={<Button disabled={isRequesting || availableBalance <= 0}>Xác nhận rút tiền</Button>}
              />
            </DialogContent>
          </Dialog>
        )}
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
                  <TableHead>Tài khoản nhận</TableHead>
                  <TableHead>Ghi chú</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>{formatDate(payout.requestedAt || payout.createdAt)}</TableCell>
                    <TableCell><StatusBadge kind="payout" status={payout.status} /></TableCell>
                    <TableCell>{payout.bankName ? `${payout.bankName} · ${maskBankAccount(payout.bankAccount)}` : "Chưa có"}</TableCell>
                    <TableCell>{payout.reason || payout.accountHolder || "Đang chờ xử lý"}</TableCell>
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

function maskBankAccount(value?: string) {
  if (!value) return "Chưa có"
  const clean = value.replace(/\s+/g, "")
  if (clean.length <= 4) return "****"
  return `${"*".repeat(Math.max(clean.length - 4, 4))}${clean.slice(-4)}`
}
