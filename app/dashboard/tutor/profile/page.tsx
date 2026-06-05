"use client"

import { useEffect, useMemo, useState } from "react"
import { BadgeCheck, BookOpenCheck, CalendarPlus, FileCheck2, FileUp, GraduationCap, MapPin, Plus, ShieldAlert, Star, Trash2, Wallet, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { DashboardMetricCard, EntityCard, PageHero, PublicDataNotice } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useMasterDataCatalog } from "@/lib/hooks/use-master-data"
import { useTutorProfileByUser } from "@/lib/hooks/use-tutors"
import { tutorService } from "@/lib/services"
import { formatCurrency } from "@/lib/helpers"
import { cn } from "@/lib/utils"
import type { AvailableSlot, GradeLevel, Location, Subject, TeachingModeOption, Tutor } from "@/types"

const weekdays = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
]

type CatalogOption = {
  id?: string
  name: string
  code?: string
  fullPath?: string
  value?: string
  label?: string
}

export default function TutorProfilePage() {
  const { user } = useAuthContext()
  const { tutor: profile, updateTutorProfile } = useTutorProfileByUser(user?.id)
  const {
    subjects: subjectOptions,
    grades: gradeOptions,
    locations: locationOptions,
    teachingModes,
    error: masterDataError,
    isLoading: masterDataLoading,
    refresh: refreshMasterData,
  } = useMasterDataCatalog()
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [bio, setBio] = useState("")
  const [price, setPrice] = useState(0)
  const [method, setMethod] = useState("")
  const [subjects, setSubjects] = useState<string[]>([])
  const [grades, setGrades] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [teachingMode, setTeachingMode] = useState("both")
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTutor(profile || null)
    setBio(profile?.bio || "")
    setPrice(profile?.pricePerHour || 0)
    setMethod(profile?.teachingMethod || "")
    setSubjects(profile?.subjects || [])
    setGrades(profile?.grades || [])
    setLocations(profile?.locations || [])
    setTeachingMode(resolveTeachingModeValue(profile?.teachingModes, teachingModes) || profile?.teachingModes || "both")
    setAvailableSlots(profile?.availableSlots || [])
  }, [profile, teachingModes])

  const normalizedSubjects = useMemo(
    () => normalizeCatalogSelection(subjects, subjectOptions, subjectValue),
    [subjects, subjectOptions]
  )
  const normalizedGrades = useMemo(
    () => normalizeCatalogSelection(grades, gradeOptions, gradeValue),
    [grades, gradeOptions]
  )
  const normalizedLocations = useMemo(
    () => normalizeCatalogSelection(locations, locationOptions, locationValue),
    [locations, locationOptions]
  )

  const save = async () => {
    if (!tutor) return
    const sanitizedSlots = availableSlots.filter((slot) => slot.startTime && slot.endTime)
    const invalidSlot = sanitizedSlots.find((slot) => slot.startTime >= slot.endTime)
    if (invalidSlot) {
      toast.error("Lịch rảnh chưa hợp lệ", {
        description: "Giờ kết thúc phải sau giờ bắt đầu.",
      })
      return
    }

    setSaving(true)
    try {
      const updated = await updateTutorProfile(tutor.id, {
        bio,
        pricePerHour: price,
        teachingMethod: method,
        subjects: normalizedSubjects,
        grades: normalizedGrades,
        teachingModes: teachingMode,
        locations: normalizedLocations,
        availableSlots: sanitizedSlots,
      })
      if (updated) {
        setTutor(updated)
        toast.success("Cập nhật hồ sơ thành công")
      } else {
        toast.error("Không thể cập nhật hồ sơ gia sư")
      }
    } finally {
      setSaving(false)
    }
  }

  const addSlot = () => {
    setAvailableSlots((current) => [
      ...current,
      {
        dayOfWeek: nextAvailableDay(current),
        startTime: "18:00",
        endTime: "20:00",
      },
    ])
  }

  const updateSlot = <K extends keyof AvailableSlot>(index: number, key: K, value: AvailableSlot[K]) => {
    setAvailableSlots((current) =>
      current.map((slot, slotIndex) => (slotIndex === index ? { ...slot, [key]: value } : slot))
    )
  }

  const removeSlot = (index: number) => {
    setAvailableSlots((current) => current.filter((_, slotIndex) => slotIndex !== index))
  }

  const uploadDocument = async () => {
    if (!tutor || !selectedFile) return
    const result = await tutorService.uploadDocument(tutor.id, selectedFile, "certificate")
    if (result.success) {
      const next = await tutorService.getTutorById(tutor.id)
      setTutor(next)
      setSelectedFile(null)
      toast.success("Đã upload giấy tờ xác minh")
    } else {
      toast.error(result.error || "Không thể upload giấy tờ")
    }
  }

  const submitForReview = async () => {
    if (!tutor) return
    const result = await tutorService.submitForReview(tutor.id)
    if (result.success && result.tutor) {
      setTutor(result.tutor)
      toast.success("Đã gửi hồ sơ xét duyệt")
    }
  }

  if (!tutor) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Chưa có hồ sơ gia sư</CardTitle>
          <CardDescription>Hãy gửi hồ sơ tại trang đăng ký làm gia sư để được xét duyệt.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Tutor profile"
        title="Hồ sơ của tôi"
        description="Quản lý thông tin công khai, giấy tờ xác minh và trạng thái xét duyệt để sẵn sàng nhận booking."
        icon={GraduationCap}
        actions={<Button onClick={submitForReview}>Gửi hồ sơ xét duyệt</Button>}
        stats={[
          { label: "Trạng thái", value: tutor.approvalStatus },
          { label: "Rating", value: `${tutor.rating.toFixed(1)}/5` },
          { label: "Review", value: tutor.reviewCount },
        ]}
      />
      <EntityCard
        title={tutor.fullName}
        subtitle={`${tutor.university} · ${tutor.major}`}
        meta={tutor.subjects.join(", ")}
        icon={tutor.approvalStatus === "approved" ? BadgeCheck : ShieldAlert}
        tone={tutor.approvalStatus === "approved" ? "emerald" : tutor.approvalStatus === "rejected" || tutor.approvalStatus === "suspended" ? "rose" : "amber"}
        badge={<StatusBadge kind="approval" status={tutor.approvalStatus} />}
      >
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          {tutor.updateRequestNote && <p className="text-amber-700 sm:col-span-2">{tutor.updateRequestNote}</p>}
          {tutor.rejectReason && <p className="text-red-700 sm:col-span-2">Lý do từ chối: {tutor.rejectReason}</p>}
          {tutor.suspensionReason && <p className="text-red-700 sm:col-span-2">Lý do khóa: {tutor.suspensionReason}</p>}
          <p className="text-muted-foreground">Hình thức: {tutor.teachingModes}</p>
          <p className="text-muted-foreground">Khu vực: {tutor.locations.join(", ") || "Online"}</p>
        </div>
      </EntityCard>
      <Card>
        <CardHeader>
          <CardTitle>Onboarding checklist</CardTitle>
          <CardDescription>Hoàn thiện các mục bắt buộc trước khi nhận booking.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {[
            ["Ảnh đại diện", Boolean(tutor.avatar)],
            ["Bio", tutor.bio.length > 40],
            ["Môn dạy", tutor.subjects.length > 0],
            ["Lớp dạy", tutor.grades.length > 0],
            ["Khu vực", tutor.teachingModes === "online" || tutor.locations.length > 0],
            ["Học phí", tutor.pricePerHour > 0],
            ["Lịch rảnh", tutor.availableSlots.length > 0],
            ["Giấy tờ", Boolean(tutor.documents?.length)],
          ].map(([label, done]) => (
            <div key={String(label)} className="soft-panel flex items-center justify-between gap-3 bg-white p-3">
              <span className="font-medium">{label}</span>
              <span className={done ? "rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700" : "rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"}>
                {done ? "Hoàn tất" : "Cần bổ sung"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-3">
        <DashboardMetricCard label="Học phí hiện tại" value={`${formatCurrency(tutor.pricePerHour)}/giờ`} icon={Wallet} tone="blue" />
        <DashboardMetricCard label="Đánh giá trung bình" value={`${tutor.rating.toFixed(1)}/5`} icon={Star} tone="amber" />
        <DashboardMetricCard label="Lượt đánh giá" value={tutor.reviewCount} icon={BookOpenCheck} tone="emerald" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa hồ sơ</CardTitle>
          <CardDescription>Cập nhật thông tin public dùng cho matching, trang chi tiết gia sư và điều kiện nhận lớp.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(masterDataLoading || masterDataError) && (
            <PublicDataNotice
              isLoading={masterDataLoading}
              loadingMessage="Đang tải danh mục môn, lớp và khu vực. Bạn vẫn có thể nhập thủ công nếu cần."
              message="Một số danh mục đang dùng dữ liệu dự phòng. Hồ sơ vẫn có thể cập nhật."
              onRetry={masterDataError ? () => refreshMasterData() : undefined}
              retryLabel="Tải lại danh mục"
            />
          )}
          <div className="space-y-2"><Label>Giới thiệu bản thân</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} placeholder="Tóm tắt kinh nghiệm, phong cách dạy và điểm mạnh của bạn..." /></div>
          <div className="space-y-2"><Label>Học phí/giờ</Label><Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
          <div className="space-y-2"><Label>Phương pháp dạy</Label><Textarea value={method} onChange={(e) => setMethod(e.target.value)} rows={4} placeholder="Ví dụ: kiểm tra đầu vào, chia nhỏ mục tiêu, gửi bài tập sau mỗi buổi..." /></div>

          <div className="grid gap-4 lg:grid-cols-2">
            <MultiChoiceGrid
              title="Môn dạy"
              description="Chọn các môn bạn có thể nhận lớp."
              options={subjectOptions}
              selected={normalizedSubjects}
              onChange={setSubjects}
              getValue={subjectValue}
              getLabel={(item) => item.name}
              customPlaceholder="Nhập môn khác"
            />
            <MultiChoiceGrid
              title="Lớp dạy"
              description="Chọn khối/lớp bạn dạy tốt."
              options={gradeOptions}
              selected={normalizedGrades}
              onChange={setGrades}
              getValue={gradeValue}
              getLabel={(item) => item.name}
              customPlaceholder="Nhập lớp khác"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-semibold text-slate-950">Hình thức dạy</p>
                  <p className="text-sm text-muted-foreground">Dùng cho bộ lọc và matching.</p>
                </div>
              </div>
              <Select value={teachingMode} onValueChange={setTeachingMode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn hình thức" />
                </SelectTrigger>
                <SelectContent>
                  {teachingModes.map((mode) => (
                    <SelectItem key={mode.id} value={mode.value}>
                      {mode.label || mode.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <MultiChoiceGrid
              title="Khu vực dạy offline"
              description="Chọn tỉnh/thành hoặc khu vực bạn có thể di chuyển."
              options={locationOptions}
              selected={normalizedLocations}
              onChange={setLocations}
              getValue={locationValue}
              getLabel={(item) => item.fullPath || item.name}
              customPlaceholder="Nhập khu vực khác"
            />
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <CalendarPlus className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-slate-950">Lịch rảnh</p>
                  <p className="text-sm text-muted-foreground">Thêm các khung giờ bạn có thể dạy thử hoặc nhận lớp.</p>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={addSlot}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm lịch
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {availableSlots.length ? availableSlots.map((slot, index) => (
                <div key={`${slot.dayOfWeek}-${index}`} className="grid gap-3 rounded-lg border bg-slate-50 p-3 md:grid-cols-[1fr_150px_150px_auto] md:items-end">
                  <div className="space-y-2">
                    <Label>Ngày</Label>
                    <Select value={String(slot.dayOfWeek)} onValueChange={(value) => updateSlot(index, "dayOfWeek", Number(value))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weekdays.map((day) => (
                          <SelectItem key={day.value} value={String(day.value)}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bắt đầu</Label>
                    <Input type="time" value={slot.startTime} onChange={(event) => updateSlot(index, "startTime", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Kết thúc</Label>
                    <Input type="time" value={slot.endTime} onChange={(event) => updateSlot(index, "endTime", event.target.value)} />
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={() => removeSlot(index)} aria-label="Xóa lịch rảnh">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )) : (
                <p className="rounded-lg border border-dashed bg-slate-50 px-4 py-6 text-center text-sm text-muted-foreground">
                  Chưa có lịch rảnh. Bấm "Thêm lịch" để khai báo khung giờ có thể dạy.
                </p>
              )}
            </div>
          </div>

          <Button onClick={save} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Giấy tờ xác minh</CardTitle>
          <CardDescription>Upload giấy tờ để admin kiểm tra và duyệt hồ sơ.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="soft-panel flex flex-col gap-3 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Thêm bằng cấp/chứng chỉ</p>
                <p className="text-sm text-muted-foreground">File được lưu trên backend và chuyển vào hàng đợi duyệt.</p>
              </div>
            </div>
            <Input className="sm:max-w-xs" type="file" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
          </div>
          {selectedFile && <p className="text-sm text-muted-foreground">{selectedFile.name} · {(selectedFile.size / 1024).toFixed(1)}KB · {selectedFile.type || "unknown"}</p>}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={uploadDocument} disabled={!selectedFile}>Upload giấy tờ</Button>
            <Button onClick={submitForReview}>Gửi hồ sơ xét duyệt</Button>
          </div>
          <div className="space-y-2">
            {(tutor.documents || []).map((document) => (
              <EntityCard
                key={document.id}
                title={document.fileName}
                subtitle={document.name}
                icon={FileCheck2}
                tone={document.status === "approved" ? "emerald" : document.status === "rejected" ? "rose" : "amber"}
                badge={<StatusBadge kind="approval" status={document.status} />}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MultiChoiceGrid<T extends CatalogOption>({
  title,
  description,
  options,
  selected,
  onChange,
  getValue,
  getLabel,
  customPlaceholder,
}: {
  title: string
  description: string
  options: T[]
  selected: string[]
  onChange: (value: string[]) => void
  getValue: (option: T) => string
  getLabel: (option: T) => string
  customPlaceholder: string
}) {
  const [customValue, setCustomValue] = useState("")

  const addCustomValue = () => {
    const value = customValue.trim()
    if (!value) return
    onChange(unique([...selected, value]))
    setCustomValue("")
  }

  const removeValue = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  const toggleOption = (option: T) => {
    onChange(toggleCatalogOption(selected, option, getValue))
  }

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-3">
        <p className="font-semibold text-slate-950">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {selected.length ? selected.map((value) => (
          <Badge key={value} variant="secondary" className="gap-1">
            {selectionLabel(value, options, getValue, getLabel)}
            <button type="button" onClick={() => removeValue(value)} aria-label={`Xóa ${value}`}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )) : (
          <span className="text-sm text-muted-foreground">Chưa chọn</span>
        )}
      </div>
      <div className="grid max-h-56 gap-2 overflow-y-auto rounded-lg border bg-slate-50 p-2 sm:grid-cols-2">
        {options.map((option) => {
          const value = getValue(option)
          const checked = isCatalogOptionSelected(selected, option, getValue)
          return (
            <label
              key={option.id || value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm transition-colors",
                checked && "border-primary/40 bg-primary/10 text-primary"
              )}
            >
              <Checkbox checked={checked} onCheckedChange={() => toggleOption(option)} />
              <span>{getLabel(option)}</span>
            </label>
          )
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <Input value={customValue} onChange={(event) => setCustomValue(event.target.value)} placeholder={customPlaceholder} />
        <Button type="button" variant="outline" onClick={addCustomValue}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function subjectValue(option: Subject) {
  return option.name
}

function gradeValue(option: GradeLevel) {
  return option.name
}

function locationValue(option: Location) {
  return option.fullPath || option.name
}

function optionTokens<T extends CatalogOption>(option: T, getValue: (option: T) => string) {
  return unique([getValue(option), option.id, option.name, option.code, option.fullPath, option.value, option.label].filter(Boolean) as string[])
}

function isCatalogOptionSelected<T extends CatalogOption>(selected: string[], option: T, getValue: (option: T) => string) {
  const tokens = optionTokens(option, getValue)
  return selected.some((value) => tokens.includes(value))
}

function toggleCatalogOption<T extends CatalogOption>(selected: string[], option: T, getValue: (option: T) => string) {
  const tokens = optionTokens(option, getValue)
  if (selected.some((value) => tokens.includes(value))) {
    return selected.filter((value) => !tokens.includes(value))
  }
  return unique([...selected, getValue(option)])
}

function normalizeCatalogSelection<T extends CatalogOption>(selected: string[], options: T[], getValue: (option: T) => string) {
  return unique(
    selected
      .map((value) => {
        const match = options.find((option) => optionTokens(option, getValue).includes(value))
        return match ? getValue(match) : value
      })
      .filter(Boolean)
  )
}

function selectionLabel<T extends CatalogOption>(
  value: string,
  options: T[],
  getValue: (option: T) => string,
  getLabel: (option: T) => string
) {
  const match = options.find((option) => optionTokens(option, getValue).includes(value))
  return match ? getLabel(match) : value
}

function resolveTeachingModeValue(value: string | undefined, options: TeachingModeOption[]) {
  if (!value) return undefined
  const match = options.find((option) => optionTokens(option, (item) => item.value).includes(value))
  return match?.value
}

function nextAvailableDay(slots: AvailableSlot[]) {
  return weekdays.find((day) => !slots.some((slot) => slot.dayOfWeek === day.value))?.value ?? 1
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}
