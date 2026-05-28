"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/platform/operational-components"
import { formatCurrency } from "@/lib/helpers"
import { parentService } from "@/lib/services/parent-service"

export default function ParentPaymentsPage() {
  const students = useSWR("parent-students", () => parentService.listStudents(), { revalidateOnFocus: false })
  const firstStudentId = students.data?.[0]?.id ? String(students.data[0].id) : ""
  const payments = useSWR(firstStudentId ? ["parent-payments", firstStudentId] : null, () => parentService.getStudentPayments(firstStudentId), { revalidateOnFocus: false })

  if (students.isLoading || payments.isLoading) return <LoadingSkeleton label="Đang tải thanh toán..." />
  if (students.error || payments.error) return <ErrorState message="Không tải được thanh toán." onRetry={() => { students.mutate(); payments.mutate() }} />
  if (!firstStudentId) return <EmptyState title="Chưa có hồ sơ học sinh" href="/register-student" actionLabel="Tạo yêu cầu học" />
  if (!payments.data?.length) return <EmptyState title="Chưa có khoản thanh toán" />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thanh toán</CardTitle>
        <CardDescription>Phụ huynh quản lý invoice/receipt theo học sinh.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {payments.data.map((payment) => (
          <div key={String(payment.id)} className="item-row">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{formatCurrency(Number(payment.amount || 0))}</p>
              <Badge variant="secondary">{String(payment.status || "")}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{String(payment.description || payment.createdAt || "")}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
