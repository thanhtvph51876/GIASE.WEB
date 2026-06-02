"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Award,
  BookOpen,
  Copy,
  Database,
  Download,
  Edit,
  EyeOff,
  FileJson,
  Filter,
  History,
  KeyRound,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  Trash2,
  Upload,
  BarChart3,
} from "lucide-react"
import { toast } from "sonner"
import { AdminActionButton } from "@/components/admin/admin-action-button"
import { ConfirmReasonDialog } from "@/components/admin/ConfirmReasonDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { getAdminActionAvailability } from "@/lib/admin/admin-actions"
import { hasAdminPermission } from "@/lib/admin/admin-permissions"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { masterDataService, settingsService } from "@/lib/services"
import { cn } from "@/lib/utils"
import type { Certificate, Location, Subject, SubjectCategory, SystemSetting, Language } from "@/types"

type MasterDataKind = "subjects" | "locations" | "certificates"
type MasterDataRecord = Subject | Location | Certificate
type StatusFilter = "all" | "active" | "inactive"

interface SystemSettingItem {
  id?: string
  key?: string
  value?: unknown
  valueType?: string
  description?: string
  isSensitive?: boolean
  updatedBy?: string | null
  createdAt?: string
  updatedAt?: string
}

interface SystemSettingHistoryItem {
  id?: string
  actorId?: string | null
  actorRole?: string | null
  action?: string
  description?: string
  metadata?: unknown
  createdAt?: string
}

interface MasterDataUsage {
  kind?: string
  id?: string
  counts?: Record<string, number>
  total?: number
  hasUsage?: boolean
}

interface SystemSettingFormState {
  editKey?: string
  key: string
  value: string
  valueType: string
  description: string
  isSensitive: boolean
}

interface MasterDataFormState {
  id?: string
  name: string
  code: string
  description: string
  categoryId: string
  type: string
  parentId: string
  fullPath: string
  languageId: string
  isActive: boolean
  isAcademicSubject: boolean
  isLanguage: boolean
  isTestPrep: boolean
  isSkill: boolean
}

const MASTER_DATA_META: Record<MasterDataKind, { label: string; description: string; icon: typeof BookOpen }> = {
  subjects: {
    label: "Môn học",
    description: "Danh mục môn học dùng ở tìm kiếm gia sư, yêu cầu học và hồ sơ gia sư.",
    icon: BookOpen,
  },
  locations: {
    label: "Địa điểm",
    description: "Tỉnh/thành, quận/huyện và khu vực học offline.",
    icon: MapPin,
  },
  certificates: {
    label: "Chứng chỉ",
    description: "Chứng chỉ dùng cho hồ sơ và xác thực năng lực gia sư.",
    icon: Award,
  },
}

const EMPTY_SYSTEM_SETTING_FORM: SystemSettingFormState = {
  key: "",
  value: "",
  valueType: "string",
  description: "",
  isSensitive: false,
}

const EMPTY_MASTER_DATA_FORM: MasterDataFormState = {
  name: "",
  code: "",
  description: "",
  categoryId: "",
  type: "PROVINCE",
  parentId: "",
  fullPath: "",
  languageId: "",
  isActive: true,
  isAcademicSubject: true,
  isLanguage: false,
  isTestPrep: false,
  isSkill: false,
}

