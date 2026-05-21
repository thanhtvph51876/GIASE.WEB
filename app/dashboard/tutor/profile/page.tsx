"use client"

import { useEffect, useState } from "react"
import { BadgeCheck, BookOpenCheck, FileCheck2, FileUp, GraduationCap, ShieldAlert, Star, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { DashboardMetricCard, EntityCard, PageHero } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useTutorProfileByUser } from "@/lib/hooks/use-tutors"
import { tutorService } from "@/lib/services"
import { formatCurrency } from "@/lib/helpers"
import type { Tutor } from "@/types"

export default function TutorProfilePage() {
  const { user } = useAuthContext()
  const { tutor: profile, updateTutorProfile } = useTutorProfileByUser(user?.id)
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [bio, setBio] = useState("")
  const [price, setPrice] = useState(0)
  const [method, setMethod] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    setTutor(profile || null)
    setBio(profile?.bio || "")
    setPrice(profile?.pricePerHour || 0)
    setMethod(profile?.teachingMethod || "")
  }, [profile])

  const save = async () => {
    if (!tutor) return
    const updated = await updateTutorProfile(tutor.id, { bio, pricePerHour: price, teachingMethod: method })
    if (updated) {
      setTutor(updated)
      toast.success("Cập nhật hồ sơ thành công")
    }
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
          <CardDescription>Các thông tin này hiển thị trong trang chi tiết gia sư.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Giới thiệu bản thân</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} placeholder="Tóm tắt kinh nghiệm, phong cách dạy và điểm mạnh của bạn..." /></div>
          <div className="space-y-2"><Label>Học phí/giờ</Label><Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
          <div className="space-y-2"><Label>Phương pháp dạy</Label><Textarea value={method} onChange={(e) => setMethod(e.target.value)} rows={4} placeholder="Ví dụ: kiểm tra đầu vào, chia nhỏ mục tiêu, gửi bài tập sau mỗi buổi..." /></div>
          <Button onClick={save}>Lưu thay đổi</Button>
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
