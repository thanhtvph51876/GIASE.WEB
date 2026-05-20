"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export default function StudentSettingsPage() {
  const [email, setEmail] = useState(true)
  const [payments, setPayments] = useState(true)
  const [marketing, setMarketing] = useState(false)
  return (
    <div className="max-w-3xl space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Cài đặt tài khoản</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tùy chỉnh thông báo và quyền riêng tư.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Thông báo</CardTitle>
          <CardDescription>Các lựa chọn này được mô phỏng ở frontend.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingRow title="Email nhắc lịch học" checked={email} onCheckedChange={setEmail} />
          <SettingRow title="Cảnh báo thanh toán" checked={payments} onCheckedChange={setPayments} />
          <SettingRow title="Nhận gợi ý gia sư mới" checked={marketing} onCheckedChange={setMarketing} />
          <Button onClick={() => toast.success("Đã lưu cài đặt")}>Lưu cài đặt</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingRow({ title, checked, onCheckedChange }: { title: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <div className="item-row flex items-center justify-between">
      <p className="font-medium">{title}</p>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
