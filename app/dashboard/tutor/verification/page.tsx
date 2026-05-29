"use client"

import { FormEvent, type ReactNode, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { FileText, Loader2, ScrollText, ShieldCheck, Stamp, Upload } from "lucide-react"
import { TutorApprovalEligibilityPanel } from "@/components/admin/tutor-approval-eligibility"
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
      const verification = await signAndSubmit(current.id, signerName, user?.email)
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
              <ContractPreview terms={tutorTerms} loading={termsLoading} />
              <Field label="Họ tên người cam kết"><Input value={signerName} onChange={(event) => setSignerName(event.target.value)} /></Field>
              <div className="flex items-start gap-2">
                <Checkbox id="agreement" checked={accepted} onCheckedChange={(checked) => setAccepted(checked === true)} />
                <Label htmlFor="agreement" className="leading-6">
                  Tôi xác nhận đã đọc, hiểu và đồng ý ký thỏa thuận điện tử này với nội dung, version và mã hash hiển thị bên trên.
                </Label>
              </div>
              <Button disabled={loading || termsLoading || !accepted || !signerName.trim()}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Ký thỏa thuận và gửi xác thực
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

function ContractPreview({ terms, loading }: { terms?: VerificationTerms; loading: boolean }) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-slate-50 p-6 text-sm text-muted-foreground">
        Đang tải nội dung thỏa thuận...
      </div>
    )
  }

  if (!terms) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Không tải được thỏa thuận</AlertTitle>
        <AlertDescription>Vui lòng tải lại trang trước khi ký xác thực.</AlertDescription>
      </Alert>
    )
  }

  const blocks = terms.content.trim().split(/\n\s*\n/)

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="bg-slate-950 p-5 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
              <ScrollText className="h-4 w-4" />
              Văn bản ký điện tử
            </div>
            <h2 className="text-xl font-bold leading-tight md:text-2xl">{terms.title}</h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-300">
              Bản thỏa thuận này được lưu kèm version, hash nội dung, thời điểm ký, IP và thiết bị để phục vụ xác thực hồ sơ gia sư.
            </p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/10 p-3 text-sm text-slate-100">
            <p>Version: <span className="font-semibold">{terms.version}</span></p>
            <p>Hiệu lực: <span className="font-semibold">{terms.effectiveDate}</span></p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b bg-slate-50 p-4 md:grid-cols-2">
        <ContractParty title="Bên A" body="Nền tảng Gia Sư Sư Phạm và đơn vị vận hành được ủy quyền." />
        <ContractParty title="Bên B" body="Gia sư đăng ký tài khoản và gửi hồ sơ xác thực trên nền tảng." />
      </div>

      <div className="max-h-[560px] space-y-4 overflow-y-auto p-5">
        {blocks.map((block) => {
          const isArticle = block.startsWith("ĐIỀU ")
          const [firstLine, ...rest] = block.split("\n")
          return (
            <section key={firstLine} className={isArticle ? "rounded-lg border bg-slate-50 p-4" : "rounded-lg bg-white text-sm leading-7 text-slate-700"}>
              {isArticle ? (
                <>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-950">{firstLine}</h3>
                  <div className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                    {rest.map((line) => <p key={line}>{line}</p>)}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  {[firstLine, ...rest].map((line) => <p key={line}>{line}</p>)}
                </div>
              )}
            </section>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 border-t bg-slate-50 p-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Stamp className="h-4 w-4 text-primary" />
          <span>Mã hash nội dung: <span className="font-mono text-slate-700">{terms.contentHash.slice(0, 16)}...{terms.contentHash.slice(-12)}</span></span>
        </div>
        <span>Nội dung đầy đủ được lưu trên backend khi ký.</span>
      </div>
    </div>
  )
}

function ContractParty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-primary">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{body}</p>
    </div>
  )
}
