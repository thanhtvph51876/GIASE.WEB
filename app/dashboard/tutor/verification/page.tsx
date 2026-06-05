"use client"

import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { FileText, Loader2, Printer, ShieldCheck, Upload } from "lucide-react"
import { TutorApprovalEligibilityPanel } from "@/components/admin/tutor-approval-eligibility"
import { CommitmentDocument, type CommitmentData } from "@/components/verification/commitment-document"
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
import { tutorService } from "@/lib/services"
import { verificationService } from "@/lib/services/verification-service"
import type { UserVerification, VerificationTerms, VerificationType } from "@/types"

const fallbackTutorCommitmentItems = [
  "Tôi cam kết thông tin cá nhân, giấy tờ định danh, bằng cấp, chứng chỉ và kinh nghiệm cung cấp trên nền tảng là đúng sự thật.",
  "Tôi là chủ sở hữu hợp pháp của các giấy tờ đã tải lên và chịu trách nhiệm nếu có hành vi giả mạo hoặc sử dụng giấy tờ không hợp lệ.",
  "Tôi cam kết bảo mật thông tin học viên, phụ huynh, lớp học, học phí, tài liệu học tập và dữ liệu vận hành của nền tảng.",
  "Tôi chỉ sử dụng thông tin trong phạm vi công việc dạy học, tư vấn và chăm sóc lớp được nền tảng phân quyền.",
  "Tôi đồng ý để nền tảng lưu version cam kết, hash nội dung, thời điểm ký, IP và thiết bị phục vụ kiểm duyệt, đối soát và xử lý tranh chấp.",
]

function todayInputValue() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

function termsToCommitmentItems(terms?: VerificationTerms) {
  const lines = terms?.content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

  return lines?.length ? lines : fallbackTutorCommitmentItems
}