export default function AdminSettingsPage() {
  const { user } = useAuthContext()
  const [settings, setSettings] = useState<SystemSetting | null>(null)
  const [systemSettings, setSystemSettings] = useState<SystemSettingItem[]>([])
  const [catalogs, setCatalogs] = useState<Record<MasterDataKind, MasterDataRecord[]>>({
    subjects: [],
    locations: [],
    certificates: [],
  })
  const [subjectCategories, setSubjectCategories] = useState<SubjectCategory[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [savingSystemSetting, setSavingSystemSetting] = useState(false)
  const [savingMasterData, setSavingMasterData] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

  const [systemSearch, setSystemSearch] = useState("")
  const [systemTypeFilter, setSystemTypeFilter] = useState("all")
  const [systemSettingDialogOpen, setSystemSettingDialogOpen] = useState(false)
  const [systemSettingForm, setSystemSettingForm] = useState<SystemSettingFormState>(EMPTY_SYSTEM_SETTING_FORM)
  const [pendingDeleteSystemSetting, setPendingDeleteSystemSetting] = useState<SystemSettingItem | null>(null)
  const [historySetting, setHistorySetting] = useState<SystemSettingItem | null>(null)
  const [historyItems, setHistoryItems] = useState<SystemSettingHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [importingSettings, setImportingSettings] = useState(false)

  const [selectedKind, setSelectedKind] = useState<MasterDataKind>("subjects")
  const [catalogSearch, setCatalogSearch] = useState("")
  const [catalogStatusFilter, setCatalogStatusFilter] = useState<StatusFilter>("all")
  const [masterDataDialogOpen, setMasterDataDialogOpen] = useState(false)
  const [masterDataForm, setMasterDataForm] = useState<MasterDataFormState>(EMPTY_MASTER_DATA_FORM)
  const [pendingDelete, setPendingDelete] = useState<MasterDataRecord | null>(null)
  const [pendingBulkActive, setPendingBulkActive] = useState<boolean | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [usageItem, setUsageItem] = useState<MasterDataRecord | null>(null)
  const [usage, setUsage] = useState<MasterDataUsage | null>(null)
  const [usageLoading, setUsageLoading] = useState(false)

  const canUpdateSettings = hasAdminPermission(user, "settings.update")
  const canManageMasterData = hasAdminPermission(user, "master_data.manage")
  const saveAvailability = getAdminActionAvailability(user, "settings", "settings.update", "active", settings)

  const loadAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const [settingsResult, systemResult, subjectsResult, locationsResult, certificatesResult, categoriesResult, languagesResult] =
        await Promise.allSettled([
          settingsService.getSettings(),
          settingsService.getSystemSettings(),
          masterDataService.getAdminItems("subjects"),
          masterDataService.getAdminItems("locations"),
          masterDataService.getAdminItems("certificates"),
          masterDataService.getSubjectCategories(),
          masterDataService.getLanguages(),
        ])

      if (settingsResult.status === "fulfilled") setSettings(settingsResult.value)
      else toast.error("Không tải được cài đặt vận hành")

      if (systemResult.status === "fulfilled") setSystemSettings(systemResult.value as SystemSettingItem[])
      else toast.error("Không tải được system settings")

      setCatalogs({
        subjects: subjectsResult.status === "fulfilled" ? (subjectsResult.value as MasterDataRecord[]) : [],
        locations: locationsResult.status === "fulfilled" ? (locationsResult.value as MasterDataRecord[]) : [],
        certificates: certificatesResult.status === "fulfilled" ? (certificatesResult.value as MasterDataRecord[]) : [],
      })
      if (categoriesResult.status === "fulfilled") setSubjectCategories(categoriesResult.value)
      if (languagesResult.status === "fulfilled") setLanguages(languagesResult.value)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    setSelectedIds([])
  }, [selectedKind, catalogSearch, catalogStatusFilter])

  const filteredSystemSettings = useMemo(() => {
    const query = systemSearch.trim().toLowerCase()
    return systemSettings.filter((item) => {
      const type = String(item.valueType || "json")
      if (systemTypeFilter !== "all" && type !== systemTypeFilter) return false
      if (!query) return true
      return [item.key, item.description, type, settingValue(item.value)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [systemSearch, systemSettings, systemTypeFilter])

  const currentCatalogItems = catalogs[selectedKind] || []
  const filteredCatalogItems = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase()
    return currentCatalogItems.filter((item) => {
      const active = isRecordActive(item)
      if (catalogStatusFilter === "active" && !active) return false
      if (catalogStatusFilter === "inactive" && active) return false
      if (!query) return true
      return searchableRecordValues(item).some((value) => value.toLowerCase().includes(query))
    })
  }, [catalogSearch, catalogStatusFilter, currentCatalogItems])

  const selectedVisibleItems = filteredCatalogItems.filter((item) => selectedIds.includes(item.id))
  const allVisibleSelected = filteredCatalogItems.length > 0 && filteredCatalogItems.every((item) => selectedIds.includes(item.id))
  const inactiveLocalCount = currentCatalogItems.filter((item) => !isRecordActive(item)).length

  const updateSetting = <K extends keyof SystemSetting>(key: K, value: SystemSetting[K]) => {
    if (!canUpdateSettings) return
    setSettings((current) => (current ? { ...current, [key]: value } : current))
  }

  const updateNotification = (key: keyof SystemSetting["notificationSettings"], value: boolean) => {
    if (!canUpdateSettings) return
    setSettings((current) =>
      current
        ? {
            ...current,
            notificationSettings: {
              ...current.notificationSettings,
              [key]: value,
            },
          }
        : current
    )
  }

  const saveOperationalSettings = async (reason: string) => {
    if (!settings) return
    setSavingSettings(true)
    try {
      const result = await settingsService.updateSettings({ ...settings, auditReason: reason } as SystemSetting, user)
      setSettings(result.settings)
      toast.success("Đã lưu cài đặt vận hành")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu cài đặt vận hành")
    } finally {
      setSavingSettings(false)
    }
  }

  const openNewSystemSetting = () => {
    setSystemSettingForm(EMPTY_SYSTEM_SETTING_FORM)
    setSystemSettingDialogOpen(true)
  }

  const openEditSystemSetting = (item: SystemSettingItem) => {
    setSystemSettingForm({
      editKey: item.key,
      key: String(item.key || ""),
      value: item.isSensitive ? "" : settingValue(item.value),
      valueType: String(item.valueType || "json"),
      description: String(item.description || ""),
      isSensitive: Boolean(item.isSensitive),
    })
    setSystemSettingDialogOpen(true)
  }

  const duplicateSystemSetting = (item: SystemSettingItem) => {
    setSystemSettingForm({
      key: `${String(item.key || "setting")}.copy`,
      value: item.isSensitive ? "" : settingValue(item.value),
      valueType: String(item.valueType || "json"),
      description: String(item.description || ""),
      isSensitive: Boolean(item.isSensitive),
    })
    setSystemSettingDialogOpen(true)
  }

  const saveSystemSetting = async () => {
    if (!canUpdateSettings) return
    const key = systemSettingForm.key.trim()
    if (!key) {
      toast.error("Vui lòng nhập key cấu hình")
      return
    }

    const keepHiddenSensitiveValue = Boolean(
      systemSettingForm.editKey && systemSettingForm.isSensitive && !systemSettingForm.value.trim()
    )
    if (!keepHiddenSensitiveValue) {
      const parsed = validateSettingValue(systemSettingForm.value, systemSettingForm.valueType)
      if (!parsed.ok) {
        toast.error(parsed.message)
        return
      }
    }

    setSavingSystemSetting(true)
    try {
      const input = {
        key,
        value: systemSettingForm.value,
        description: systemSettingForm.description,
        type: systemSettingForm.valueType,
        isSensitive: systemSettingForm.isSensitive,
        skipValue: keepHiddenSensitiveValue,
      }
      if (systemSettingForm.editKey) {
        await settingsService.updateSystemSetting(systemSettingForm.editKey, input, user)
      } else {
        await settingsService.upsertSystemSetting(input, user)
      }
      setSystemSettings((await settingsService.getSystemSettings()) as SystemSettingItem[])
      setSystemSettingDialogOpen(false)
      toast.success(systemSettingForm.editKey ? "Đã cập nhật system setting" : "Đã tạo system setting")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu system setting")
    } finally {
      setSavingSystemSetting(false)
    }
  }

  const exportSystemSettings = () => {
    downloadJson("system-settings.json", systemSettings)
  }

  const openSystemSettingHistory = async (item: SystemSettingItem) => {
    const key = item.key
    if (!key) return
    setHistorySetting(item)
    setHistoryItems([])
    setHistoryLoading(true)
    try {
      setHistoryItems((await settingsService.getSystemSettingHistory(key)) as SystemSettingHistoryItem[])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được lịch sử system setting")
    } finally {
      setHistoryLoading(false)
    }
  }

  const importSystemSettings = async (file?: File | null) => {
    if (!file || !canUpdateSettings) return
    setImportingSettings(true)
    try {
      const raw = JSON.parse(await file.text())
      const records = normalizeSystemSettingImport(raw)
      if (!records.length) {
        toast.error("File import không có system setting hợp lệ")
        return
      }
      for (const record of records) {
        const parsed = validateSettingValue(record.value, record.valueType)
        if (!parsed.ok) throw new Error(`${record.key}: ${parsed.message}`)
      }
      await Promise.all(records.map((record) => settingsService.upsertSystemSetting(record, user)))
      setSystemSettings((await settingsService.getSystemSettings()) as SystemSettingItem[])
      toast.success(`Đã import ${records.length} system setting`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể import system settings")
    } finally {
      setImportingSettings(false)
    }
  }

  const deleteSystemSetting = async () => {
    const key = pendingDeleteSystemSetting?.key
    if (!key || !canUpdateSettings) return
    try {
      await settingsService.deleteSystemSetting(key, user)
      setSystemSettings((current) => current.filter((item) => item.key !== key))
      setPendingDeleteSystemSetting(null)
      toast.success("Đã xóa system setting")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa system setting")
    }
  }

  const openNewMasterData = () => {
    setMasterDataForm(EMPTY_MASTER_DATA_FORM)
    setMasterDataDialogOpen(true)
  }

  const openEditMasterData = (item: MasterDataRecord) => {
    setMasterDataForm(toMasterDataForm(item, selectedKind))
    setMasterDataDialogOpen(true)
  }

  const duplicateMasterData = (item: MasterDataRecord) => {
    const form = toMasterDataForm(item, selectedKind)
    setMasterDataForm({
      ...form,
      id: undefined,
      name: `${form.name} copy`,
      code: form.code ? `${form.code}_COPY` : "",
    })
    setMasterDataDialogOpen(true)
  }

  const openUsage = async (item: MasterDataRecord) => {
    setUsageItem(item)
    setUsage(null)
    setUsageLoading(true)
    try {
      setUsage((await masterDataService.getAdminUsage(selectedKind, item.id)) as MasterDataUsage)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được usage của danh mục")
    } finally {
      setUsageLoading(false)
    }
  }

  const openDeleteMasterData = (item: MasterDataRecord) => {
    setPendingDelete(item)
    openUsage(item)
  }

  const saveMasterData = async () => {
    if (!canManageMasterData) return
    if (!masterDataForm.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục")
      return
    }

    setSavingMasterData(true)
    try {
      const payload = buildMasterDataPayload(selectedKind, masterDataForm)
      let result = masterDataForm.id
        ? await masterDataService.updateAdminItem(selectedKind, masterDataForm.id, payload)
        : await masterDataService.createAdminItem(selectedKind, payload)
      if (!masterDataForm.id && !masterDataForm.isActive && (result as MasterDataRecord).id) {
        result = await masterDataService.updateAdminItem(selectedKind, (result as MasterDataRecord).id, { isActive: false })
      }
      mergeMasterDataResult(selectedKind, result as MasterDataRecord)
      setMasterDataDialogOpen(false)
      toast.success(masterDataForm.id ? "Đã cập nhật danh mục" : "Đã tạo danh mục")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu danh mục")
    } finally {
      setSavingMasterData(false)
    }
  }

  const toggleMasterDataActive = async (item: MasterDataRecord, nextActive: boolean) => {
    if (!canManageMasterData) return
    try {
      const result = await masterDataService.updateAdminItem(selectedKind, item.id, { isActive: nextActive })
      mergeMasterDataResult(selectedKind, { ...item, ...(result as MasterDataRecord), isActive: nextActive })
      toast.success(nextActive ? "Đã bật lại danh mục" : "Đã ẩn danh mục")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật trạng thái danh mục")
    }
  }

  const deleteMasterData = async () => {
    if (!pendingDelete || !canManageMasterData) return
    try {
      await masterDataService.deleteAdminItem(selectedKind, pendingDelete.id)
      mergeMasterDataResult(selectedKind, { ...pendingDelete, isActive: false })
      setPendingDelete(null)
      toast.success("Đã ẩn danh mục khỏi dữ liệu sử dụng")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa danh mục")
    }
  }

  const bulkSetActive = async () => {
    if (pendingBulkActive === null || selectedVisibleItems.length === 0 || !canManageMasterData) return
    setBulkLoading(true)
    try {
      await masterDataService.updateAdminItemsStatus(selectedKind, selectedVisibleItems.map((item) => item.id), pendingBulkActive)
      setCatalogs((current) => ({
        ...current,
        [selectedKind]: current[selectedKind].map((item) =>
          selectedIds.includes(item.id) ? { ...item, isActive: pendingBulkActive } : item
        ),
      }))
      toast.success(pendingBulkActive ? "Đã bật các danh mục đã chọn" : "Đã ẩn các danh mục đã chọn")
      setSelectedIds([])
      setPendingBulkActive(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xử lý hàng loạt")
    } finally {
      setBulkLoading(false)
    }
  }

  const mergeMasterDataResult = (kind: MasterDataKind, item: MasterDataRecord) => {
    setCatalogs((current) => {
      const exists = current[kind].some((record) => record.id === item.id)
      return {
        ...current,
        [kind]: exists
          ? current[kind].map((record) => (record.id === item.id ? { ...record, ...item } : record))
          : [item, ...current[kind]],
      }
    })
  }

  if (isLoading && !settings) {
    return (
      <div className="max-w-7xl space-y-5">
        <div className="surface-panel p-6">
          <div className="h-7 w-64 animate-pulse rounded-md bg-slate-200" />
          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded-md bg-slate-100" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="surface-panel h-28 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">System console</Badge>
              {!canUpdateSettings && <Badge variant="outline">Chỉ xem</Badge>}
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-950">Quản lý hệ thống</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Điều khiển cấu hình vận hành, key/value backend và danh mục lõi đang dùng trên toàn website.
            </p>
          </div>
          <Button variant="outline" onClick={loadAll} disabled={isLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Tải lại
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={Settings} label="Workflow" value={settings?.maintenanceMode ? "Maintenance" : "Online"} tone={settings?.maintenanceMode ? "danger" : "normal"} />
        <MetricCard icon={KeyRound} label="System keys" value={systemSettings.length} />
        <MetricCard icon={Database} label="Danh mục active" value={currentCatalogItems.length - inactiveLocalCount} />
        <MetricCard icon={EyeOff} label="Danh mục đang ẩn" value={inactiveLocalCount} tone={inactiveLocalCount ? "warning" : "normal"} />
      </div>

      <Tabs defaultValue="operations" className="space-y-5">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="operations">
            <Settings className="h-4 w-4" />
            Vận hành
          </TabsTrigger>
          <TabsTrigger value="system-settings">
            <FileJson className="h-4 w-4" />
            Key/value
          </TabsTrigger>
          <TabsTrigger value="master-data">
            <Database className="h-4 w-4" />
            Danh mục CRUD
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Luồng vận hành</CardTitle>
              <CardDescription>Bật/tắt workflow chính, chính sách học thử và cảnh báo nền tảng.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!canUpdateSettings && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Bạn đang ở chế độ chỉ xem. Cần quyền settings.update để thay đổi cấu hình.
                </div>
              )}

              {settings && (
                <>
                  <div className="grid gap-3 md:grid-cols-2">
                    <SwitchRow
                      title="Cho phép booking học thử"
                      description="Tắt khi cần dừng tạo booking mới."
                      checked={settings.bookingEnabled}
                      disabled={!canUpdateSettings}
                      onChange={(checked) => updateSetting("bookingEnabled", checked)}
                    />
                    <SwitchRow
                      title="Cho phép gia sư đăng ký"
                      description="Tắt khi cần đóng cổng tuyển gia sư."
                      checked={settings.tutorRegistrationEnabled}
                      disabled={!canUpdateSettings}
                      onChange={(checked) => updateSetting("tutorRegistrationEnabled", checked)}
                    />
                    <SwitchRow
                      title="Tự động gợi ý matching"
                      description="Bật score/reason gợi ý gia sư từ backend."
                      checked={settings.autoMatchingEnabled}
                      disabled={!canUpdateSettings}
                      onChange={(checked) => updateSetting("autoMatchingEnabled", checked)}
                    />
                    <SwitchRow
                      title="Maintenance mode"
                      description="Cần xác nhận mạnh khi lưu trạng thái này."
                      checked={settings.maintenanceMode}
                      disabled={!canUpdateSettings}
                      onChange={(checked) => updateSetting("maintenanceMode", checked)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                    <div className="grid gap-2">
                      <Label>Commission rate (%)</Label>
                      <Input
                        disabled={!canUpdateSettings}
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={Math.round(Number(settings.commissionRate || 0) * 10000) / 100}
                        onChange={(event) => updateSetting("commissionRate", Number(event.target.value) / 100)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Chính sách học thử</Label>
                      <Textarea
                        disabled={!canUpdateSettings}
                        value={settings.trialLessonPolicy}
                        onChange={(event) => updateSetting("trialLessonPolicy", event.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <SwitchRow
                      title="Email"
                      description="Cảnh báo qua email."
                      checked={settings.notificationSettings.email}
                      disabled={!canUpdateSettings}
                      compact
                      onChange={(checked) => updateNotification("email", checked)}
                    />
                    <SwitchRow
                      title="In-app"
                      description="Thông báo trong hệ thống."
                      checked={settings.notificationSettings.inApp}
                      disabled={!canUpdateSettings}
                      compact
                      onChange={(checked) => updateNotification("inApp", checked)}
                    />
                    <SwitchRow
                      title="Payment alerts"
                      description="Cảnh báo thanh toán."
                      checked={settings.notificationSettings.paymentAlerts}
                      disabled={!canUpdateSettings}
                      compact
                      onChange={(checked) => updateNotification("paymentAlerts", checked)}
                    />
                    <SwitchRow
                      title="Review alerts"
                      description="Cảnh báo đánh giá."
                      checked={settings.notificationSettings.reviewAlerts}
                      disabled={!canUpdateSettings}
                      compact
                      onChange={(checked) => updateNotification("reviewAlerts", checked)}
                    />
                  </div>

                  <ConfirmReasonDialog
                    trigger={
                      <AdminActionButton disabled={savingSettings} availability={saveAvailability}>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu cấu hình vận hành
                      </AdminActionButton>
                    }
                    title="Lưu cài đặt hệ thống"
                    description="Thay đổi cấu hình có thể ảnh hưởng booking, matching hoặc vận hành nền tảng. Hãy ghi rõ lý do để audit."
                    actionName="Lưu cài đặt"
                    severity={settings.maintenanceMode ? "danger" : "warning"}
                    requireTypedConfirmation={settings.maintenanceMode ? "MAINTENANCE" : undefined}
                    loading={savingSettings}
                    reasonOptions={[
                      { value: "OPS_POLICY_UPDATE", label: "Cập nhật policy vận hành" },
                      { value: "FINANCE_POLICY_UPDATE", label: "Cập nhật chính sách tài chính" },
                      { value: "OTHER", label: "Lý do khác" },
                    ]}
                    onConfirm={(reason, note) => saveOperationalSettings(note || reason)}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system-settings">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle>System settings nâng cao</CardTitle>
                  <CardDescription>Quản lý key/value tại `/admin/system-settings`, gồm JSON, số, boolean và dữ liệu nhạy cảm.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    id="system-settings-import"
                    className="hidden"
                    type="file"
                    accept="application/json,.json"
                    onChange={(event) => {
                      importSystemSettings(event.target.files?.[0])
                      event.currentTarget.value = ""
                    }}
                  />
                  <Button variant="outline" disabled={!canUpdateSettings || importingSettings} onClick={() => document.getElementById("system-settings-import")?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {importingSettings ? "Đang import" : "Import JSON"}
                  </Button>
                  <Button variant="outline" onClick={exportSystemSettings}>
                    <Download className="mr-2 h-4 w-4" />
                    Export JSON
                  </Button>
                  <Button disabled={!canUpdateSettings} onClick={openNewSystemSetting}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm key
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={systemSearch} onChange={(event) => setSystemSearch(event.target.value)} className="pl-9" placeholder="Tìm key, mô tả, giá trị..." />
                </div>
                <Select value={systemTypeFilter} onValueChange={setSystemTypeFilter}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả type</SelectItem>
                    <SelectItem value="string">string</SelectItem>
                    <SelectItem value="number">number</SelectItem>
                    <SelectItem value="boolean">boolean</SelectItem>
                    <SelectItem value="json">json</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Cập nhật</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSystemSettings.map((item) => (
                    <TableRow key={String(item.key || item.id)}>
                      <TableCell className="min-w-64 whitespace-normal">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-950">{String(item.key)}</span>
                          {item.isSensitive && <Badge variant="outline">Sensitive</Badge>}
                        </div>
                        {item.description && <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>}
                      </TableCell>
                      <TableCell className="max-w-md whitespace-normal">
                        {item.isSensitive ? (
                          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                            <EyeOff className="h-4 w-4" />
                            Giá trị bị ẩn bởi backend
                          </span>
                        ) : (
                          <code className="break-words rounded bg-slate-50 px-2 py-1 text-xs text-slate-700">{settingValue(item.value)}</code>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{String(item.valueType || "json")}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime(item.updatedAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openSystemSettingHistory(item)}>
                            <History className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" disabled={!canUpdateSettings} onClick={() => duplicateSystemSetting(item)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" disabled={!canUpdateSettings} onClick={() => openEditSystemSetting(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" disabled={!canUpdateSettings} onClick={() => setPendingDeleteSystemSetting(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredSystemSettings.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        Không có system setting phù hợp.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="master-data">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <CardTitle>Danh mục hệ thống CRUD</CardTitle>
                  <CardDescription>Tạo, sửa, nhân bản, bật/tắt và ẩn danh mục lõi qua `/admin/master-data/*`.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => downloadJson(`${selectedKind}.json`, currentCatalogItems)}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button disabled={!canManageMasterData} onClick={openNewMasterData}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm {MASTER_DATA_META[selectedKind].label.toLowerCase()}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!canManageMasterData && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Bạn có thể xem danh mục active. Cần quyền master_data.manage để tạo, sửa hoặc ẩn danh mục.</span>
                </div>
              )}

              <div className="grid gap-3 xl:grid-cols-[260px_1fr_180px]">
                <Select value={selectedKind} onValueChange={(value) => setSelectedKind(value as MasterDataKind)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MASTER_DATA_META).map(([kind, meta]) => (
                      <SelectItem key={kind} value={kind}>
                        {meta.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} className="pl-9" placeholder="Tìm tên, mã, mô tả..." />
                </div>
                <Select value={catalogStatusFilter} onValueChange={(value) => setCatalogStatusFilter(value as StatusFilter)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang dùng</SelectItem>
                    <SelectItem value="inactive">Đang ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 md:grid-cols-[1fr_auto] md:items-center">
                <div className="flex items-start gap-3">
                  {(() => {
                    const Icon = MASTER_DATA_META[selectedKind].icon
                    return <Icon className="mt-1 h-5 w-5 text-primary" />
                  })()}
                  <div>
                    <p className="font-semibold text-slate-950">{MASTER_DATA_META[selectedKind].label}</p>
                    <p className="text-sm text-muted-foreground">{MASTER_DATA_META[selectedKind].description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" disabled={!canManageMasterData || selectedVisibleItems.length === 0} onClick={() => setPendingBulkActive(true)}>
                    Bật đã chọn
                  </Button>
                  <Button variant="outline" size="sm" disabled={!canManageMasterData || selectedVisibleItems.length === 0} onClick={() => setPendingBulkActive(false)}>
                    Ẩn đã chọn
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox checked={allVisibleSelected} onCheckedChange={(checked) => {
                        setSelectedIds(checked ? filteredCatalogItems.map((item) => item.id) : [])
                      }} />
                    </TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Mã / phân loại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCatalogItems.map((item) => {
                    const active = isRecordActive(item)
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(item.id)}
                            onCheckedChange={(checked) => {
                              setSelectedIds((current) => checked ? [...new Set([...current, item.id])] : current.filter((id) => id !== item.id))
                            }}
                          />
                        </TableCell>
                        <TableCell className="min-w-64 whitespace-normal">
                          <p className="font-semibold text-slate-950">{item.name}</p>
                          {recordDescription(item) && <p className="mt-1 text-xs text-muted-foreground">{recordDescription(item)}</p>}
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <div className="flex flex-wrap gap-2">
                            {recordCode(item) && <Badge variant="outline">{recordCode(item)}</Badge>}
                            {recordMeta(item, selectedKind).map((meta) => (
                              <Badge key={meta} variant="secondary">{meta}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={active ? "secondary" : "outline"} className={active ? "" : "text-slate-500"}>
                            {active ? "Đang dùng" : "Đang ẩn"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" disabled={!canManageMasterData} onClick={() => duplicateMasterData(item)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" disabled={!canManageMasterData} onClick={() => openEditMasterData(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openUsage(item)}>
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" disabled={!canManageMasterData} onClick={() => toggleMasterDataActive(item, !active)}>
                              {active ? "Ẩn" : "Bật"}
                            </Button>
                            <Button size="sm" variant="outline" disabled={!canManageMasterData || !active} onClick={() => openDeleteMasterData(item)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {!filteredCatalogItems.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        Không có danh mục phù hợp.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SystemSettingDialog
        open={systemSettingDialogOpen}
        form={systemSettingForm}
        loading={savingSystemSetting}
        canUpdate={canUpdateSettings}
        onOpenChange={setSystemSettingDialogOpen}
        onChange={setSystemSettingForm}
        onSave={saveSystemSetting}
      />

      <MasterDataDialog
        open={masterDataDialogOpen}
        kind={selectedKind}
        form={masterDataForm}
        loading={savingMasterData}
        canUpdate={canManageMasterData}
        subjectCategories={subjectCategories}
        languages={languages}
        locations={catalogs.locations as Location[]}
        onOpenChange={setMasterDataDialogOpen}
        onChange={setMasterDataForm}
        onSave={saveMasterData}
      />

      <SystemSettingHistoryDialog
        open={!!historySetting}
        setting={historySetting}
        items={historyItems}
        loading={historyLoading}
        onOpenChange={(open) => !open && setHistorySetting(null)}
      />

      <MasterDataUsageDialog
        open={!!usageItem && !pendingDelete}
        item={usageItem}
        usage={usage}
        loading={usageLoading}
        onOpenChange={(open) => !open && setUsageItem(null)}
      />

      <ConfirmReasonDialog
        open={!!pendingDeleteSystemSetting}
        onOpenChange={(open) => !open && setPendingDeleteSystemSetting(null)}
        title="Xóa system setting"
        description={`Key ${pendingDeleteSystemSetting?.key || ""} sẽ bị xóa khỏi backend. Các service đang đọc key này có thể quay về fallback mặc định.`}
        actionName="Xóa key"
        severity="danger"
        requireTypedConfirmation="DELETE"
        reasonOptions={[
          { value: "SYSTEM_SETTING_DEPRECATED", label: "Key không còn sử dụng" },
          { value: "SYSTEM_SETTING_DUPLICATE", label: "Key bị trùng hoặc sai" },
          { value: "OTHER", label: "Lý do khác" },
        ]}
        onConfirm={deleteSystemSetting}
      />

      <ConfirmReasonDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null)
            setUsageItem(null)
          }
        }}
        title="Ẩn danh mục hệ thống"
        description={masterDataDeleteDescription(pendingDelete, usage, usageLoading)}
        actionName="Ẩn danh mục"
        severity="danger"
        requireTypedConfirmation="DISABLE"
        reasonOptions={[
          { value: "MASTER_DATA_DUPLICATE", label: "Trùng hoặc sai danh mục" },
          { value: "MASTER_DATA_DEPRECATED", label: "Không còn sử dụng" },
          { value: "OTHER", label: "Lý do khác" },
        ]}
        onConfirm={deleteMasterData}
      />

      <ConfirmReasonDialog
        open={pendingBulkActive !== null}
        onOpenChange={(open) => !open && setPendingBulkActive(null)}
        title={pendingBulkActive ? "Bật danh mục đã chọn" : "Ẩn danh mục đã chọn"}
        description={`Thao tác này áp dụng cho ${selectedVisibleItems.length} danh mục đang được chọn.`}
        actionName={pendingBulkActive ? "Bật danh mục" : "Ẩn danh mục"}
        severity={pendingBulkActive ? "warning" : "danger"}
        requireTypedConfirmation={pendingBulkActive ? undefined : "DISABLE"}
        loading={bulkLoading}
        reasonOptions={[
          { value: "BULK_MASTER_DATA_UPDATE", label: "Cập nhật hàng loạt danh mục" },
          { value: "OTHER", label: "Lý do khác" },
        ]}
        onConfirm={bulkSetActive}
      />
    </div>
  )
}

function SystemSettingHistoryDialog({
  open,
  setting,
  items,
  loading,
  onOpenChange,
}: {
  open: boolean
  setting: SystemSettingItem | null
  items: SystemSettingHistoryItem[]
  loading: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Lịch sử system setting</DialogTitle>
          <DialogDescription>{setting?.key ? `Các thay đổi gần nhất của key ${setting.key}.` : "Lịch sử thay đổi key cấu hình."}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
          {loading && <div className="soft-panel p-5 text-sm text-muted-foreground">Đang tải lịch sử...</div>}
          {!loading && !items.length && <div className="soft-panel p-5 text-sm text-muted-foreground">Chưa có audit history cho key này.</div>}
          {!loading && items.map((item) => (
            <div key={item.id || `${item.action}-${item.createdAt}`} className="item-row space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary">{item.action || "unknown"}</Badge>
                <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
              </div>
              <p className="text-sm font-medium text-slate-900">{item.description || "Không có mô tả"}</p>
              <p className="text-xs text-muted-foreground">Actor: {item.actorRole || "-"} {item.actorId ? `(${item.actorId})` : ""}</p>
              {item.metadata !== undefined && (
                <pre className="max-h-44 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
                  {JSON.stringify(item.metadata, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MasterDataUsageDialog({
  open,
  item,
  usage,
  loading,
  onOpenChange,
}: {
  open: boolean
  item: MasterDataRecord | null
  usage: MasterDataUsage | null
  loading: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dependency usage</DialogTitle>
          <DialogDescription>{item?.name ? `Các nơi đang tham chiếu "${item.name}".` : "Kiểm tra usage trước khi ẩn danh mục."}</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="soft-panel p-5 text-sm text-muted-foreground">Đang kiểm tra usage...</div>
        ) : (
          <div className="space-y-4">
            <div className={cn("rounded-lg border p-4", usage?.hasUsage ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50")}>
              <p className={cn("font-semibold", usage?.hasUsage ? "text-amber-800" : "text-emerald-800")}>
                {usage?.hasUsage ? `Đang có ${usage.total} tham chiếu` : "Chưa thấy dependency trực tiếp"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ẩn danh mục vẫn giữ dữ liệu lịch sử, nhưng các luồng chọn mới sẽ không còn thấy item này.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(usage?.counts || {}).map(([key, value]) => (
                <div key={key} className="item-row">
                  <p className="text-sm text-muted-foreground">{key}</p>
                  <p className="mt-1 text-xl font-bold text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SystemSettingDialog({
  open,
  form,
  loading,
  canUpdate,
  onOpenChange,
  onChange,
  onSave,
}: {
  open: boolean
  form: SystemSettingFormState
  loading: boolean
  canUpdate: boolean
  onOpenChange: (open: boolean) => void
  onChange: (form: SystemSettingFormState) => void
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{form.editKey ? "Sửa system setting" : "Thêm system setting"}</DialogTitle>
          <DialogDescription>Giá trị JSON sẽ được validate trước khi gửi backend.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-[1fr_160px]">
            <div className="grid gap-2">
              <Label>Key</Label>
              <Input disabled={!canUpdate || Boolean(form.editKey)} value={form.key} onChange={(event) => onChange({ ...form, key: event.target.value })} placeholder="payment.reconciliation.sla_hours" />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={form.valueType} onValueChange={(value) => onChange({ ...form, valueType: value })} disabled={!canUpdate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">string</SelectItem>
                  <SelectItem value="number">number</SelectItem>
                  <SelectItem value="boolean">boolean</SelectItem>
                  <SelectItem value="json">json</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Value</Label>
            <Textarea
              disabled={!canUpdate}
              value={form.value}
              onChange={(event) => onChange({ ...form, value: event.target.value })}
              rows={form.valueType === "json" ? 8 : 4}
              placeholder={
                form.editKey && form.isSensitive
                  ? "Để trống để giữ nguyên giá trị nhạy cảm hiện tại"
                  : form.valueType === "json"
                    ? '{"enabled":true,"slaHours":24}'
                    : "Nhập giá trị cấu hình"
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Mô tả</Label>
            <Textarea disabled={!canUpdate} value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} rows={2} />
          </div>
          <div className="item-row flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-950">Dữ liệu nhạy cảm</p>
              <p className="text-sm text-muted-foreground">Backend sẽ không trả value khi setting được đánh dấu sensitive.</p>
            </div>
            <Switch disabled={!canUpdate} checked={form.isSensitive} onCheckedChange={(checked) => onChange({ ...form, isSensitive: checked })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Hủy</Button>
          <Button onClick={onSave} disabled={!canUpdate || loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MasterDataDialog({
  open,
  kind,
  form,
  loading,
  canUpdate,
  subjectCategories,
  languages,
  locations,
  onOpenChange,
  onChange,
  onSave,
}: {
  open: boolean
  kind: MasterDataKind
  form: MasterDataFormState
  loading: boolean
  canUpdate: boolean
  subjectCategories: SubjectCategory[]
  languages: Language[]
  locations: Location[]
  onOpenChange: (open: boolean) => void
  onChange: (form: MasterDataFormState) => void
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{form.id ? `Sửa ${MASTER_DATA_META[kind].label.toLowerCase()}` : `Thêm ${MASTER_DATA_META[kind].label.toLowerCase()}`}</DialogTitle>
          <DialogDescription>{MASTER_DATA_META[kind].description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <div className="grid gap-2">
              <Label>Tên *</Label>
              <Input disabled={!canUpdate} value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Mã</Label>
              <Input disabled={!canUpdate || Boolean(form.id && kind !== "subjects")} value={form.code} onChange={(event) => onChange({ ...form, code: event.target.value.toUpperCase() })} placeholder="AUTO_CODE" />
            </div>
          </div>

          {kind === "subjects" && (
            <>
              <div className="grid gap-2">
                <Label>Nhóm môn học</Label>
                <Select value={form.categoryId || "none"} onValueChange={(value) => onChange({ ...form, categoryId: value === "none" ? "" : value })} disabled={!canUpdate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không chọn</SelectItem>
                    {subjectCategories.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <SwitchRow compact title="Môn học thuật" checked={form.isAcademicSubject} disabled={!canUpdate} onChange={(checked) => onChange({ ...form, isAcademicSubject: checked })} />
                <SwitchRow compact title="Ngoại ngữ" checked={form.isLanguage} disabled={!canUpdate} onChange={(checked) => onChange({ ...form, isLanguage: checked })} />
                <SwitchRow compact title="Luyện thi" checked={form.isTestPrep} disabled={!canUpdate} onChange={(checked) => onChange({ ...form, isTestPrep: checked })} />
                <SwitchRow compact title="Kỹ năng" checked={form.isSkill} disabled={!canUpdate} onChange={(checked) => onChange({ ...form, isSkill: checked })} />
              </div>
            </>
          )}

          {kind === "locations" && (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Loại</Label>
                <Select value={form.type} onValueChange={(value) => onChange({ ...form, type: value })} disabled={!canUpdate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROVINCE">PROVINCE</SelectItem>
                    <SelectItem value="WARD">WARD</SelectItem>
                    <SelectItem value="SPECIAL_ZONE">SPECIAL_ZONE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Parent</Label>
                <Select value={form.parentId || "none"} onValueChange={(value) => onChange({ ...form, parentId: value === "none" ? "" : value })} disabled={!canUpdate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không chọn</SelectItem>
                    {locations.filter((item) => item.id !== form.id).map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Full path</Label>
                <Input disabled={!canUpdate} value={form.fullPath} onChange={(event) => onChange({ ...form, fullPath: event.target.value })} placeholder={form.name || "TP.HCM / Quận 1"} />
              </div>
            </div>
          )}

          {kind === "certificates" && (
            <div className="grid gap-2">
              <Label>Ngôn ngữ liên quan</Label>
              <Select value={form.languageId || "none"} onValueChange={(value) => onChange({ ...form, languageId: value === "none" ? "" : value })} disabled={!canUpdate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {languages.map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Mô tả</Label>
            <Textarea disabled={!canUpdate} value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} rows={3} />
          </div>
          <SwitchRow title="Đang dùng" description="Tắt để ẩn khỏi các luồng chọn mới." checked={form.isActive} disabled={!canUpdate} onChange={(checked) => onChange({ ...form, isActive: checked })} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Hủy</Button>
          <Button onClick={onSave} disabled={!canUpdate || loading}>
            {loading ? "Đang lưu..." : "Lưu danh mục"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MetricCard({ icon: Icon, label, value, tone = "normal" }: { icon: typeof Settings; label: string; value: string | number; tone?: "normal" | "warning" | "danger" }) {
  return (
    <div className={cn(
      "surface-panel p-4",
      tone === "warning" && "border-amber-200 bg-amber-50/80",
      tone === "danger" && "border-red-200 bg-red-50/80"
    )}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className={cn("h-5 w-5 text-primary", tone === "warning" && "text-amber-600", tone === "danger" && "text-red-600")} />
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  )
}

function SwitchRow({
  title,
  description,
  checked,
  disabled,
  compact,
  onChange,
}: {
  title: string
  description?: string
  checked: boolean
  disabled?: boolean
  compact?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className={cn("item-row flex items-center justify-between gap-4", compact && "p-3")}>
      <div>
        <p className="font-medium text-slate-950">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  )
}

function settingValue(value: unknown) {
  if (value === undefined || value === null) return ""
  return typeof value === "string" ? value : JSON.stringify(value)
}

function masterDataDeleteDescription(item: MasterDataRecord | null, usage: MasterDataUsage | null, loading: boolean) {
  const name = item?.name ? `"${item.name}"` : "Danh mục"
  if (loading) return `${name} sẽ bị tắt khỏi các luồng sử dụng mới. Đang kiểm tra dependency trực tiếp...`
  if (usage?.hasUsage) {
    return `${name} đang có ${usage.total || 0} tham chiếu trực tiếp. Thao tác này là xóa mềm: dữ liệu lịch sử vẫn giữ, nhưng item sẽ bị ẩn khỏi lựa chọn mới.`
  }
  return `${name} sẽ bị tắt khỏi các luồng sử dụng mới. Chưa thấy dependency trực tiếp từ backend usage check.`
}

function normalizeSystemSettingImport(raw: unknown): Array<{ key: string; value: string; type?: string; valueType: string; description?: string; isSensitive?: boolean }> {
  const rows = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? Object.entries(raw as Record<string, unknown>).map(([key, value]) => ({ key, value }))
      : []

  return rows
    .map((row) => {
      const item = row && typeof row === "object" ? (row as Record<string, unknown>) : {}
      const key = String(item.key || "").trim()
      const valueType = String(item.valueType || item.type || inferSettingType(item.value))
      return {
        key,
        value: settingValue(item.value),
        type: valueType,
        valueType,
        description: item.description ? String(item.description) : undefined,
        isSensitive: Boolean(item.isSensitive),
      }
    })
    .filter((item) => item.key)
}

function inferSettingType(value: unknown) {
  if (typeof value === "boolean") return "boolean"
  if (typeof value === "number") return "number"
  if (typeof value === "object" && value !== null) return "json"
  return "string"
}

function validateSettingValue(value: string, type: string): { ok: true } | { ok: false; message: string } {
  if (type === "number" && !Number.isFinite(Number(value))) return { ok: false, message: "Giá trị number không hợp lệ" }
  if (type === "boolean" && !["true", "false"].includes(value.trim().toLowerCase())) return { ok: false, message: "Boolean chỉ nhận true hoặc false" }
  if (type === "json") {
    try {
      JSON.parse(value)
    } catch {
      return { ok: false, message: "JSON không hợp lệ" }
    }
  }
  return { ok: true }
}

function formatDateTime(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("vi-VN")
}

function isRecordActive(item: MasterDataRecord) {
  return item.isActive !== false
}

function recordCode(item: MasterDataRecord) {
  return "code" in item ? item.code : undefined
}

function recordDescription(item: MasterDataRecord) {
  return "description" in item ? item.description : undefined
}

function recordMeta(item: MasterDataRecord, kind: MasterDataKind) {
  if (kind === "subjects") {
    const subject = item as Subject
    return [subject.categoryName || subject.category, subject.tutorCount !== undefined ? `${subject.tutorCount} gia sư` : undefined].filter(Boolean) as string[]
  }
  if (kind === "locations") {
    const location = item as Location
    return [location.type, location.fullPath || location.city || location.district].filter(Boolean) as string[]
  }
  const certificate = item as Certificate
  return [certificate.languageName || certificate.languageCode].filter(Boolean) as string[]
}

function searchableRecordValues(item: MasterDataRecord) {
  return [
    item.name,
    recordCode(item),
    recordDescription(item),
    ...recordMeta(item, "categoryName" in item || "category" in item ? "subjects" : "type" in item ? "locations" : "certificates"),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
}

function toMasterDataForm(item: MasterDataRecord, kind: MasterDataKind): MasterDataFormState {
  const base = {
    ...EMPTY_MASTER_DATA_FORM,
    id: item.id,
    name: item.name || "",
    code: recordCode(item) || "",
    description: recordDescription(item) || "",
    isActive: isRecordActive(item),
  }
  if (kind === "subjects") {
    const subject = item as Subject
    return {
      ...base,
      categoryId: subject.categoryId || "",
    }
  }
  if (kind === "locations") {
    const location = item as Location
    return {
      ...base,
      type: location.type || "PROVINCE",
      parentId: location.parentId || "",
      fullPath: location.fullPath || location.name || "",
    }
  }
  const certificate = item as Certificate
  return {
    ...base,
    languageId: certificate.languageId || "",
  }
}

function buildMasterDataPayload(kind: MasterDataKind, form: MasterDataFormState) {
  const common = {
    name: form.name.trim(),
    code: form.code.trim() || undefined,
    description: form.description.trim() || undefined,
    isActive: form.isActive,
  }
  if (kind === "subjects") {
    return {
      ...common,
      categoryId: form.categoryId || undefined,
      isAcademicSubject: form.isAcademicSubject,
      isLanguage: form.isLanguage,
      isTestPrep: form.isTestPrep,
      isSkill: form.isSkill,
    }
  }
  if (kind === "locations") {
    return {
      ...common,
      type: form.type || "PROVINCE",
      parentId: form.parentId || undefined,
      fullPath: form.fullPath.trim() || form.name.trim(),
    }
  }
  return {
    ...common,
    languageId: form.languageId || undefined,
  }
}

function downloadJson(fileName: string, value: unknown) {
  if (typeof window === "undefined") return
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}
