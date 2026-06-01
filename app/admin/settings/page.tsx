"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AdminActionButton } from "@/components/admin/admin-action-button"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [systemSettings, setSystemSettings] = useState<Array<Record<string, unknown>>>([])
  const [saving, setSaving] = useState(false)
  const [key, setKey] = useState("")
  const [value, setValue] = useState("")
  const [valueType, setValueType] = useState("string")
  const [description, setDescription] = useState("")

  useEffect(() => {
    settingsService.getSettings().then(setSettings).catch(() => {
      toast.error("Không tải được cài đặt hệ thống")
    })
    settingsService.getSystemSettings().then(setSystemSettings).catch(() => setSystemSettings([]))
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

  const saveSystemSetting = async () => {
    if (!key.trim()) {
      toast.error("Vui lòng nhập key cấu hình")
      return
    }
    try {
      await settingsService.upsertSystemSetting({ key, value, type: valueType, description }, user)
      toast.success("Đã cập nhật system setting")
      setKey("")
      setValue("")
      setDescription("")
      setSystemSettings(await settingsService.getSystemSettings())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật system setting")
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
      <Card>
        <CardHeader>
          <CardTitle>System settings nâng cao</CardTitle>
          <CardDescription>Quản lý key/value backend tại `/admin/system-settings` cho các policy cần cấu hình linh hoạt.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[180px_140px_1fr]">
            <div className="grid gap-2">
              <Label>Key</Label>
              <Input disabled={!canUpdate} value={key} onChange={(event) => setKey(event.target.value)} placeholder="payment.policy" />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={valueType} onValueChange={setValueType} disabled={!canUpdate}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">string</SelectItem>
                  <SelectItem value="number">number</SelectItem>
                  <SelectItem value="boolean">boolean</SelectItem>
                  <SelectItem value="json">json</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Value</Label>
              <Input disabled={!canUpdate} value={value} onChange={(event) => setValue(event.target.value)} placeholder='Ví dụ: "enabled" hoặc {"sla":24}' />
            </div>
            <div className="grid gap-2 md:col-span-3">
              <Label>Mô tả</Label>
              <Textarea disabled={!canUpdate} value={description} onChange={(event) => setDescription(event.target.value)} rows={2} />
            </div>
            <div className="md:col-span-3">
              <Button disabled={!canUpdate || !key.trim()} onClick={saveSystemSetting}>Lưu key cấu hình</Button>
            </div>
          </div>
          <div className="space-y-2">
            {systemSettings.map((item) => (
              <div key={String(item.key || item.id)} className="item-row grid gap-3 md:grid-cols-[220px_1fr_auto] md:items-center">
                <div>
                  <p className="font-semibold text-slate-900">{String(item.key)}</p>
                  <p className="text-xs text-muted-foreground">{String(item.valueType || "json")}</p>
                </div>
                <p className="break-words text-sm text-muted-foreground">{settingValue(item.value)}</p>
                <Button size="sm" variant="outline" disabled={!canUpdate} onClick={() => {
                  setKey(String(item.key || ""))
                  setValue(settingValue(item.value))
                  setValueType(String(item.valueType || "json"))
                  setDescription(String(item.description || ""))
                }}>Sửa</Button>
              </div>
            ))}
            {!systemSettings.length && <div className="soft-panel border-dashed p-6 text-center text-sm text-muted-foreground">Backend chưa có system setting nâng cao.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function settingValue(value: unknown) {
  if (value === undefined || value === null) return ""
  return typeof value === "string" ? value : JSON.stringify(value)
}

function SwitchRow({ title, checked, disabled, onChange }: { title: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="item-row flex items-center justify-between">
      <p className="font-medium">{title}</p>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  )
}
