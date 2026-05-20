import { Clock3, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default async function PaymentPendingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = (await searchParams) || {}
  const paymentId = Array.isArray(params.paymentId) ? params.paymentId[0] : params.paymentId
  const gateway = Array.isArray(params.gateway) ? params.gateway[0] : params.gateway
  return (
    <main className="app-container flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-xl overflow-hidden border-amber-200 bg-white shadow-lg">
        <div className="h-2 bg-amber-500" />
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock3 className="h-9 w-9" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">Đang chờ xác nhận thanh toán</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Gateway {gateway || ""} đang xử lý giao dịch. Trạng thái paid chỉ được cập nhật sau khi backend xác minh webhook hoặc đối soát giao dịch.
          </p>
          {paymentId && <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">Mã payment: {paymentId}</p>}
          <div className="mt-5 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800">
            <ShieldCheck className="mr-1 inline h-4 w-4" />
            Thông tin thanh toán được xử lý bởi gateway, hệ thống không lưu dữ liệu thẻ nhạy cảm.
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild><a href="/dashboard/student/payments">Kiểm tra trạng thái</a></Button>
            <Button asChild variant="outline"><a href="/contact">Báo lỗi thanh toán</a></Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
