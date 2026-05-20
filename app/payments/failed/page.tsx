import { AlertTriangle, LifeBuoy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = (await searchParams) || {}
  const paymentId = Array.isArray(params.paymentId) ? params.paymentId[0] : params.paymentId
  return (
    <main className="app-container flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-xl overflow-hidden border-red-200 bg-white shadow-lg">
        <div className="h-2 bg-red-500" />
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <AlertTriangle className="h-9 w-9" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">Thanh toán chưa thành công</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Giao dịch có thể đã bị hủy, hết hạn hoặc gateway chưa xác nhận. Hệ thống không lưu thông tin thẻ của bạn.
          </p>
          {paymentId && <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">Mã payment: {paymentId}</p>}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild><a href="/dashboard/student/payments">Thử lại</a></Button>
            <Button asChild variant="outline"><a href="/contact"><LifeBuoy className="h-4 w-4" />Liên hệ hỗ trợ</a></Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
