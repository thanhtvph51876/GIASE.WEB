"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AdminActionButton } from "@/components/admin/admin-action-button"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { getAdminActionAvailability } from "@/lib/admin/admin-actions"
import { hasAdminPermission } from "@/lib/admin/admin-permissions"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { settingsService } from "@/lib/services"
import type { SystemSetting } from "@/types"

export default function AdminSettingsPage() {
  const { user } = useAuthContext()
  const [settings, setSettings] = useState<SystemSetting | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsService.getSettings().then(setSettings).catch(() => {
      toast.error("Không tải được cài đặt hệ thống")
    })
  }, [])

  if (!settings) return null

  const canUpdate = hasAdminPermission(user, "settings.update")
  const saveAvailability = getAdminActionAvailability(user, "settings", "settings.update", "active", settings)

  const update = <K extends keyof SystemSetting>(key: K, value: SystemSetting[K]) => {
    if (!canUpdate) return
    setSettings((current) => current ? { ...current, [key]: value } : current)
  }

  const save = async (reason: string) => {
    setSaving(true)
    try {
      const result = await settingsService.updateSettings({ ...settings, auditReason: reason } as SystemSetting, user)
      setSettings(result.settings)
      toast.success("Đã lưu cài đặt hệ thống")
    } finally {
      setSaving(false)
    }
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
          {!canUpdate && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Bạn đang ở chế độ chỉ xem. Cần quyền settings.update để thay đổi cấu hình.</p>}
          <SwitchRow title="Cho phép booking học thử" checked={settings.bookingEnabled} disabled={!canUpdate} onChange={(checked) => update("bookingEnabled", checked)} />
          <SwitchRow title="Cho phép gia sư đăng ký" checked={settings.tutorRegistrationEnabled} disabled={!canUpdate} onChange={(checked) => update("tutorRegistrationEnabled", checked)} />
          <SwitchRow title="Tự động gợi ý matching" checked={settings.autoMatchingEnabled} disabled={!canUpdate} onChange={(checked) => update("autoMatchingEnabled", checked)} />
          <SwitchRow title="Maintenance mode" checked={settings.maintenanceMode} disabled={!canUpdate} onChange={(checked) => update("maintenanceMode", checked)} />
          <div className="grid gap-2">
            <Label>Commission rate (%)</Label>
            <Input disabled={!canUpdate} type="number" value={settings.commissionRate} onChange={(event) => update("commissionRate", Number(event.target.value))} />
          </div>
          <div className="grid gap-2">
            <Label>Chính sách học thử</Label>
            <Textarea disabled={!canUpdate} value={settings.trialLessonPolicy} onChange={(event) => update("trialLessonPolicy", event.target.value)} rows={4} />
          </div>
          <ConfirmReasonDialog
            trigger={<AdminActionButton disabled={saving} availability={saveAvailability}>Lưu cài đặt</AdminActionButton>}
            title="Lưu cài đặt hệ thống"
            description="Thay đổi cấu hình có thể ảnh hưởng booking, matching hoặc vận hành nền tảng. Hãy ghi rõ lý do để audit."
            actionName="Lưu cài đặt"
            severity={settings.maintenanceMode ? "danger" : "warning"}
            requireTypedConfirmation={settings.maintenanceMode ? "MAINTENANCE" : undefined}
            reasonOptions={[
              { value: "OPS_POLICY_UPDATE", label: "Cập nhật policy vận hành" },
              { value: "FINANCE_POLICY_UPDATE", label: "Cập nhật chính sách tài chính" },
              { value: "OTHER", label: "Lý do khác" },
            ]}
            onConfirm={(reason, note) => save(note || reason)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function SwitchRow({ title, checked, disabled, onChange }: { title: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="item-row flex items-center justify-between">
      <p className="font-medium">{title}</p>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  )
}
