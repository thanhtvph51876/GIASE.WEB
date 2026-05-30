"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RoleBadge } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"

export default function ParentSettingsPage() {
  const { user, updateProfile } = useAuthContext()
  const [fullName, setFullName] = useState(user?.fullName || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [paymentAlerts, setPaymentAlerts] = useState(true)
  const [proposalAlerts, setProposalAlerts] = useState(true)

  const saveProfile = async () => {
    await updateProfile({ fullName, phone })
    toast.success("Đã lưu thông tin phụ huynh")
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Cài đặt phụ huynh</h1>
            <p className="mt-1 text-sm text-muted-foreground">Quản lý thông tin tài khoản, liên hệ và thông báo vận hành.</p>
          </div>
          <RoleBadge role={user?.role} />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
          <CardDescription>Dùng để tư vấn viên, gia sư và hệ thống liên hệ khi có proposal, lịch học hoặc thanh toán.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Họ tên phụ huynh</Label><Input value={fullName} onChange={(event) => setFullName(event.target.value)} /></div>
          <div className="space-y-2"><Label>Số điện thoại</Label><Input value={phone} onChange={(event) => setPhone(event.target.value)} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Email</Label><Input value={user?.email || ""} disabled /></div>
          <div className="flex gap-2 md:col-span-2">
            <Button onClick={saveProfile}>Lưu thông tin</Button>
            <Button variant="outline" asChild><Link href="/dashboard/parent/students">Quản lý hồ sơ con</Link></Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tùy chọn thông báo</CardTitle>
          <CardDescription>Cài đặt này là bước chuẩn bị UX; backend notification vẫn quyết định kênh gửi thật.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingRow title="Email nhắc lịch học" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          <SettingRow title="Cảnh báo thanh toán" checked={paymentAlerts} onCheckedChange={setPaymentAlerts} />
          <SettingRow title="Proposal mới từ gia sư" checked={proposalAlerts} onCheckedChange={setProposalAlerts} />
          <Button variant="outline" onClick={() => toast.success("Đã lưu cài đặt thông báo")}>Lưu cài đặt thông báo</Button>
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
