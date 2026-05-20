"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminDashboard } from "@/lib/hooks/use-admin"

export default function AdminReportsPage() {
  const { data } = useAdminDashboard()
  const reports = data?.reports
  const topSubject = reports?.subjectDistribution?.[0]
  const totalRequests = reports?.conversionFunnel?.reduce((sum, item) => sum + item.count, 0) || 0
  const approvedTutors = reports?.tutorStatusDistribution?.find((item) => item.status === "Đã duyệt")?.count || 0

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Báo cáo</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Top môn học, trạng thái gia sư và tỷ lệ chuyển đổi.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Tổng yêu cầu trong phễu" value={totalRequests} />
        <Metric label="Môn được hỏi nhiều nhất" value={topSubject ? `${topSubject.subject} (${topSubject.count})` : "Chưa có"} />
        <Metric label="Gia sư đã duyệt" value={approvedTutors} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Chart title="Môn học được đăng ký nhiều nhất" data={reports?.subjectDistribution || []} x="subject" />
        <Chart title="Tỷ lệ chuyển đổi yêu cầu" data={reports?.conversionFunnel || []} x="stage" />
        <Chart title="Gia sư theo trạng thái duyệt" data={reports?.tutorStatusDistribution || []} x="status" />
      </div>
    </div>
  )
}

function Chart({ title, data, x }: { title: string; data: Array<Record<string, string | number>>; x: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{data.length} nhóm dữ liệu</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={x} tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "#eff6ff" }} contentStyle={{ borderRadius: 8, borderColor: "#dbeafe" }} />
              <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed bg-slate-50 text-sm text-muted-foreground">
            Chưa có dữ liệu báo cáo.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="metric-tile">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  )
}
