"use client"

import { FormEvent, type ReactNode, useState } from "react"
import Link from "next/link"
import { FileText, Loader2, ShieldCheck, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useTutorVerifications } from "@/lib/hooks/use-verifications"
import { formatDate } from "@/lib/helpers"
import type { UserVerification, VerificationType } from "@/types"

const agreementLines = [
  "Thông tin và giấy tờ cung cấp là đúng sự thật.",
  "Tôi là chủ sở hữu hợp pháp của giấy tờ đã tải lên.",
  "Tôi đồng ý để nền tảng xử lý dữ liệu phục vụ xác thực tài khoản.",
  "Tôi hiểu rằng nếu giả mạo, tài khoản có thể bị từ chối, bị khóa hoặc bị hủy quyền sử dụng.",
  "Tôi đồng ý với điều khoản sử dụng và chính sách dữ liệu của nền tảng.",
]

export default function TutorVerificationPage() {
  const { user } = useAuthContext()
  const { verifications, latest, isLoading, uploadTutorDocument, signAndSubmit } = useTutorVerifications(Boolean(user))
  const [active, setActive] = useState<UserVerification | null>(null)
  const [verificationType, setVerificationType] = useState<Exclude<VerificationType, "student_card">>("tutor_identity")
  const [file, setFile] = useState<File | null>(null)
  const [schoolName, setSchoolName] = useState("")
  const [studentCode, setStudentCode] = useState("")
  const [fullNameInput, setFullNameInput] = useState(user?.fullName || "")
  const [signerName, setSignerName] = useState(user?.fullName || "")
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const current = active || latest

  const onUpload = async (event: FormEvent) => {
    event.preventDefault()
    if (!file) return setError("Vui lòng chọn file giấy tờ.")
    setLoading(true)
    setError(null)
    try {
      const verification = await uploadTutorDocument({ file, verificationType, schoolName, studentCode, fullNameInput })
      setActive(verification)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải giấy tờ.")
    } finally {
      setLoading(false)
    }
  }

  const onSign = async (event: FormEvent) => {
    event.preventDefault()
    if (!current) return
    if (!accepted) return setError("Vui lòng xác nhận bản cam kết.")
    setLoading(true)
    setError(null)
    try {
      const verification = await signAndSubmit(current.id, signerName, user?.email)
      setActive(verification)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi xác thực.")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) return <div className="text-sm text-muted-foreground">Đang tải trạng thái xác thực...</div>

  return (
    <div className="space-y-6">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Xác thực gia sư</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Giấy tờ danh tính và bằng cấp</h1>
          </div>
          {current ? <StatusBadge kind="verification" status={current.status} /> : <StatusBadge kind="verification" status="draft" />}
        </div>
      </div>

      {error && <Alert variant="destructive"><AlertTitle>Không thể xử lý</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      {(current?.status === "rejected" || current?.status === "need_more_info") && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800">
          <FileText className="h-4 w-4" />
          <AlertTitle>{current.status === "rejected" ? "Bị từ chối" : "Cần bổ sung"}</AlertTitle>
          <AlertDescription>{current.rejectReason || "Admin cần bạn kiểm tra lại giấy tờ."}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Tải giấy tờ</CardTitle>
            <CardDescription>File được lưu private và dùng cho xét duyệt gia sư.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onUpload} className="grid gap-4 md:grid-cols-2">
              <Field label="Loại xác thực">
                <Select value={verificationType} onValueChange={(value) => setVerificationType(value as Exclude<VerificationType, "student_card">)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutor_identity">Danh tính</SelectItem>
                    <SelectItem value="tutor_certificate">Bằng cấp/chứng chỉ</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Họ tên trên giấy tờ"><Input value={fullNameInput} onChange={(event) => setFullNameInput(event.target.value)} /></Field>
              <Field label="Trường/đơn vị cấp"><Input value={schoolName} onChange={(event) => setSchoolName(event.target.value)} /></Field>
              <Field label="Mã sinh viên/chứng chỉ"><Input value={studentCode} onChange={(event) => setStudentCode(event.target.value)} /></Field>
              <div className="md:col-span-2">
                <Field label="File giấy tờ">
                  <Input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} />
                </Field>
                {file && <p className="mt-2 text-sm text-muted-foreground">{file.name} · {(file.size / 1024 / 1024).toFixed(2)}MB</p>}
              </div>
              <div className="md:col-span-2">
                <Button disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Tải lên
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử xác thực</CardTitle>
            <CardDescription>Trạng thái do backend và admin quyết định.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {verifications.length ? verifications.map((item) => (
              <button key={item.id} type="button" onClick={() => setActive(item)} className="item-row w-full text-left">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{item.verificationType === "tutor_identity" ? "Danh tính" : "Bằng cấp/chứng chỉ"}</p>
                  <StatusBadge kind="verification" status={item.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.schoolName || "Chưa nhập đơn vị cấp"} · {formatDate(item.createdAt)}</p>
              </button>
            )) : <p className="text-sm text-muted-foreground">Chưa có hồ sơ xác thực.</p>}
          </CardContent>
        </Card>
      </div>

      {current && current.status === "draft" && (
        <Card>
          <CardHeader>
            <CardTitle>Bản cam kết xác thực thông tin</CardTitle>
            <CardDescription>Ký cam kết để chuyển hồ sơ sang trạng thái đang chờ admin duyệt.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSign} className="space-y-5">
              <div className="rounded-lg border bg-slate-50 p-4 text-sm leading-6">
                {agreementLines.map((line) => <p key={line}>- {line}</p>)}
              </div>
              <Field label="Họ tên người cam kết"><Input value={signerName} onChange={(event) => setSignerName(event.target.value)} /></Field>
              <div className="flex items-start gap-2">
                <Checkbox id="agreement" checked={accepted} onCheckedChange={(checked) => setAccepted(checked === true)} />
                <Label htmlFor="agreement" className="leading-6">Tôi đã đọc và đồng ý với bản cam kết xác thực thông tin.</Label>
              </div>
              <Button disabled={loading || !accepted || !signerName.trim()}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Tôi đồng ý và gửi xác thực
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Button variant="outline" asChild><Link href="/dashboard/tutor">Quay lại dashboard</Link></Button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