export default function TutorVerificationPage() {
  const { user } = useAuthContext()
  const { verifications, latest, isLoading, uploadTutorDocument, signAndSubmit } = useTutorVerifications(Boolean(user))
  const { data: eligibility, isLoading: eligibilityLoading, mutate: refreshEligibility } = useSWR(
    user ? "my-tutor-approval-eligibility" : null,
    () => tutorService.getMyApprovalEligibility(),
    { revalidateOnFocus: false }
  )
  const { data: tutorTerms, isLoading: termsLoading } = useSWR(
    user ? "tutor-verification-terms" : null,
    () => verificationService.getTutorTerms(),
    { revalidateOnFocus: false }
  )
  const [active, setActive] = useState<UserVerification | null>(null)
  const [verificationType, setVerificationType] = useState<Exclude<VerificationType, "student_card">>("tutor_identity")
  const [file, setFile] = useState<File | null>(null)
  const [schoolName, setSchoolName] = useState("")
  const [studentCode, setStudentCode] = useState("")
  const [fullNameInput, setFullNameInput] = useState(user?.fullName || "")
  const [signerName, setSignerName] = useState(user?.fullName || "")
  const [signerEmail, setSignerEmail] = useState(user?.email || "")
  const [signerPhone, setSignerPhone] = useState(user?.phone || "")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [identityNumber, setIdentityNumber] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("Hà Nội")
  const [signedDate, setSignedDate] = useState(todayInputValue)
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const current = active || latest

  useEffect(() => {
    if (!user) return
    setFullNameInput((value) => value || user.fullName)
    setSignerName((value) => value || user.fullName)
    setSignerEmail((value) => value || user.email)
    setSignerPhone((value) => value || user.phone)
  }, [user])

  const commitmentData: CommitmentData = useMemo(() => ({
    platformName: "GIA SƯ SƯ PHẠM",
    slogan: "Kết nối tri thức - Đồng hành tương lai",
    formCode: "Mẫu GST-01",
    title: tutorTerms?.title?.toUpperCase() || "CAM KẾT TRÁCH NHIỆM GIA SƯ",
    subtitle: "Áp dụng cho gia sư ký xác nhận trước khi hồ sơ được xét duyệt",
    fullName: signerName || fullNameInput || current?.fullNameInput || user?.fullName || "",
    dateOfBirth,
    identityNumber,
    phone: signerPhone || user?.phone || "",
    email: signerEmail || current?.userEmail || user?.email || "",
    address,
    role: "Gia sư",
    city,
    signedDate,
    platformRepresentative: "Gia Sư Sư Phạm",
    evidence: [
      { label: "Loại hồ sơ", value: current?.verificationType === "tutor_certificate" ? "Bằng cấp/chứng chỉ" : "Danh tính" },
      { label: "Họ tên trên giấy tờ", value: fullNameInput || current?.fullNameInput },
      { label: "Trường/đơn vị cấp", value: schoolName || current?.schoolName },
      { label: "Mã SV/chứng chỉ", value: studentCode || current?.studentCode },
      { label: "Mã hồ sơ", value: current?.id },
    ],
    items: termsToCommitmentItems(tutorTerms),
    version: tutorTerms?.version,
    effectiveDate: tutorTerms?.effectiveDate,
    contentHash: tutorTerms?.contentHash,
  }), [
    address,
    city,
    current?.fullNameInput,
    current?.id,
    current?.schoolName,
    current?.studentCode,
    current?.userEmail,
    current?.verificationType,
    dateOfBirth,
    fullNameInput,
    identityNumber,
    schoolName,
    signedDate,
    signerEmail,
    signerName,
    signerPhone,
    studentCode,
    tutorTerms,
    user?.email,
    user?.fullName,
    user?.phone,
  ])

  const onUpload = async (event: FormEvent) => {
    event.preventDefault()
    if (!file) return setError("Vui lòng chọn file giấy tờ.")
    setLoading(true)
    setError(null)
    try {
      const verification = await uploadTutorDocument({ file, verificationType, schoolName, studentCode, fullNameInput })
      setActive(verification)
      refreshEligibility()
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
      const verification = await signAndSubmit(current.id, signerName, signerEmail || user?.email)
      setActive(verification)
      refreshEligibility()
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

      <Card>
        <CardHeader>
          <CardTitle>Điều kiện duyệt hồ sơ gia sư</CardTitle>
          <CardDescription>
            Trạng thái này được backend kiểm tra và dùng khi admin duyệt hồ sơ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TutorApprovalEligibilityPanel eligibility={eligibility} loading={eligibilityLoading} />
        </CardContent>
      </Card>

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
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Thỏa thuận ký điện tử</CardTitle>
            <CardDescription>Nội dung được lấy từ backend và lưu kèm version/hash tại thời điểm ký.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSign} className="space-y-5">
              {termsLoading ? (
                <div className="rounded-lg border bg-slate-50 p-6 text-sm text-muted-foreground">
                  Đang tải nội dung thỏa thuận...
                </div>
              ) : !tutorTerms ? (
                <Alert variant="destructive">
                  <AlertTitle>Không tải được thỏa thuận</AlertTitle>
                  <AlertDescription>Vui lòng tải lại trang trước khi ký xác thực.</AlertDescription>
                </Alert>
              ) : (
                <CommitmentDocument data={commitmentData} />
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Họ tên người cam kết"><Input value={signerName} onChange={(event) => setSignerName(event.target.value)} /></Field>
                <Field label="CCCD/CMND"><Input value={identityNumber} onChange={(event) => setIdentityNumber(event.target.value)} /></Field>
                <Field label="Email người ký"><Input type="email" value={signerEmail} onChange={(event) => setSignerEmail(event.target.value)} /></Field>
                <Field label="Số điện thoại"><Input value={signerPhone} onChange={(event) => setSignerPhone(event.target.value)} /></Field>
                <Field label="Ngày sinh"><Input type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} /></Field>
                <Field label="Ngày ký"><Input type="date" value={signedDate} onChange={(event) => setSignedDate(event.target.value)} /></Field>
                <Field label="Thành phố ký"><Input value={city} onChange={(event) => setCity(event.target.value)} /></Field>
                <Field label="Địa chỉ liên hệ"><Input value={address} onChange={(event) => setAddress(event.target.value)} /></Field>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="agreement" checked={accepted} onCheckedChange={(checked) => setAccepted(checked === true)} />
                <Label htmlFor="agreement" className="leading-6">
                  Tôi xác nhận đã đọc, hiểu và đồng ý ký thỏa thuận điện tử này với nội dung, version và mã hash hiển thị bên trên.
                </Label>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button disabled={loading || termsLoading || !accepted || !signerName.trim()}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                  Ký thỏa thuận và gửi xác thực
                </Button>
                <Button type="button" variant="outline" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" />
                  In / Xuất PDF
                </Button>
              </div>
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
