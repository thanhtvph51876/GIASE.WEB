"use client"

import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdminDashboard } from "@/lib/hooks/use-admin"

const reportModules = ["all", "revenue", "bookings", "tutors", "students", "requests", "payments", "payouts"] as const

export default function AdminReportsPage() {
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [moduleFilter, setModuleFilter] = useState<(typeof reportModules)[number]>("all")
  const { data } = useAdminDashboard()
  const reports = data?.reports
  const topSubject = reports?.subjectDistribution?.[0]
  const totalRequests = reports?.conversionFunnel?.reduce((sum, item) => sum + item.count, 0) || 0
  const approvedTutors = reports?.tutorStatusDistribution?.find((item) => item.status === "Đã duyệt")?.count || 0
  const exportRows = useMemo(() => {
    const rows: Array<Record<string, string | number>> = []
    reports?.subjectDistribution?.forEach((item) => rows.push({ module: "requests", metric: "subject", name: item.subject, count: item.count }))
    reports?.conversionFunnel?.forEach((item) => rows.push({ module: "requests", metric: "funnel", name: item.stage, count: item.count }))
    reports?.tutorStatusDistribution?.forEach((item) => rows.push({ module: "tutors", metric: "status", name: item.status, count: item.count }))
    return moduleFilter === "all" ? rows : rows.filter((row) => row.module === moduleFilter)
  }, [moduleFilter, reports])

  const exportCsv = () => {
    const header = ["module", "metric", "name", "count", "fromDate", "toDate"]
    const lines = [
      header.join(","),
      ...exportRows.map((row) =>
        header.map((key) => JSON.stringify(key === "fromDate" ? fromDate : key === "toDate" ? toDate : row[key] ?? "")).join(",")
      ),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `admin-report-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Báo cáo</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Top môn học, trạng thái gia sư và tỷ lệ chuyển đổi.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc và export</CardTitle>
          <CardDescription>CSV hoạt động ở frontend; XLSX/PDF sẽ bật khi backend có endpoint export tương ứng.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[160px_160px_220px_auto_auto_auto] lg:items-end">
          <div className="grid gap-2">
            <Label>Từ ngày</Label>
            <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Đến ngày</Label>
            <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Module</Label>
            <Select value={moduleFilter} onValueChange={(value) => setModuleFilter(value as (typeof reportModules)[number])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {reportModules.map((item) => <SelectItem key={item} value={item}>{item === "all" ? "Tất cả" : item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={exportCsv} disabled={!exportRows.length}><Download className="h-4 w-4" />CSV</Button>
          <Button variant="outline" disabled>XLSX</Button>
          <Button variant="outline" disabled>PDF</Button>
        </CardContent>
      </Card>
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
