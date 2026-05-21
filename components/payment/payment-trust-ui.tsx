"use client"

import type { ReactNode } from "react"
import { Building2, CheckCircle2, Clock3, CreditCard, FileText, LockKeyhole, QrCode, ReceiptText, RefreshCw, ShieldCheck, WalletCards } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export const paymentGatewayOptions = [
  {
    id: "vnpay",
    label: "VNPay",
    description: "Redirect sang cổng thanh toán VNPay.",
    badge: "Sandbox ready",
    icon: CreditCard,
  },
  {
    id: "momo",
    label: "MoMo",
    description: "Ví điện tử MoMo, xác thực qua gateway.",
    badge: "Adapter",
    icon: WalletCards,
  },
  {
    id: "payos",
    label: "PayOS",
    description: "Thanh toán QR/chuyển khoản tự động.",
    badge: "Adapter",
    icon: QrCode,
  },
  {
    id: "bank_qr",
    label: "QR ngân hàng",
    description: "Quét mã QR và đối soát giao dịch.",
    badge: "Manual verify",
    icon: Building2,
  },
]

export function SecurePaymentBanner({ mode }: { mode?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-sky-200/80 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(16,185,129,0.10),rgba(255,255,255,0.9))] p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-950">Thanh toán bảo mật</h2>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                {mode === "production" ? "Production" : "Sandbox"}
              </Badge>
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Thông tin thanh toán được xử lý bởi cổng thanh toán, hệ thống không lưu số thẻ, CVV hoặc dữ liệu thẻ nhạy cảm.
              Bạn sẽ nhận được hóa đơn và biên lai sau khi giao dịch thành công.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-700">
          <div className="rounded-lg bg-white/80 px-3 py-2 shadow-sm"><LockKeyhole className="mx-auto mb-1 h-4 w-4 text-primary" />Không lưu thẻ</div>
          <div className="rounded-lg bg-white/80 px-3 py-2 shadow-sm"><ReceiptText className="mx-auto mb-1 h-4 w-4 text-emerald-600" />Có biên lai</div>
          <div className="rounded-lg bg-white/80 px-3 py-2 shadow-sm"><RefreshCw className="mx-auto mb-1 h-4 w-4 text-amber-600" />Hỗ trợ hoàn tiền</div>
        </div>
      </div>
    </div>
  )
}

export function PaymentMethodCard({
  active,
  disabled,
  gateway,
  onClick,
}: {
  active?: boolean
  disabled?: boolean
  gateway: (typeof paymentGatewayOptions)[number]
  onClick: () => void
}) {
  const Icon = gateway.icon
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group rounded-lg border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
        active && "border-primary bg-primary/5 ring-4 ring-primary/10",
        disabled && "cursor-not-allowed opacity-45 hover:translate-y-0 hover:border-border hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-primary group-hover:text-white">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-950">{gateway.label}</p>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{gateway.description}</p>
          </div>
        </div>
        {active ? <CheckCircle2 className="h-5 w-5 text-primary" /> : null}
      </div>
      <Badge variant="outline" className="mt-3 border-slate-200 bg-slate-50 text-slate-600">
        {gateway.badge}
      </Badge>
    </button>
  )
}

export function PaymentQuickFacts({ children }: { children?: ReactNode }) {
  const facts = [
    "Backend xác minh webhook trước khi cập nhật paid.",
    "Mỗi event có idempotency để tránh cộng tiền hai lần.",
    "Có audit log cho thanh toán, hoàn tiền và đối soát.",
  ]
  return (
    <Card className="border-slate-200/80 bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Cam kết an toàn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600">
        {facts.map((fact) => (
          <div key={fact} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{fact}</span>
          </div>
        ))}
        {children}
      </CardContent>
    </Card>
  )
}

export function PaymentDocumentActions({
  disabled,
  onInvoice,
  onReceipt,
}: {
  disabled?: boolean
  onInvoice: () => void
  onReceipt: () => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" disabled={disabled} onClick={onInvoice}>
        <FileText className="h-4 w-4" />
        Hóa đơn
      </Button>
      <Button size="sm" variant="outline" disabled={disabled} onClick={onReceipt}>
        <ReceiptText className="h-4 w-4" />
        Biên lai
      </Button>
    </div>
  )
}

export function PaymentQRCodeModal({
  checkoutUrl,
  gateway,
  onOpenChange,
  open,
  qrCodeUrl,
}: {
  checkoutUrl?: string
  gateway?: string
  onOpenChange: (value: boolean) => void
  open: boolean
  qrCodeUrl?: string
}) {
  const canRenderQrImage = Boolean(qrCodeUrl && /^(https?:|data:image\/)/.test(qrCodeUrl))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hoàn tất thanh toán</DialogTitle>
          <DialogDescription>
            Quét mã QR hoặc mở trang thanh toán của {gateway || "gateway"}. Trạng thái sẽ được cập nhật sau khi backend xác minh giao dịch.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="mx-auto flex aspect-square w-56 items-center justify-center rounded-lg border border-slate-200 bg-[linear-gradient(135deg,#f8fafc,#eef7ff)] p-4 shadow-inner">
            {canRenderQrImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrCodeUrl} alt="QR thanh toán" className="h-full w-full rounded-lg object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-white p-5 text-center text-sm leading-6 text-muted-foreground">
                Cổng thanh toán chưa trả về mã QR có thể hiển thị.
              </div>
            )}
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Không đóng trang cho đến khi cổng thanh toán xác nhận. Nếu giao dịch bị lỗi, hãy dùng nút kiểm tra trạng thái hoặc liên hệ hỗ trợ.
          </div>
          {checkoutUrl && (
            <Button className="w-full" asChild>
              <a href={checkoutUrl}>Mở trang thanh toán</a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TransactionTimeline({ items }: { items: Array<{ label: string; value?: string; tone?: "success" | "warning" | "info" | "danger" }> }) {
  const toneClass = {
    danger: "bg-red-500",
    info: "bg-sky-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex gap-3 text-sm">
          <div className="mt-1 flex flex-col items-center">
            <span className={cn("h-2.5 w-2.5 rounded-full", toneClass[item.tone || "info"])} />
            <span className="mt-1 h-8 w-px bg-slate-200 last:hidden" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{item.label}</p>
            {item.value && <p className="text-muted-foreground">{item.value}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

export function PaymentExpiry({ expiredAt }: { expiredAt?: string }) {
  if (!expiredAt) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
      <Clock3 className="h-3.5 w-3.5" />
      Hết hạn: {new Date(expiredAt).toLocaleString("vi-VN")}
    </span>
  )
}
