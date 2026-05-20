"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { settingsService } from "@/lib/services"
import type { SystemSetting } from "@/types"

export default function AdminSettingsPage() {
  const { user } = useAuthContext()
  const [settings, setSettings] = useState<SystemSetting | null>(null)

  useEffect(() => {
    setSettings(settingsService.getSettings())
  }, [])

  if (!settings) return null

  const update = <K extends keyof SystemSetting>(key: K, value: SystemSetting[K]) => {
    setSettings((current) => current ? { ...current, [key]: value } : current)
  }

  const save = async () => {
    const result = await settingsService.updateSettings(settings, user)
    setSettings(result.settings)
    toast.success("Đã lưu cài đặt hệ thống")
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Cài đặt hệ thống</h1>
        <p className="text-sm text-muted-foreground">Cấu hình vận hành được lưu trên backend.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Luồng vận hành</CardTitle>
          <CardDescription>Bật/tắt các workflow chính của hệ thống.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchRow title="Cho phép booking học thử" checked={settings.bookingEnabled} onChange={(checked) => update("bookingEnabled", checked)} />
          <SwitchRow title="Cho phép gia sư đăng ký" checked={settings.tutorRegistrationEnabled} onChange={(checked) => update("tutorRegistrationEnabled", checked)} />
          <SwitchRow title="Tự động gợi ý matching" checked={settings.autoMatchingEnabled} onChange={(checked) => update("autoMatchingEnabled", checked)} />
          <SwitchRow title="Maintenance mode" checked={settings.maintenanceMode} onChange={(checked) => update("maintenanceMode", checked)} />
          <div className="grid gap-2">
            <Label>Commission rate (%)</Label>
            <Input type="number" value={settings.commissionRate} onChange={(event) => update("commissionRate", Number(event.target.value))} />
          </div>
          <div className="grid gap-2">
            <Label>Chính sách học thử</Label>
            <Textarea value={settings.trialLessonPolicy} onChange={(event) => update("trialLessonPolicy", event.target.value)} rows={4} />
          </div>
          <Button onClick={save}>Lưu cài đặt</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function SwitchRow({ title, checked, onChange }: { title: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="item-row flex items-center justify-between">
      <p className="font-medium">{title}</p>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
