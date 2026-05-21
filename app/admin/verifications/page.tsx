"use client"

import { type ReactNode, useMemo, useState } from "react"
import { Eye, Loader2, ShieldCheck, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { fileApi } from "@/lib/api/file-api"
import { useAdminVerifications } from "@/lib/hooks/use-verifications"
import { formatDateTime } from "@/lib/helpers"
import type { UserVerification, VerificationStatus, VerificationType } from "@/types"

export default function AdminVerificationsPage() {
  const [status, setStatus] = useState<VerificationStatus | "all">("pending_review")
  const [type, setType] = useState<VerificationType | "all">("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { verifications, isLoading, approve, reject, needMoreInfo } = useAdminVerifications({ status, type })

  const selected = useMemo(
    () => verifications.find((item) => item.id === selectedId) || verifications[0],
    [selectedId, verifications]
  )

  const run = async (action: "approve" | "reject" | "need_more_info") => {
    if (!selected) return
    if (action !== "approve" && !reason.trim()) return setError("Vui lòng nhập lý do.")
    setBusy(true)
    setError(null)
    try {
      if (action === "approve") await approve(selected.id)
      if (action === "reject") await reject(selected.id, reason)
      if (action === "need_more_info") await needMoreInfo(selected.id, reason)
      setReason("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật xác thực.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <p className="text-sm font-semibold text-primary">Admin verification</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Duyệt xác thực học sinh và gia sư</h1>
      </div>

      {error && <Alert variant="destructive"><AlertTitle>Không thể cập nhật</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as VerificationStatus | "all")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending_review">Đang chờ duyệt</SelectItem>
                <SelectItem value="need_more_info">Cần bổ sung</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Bị từ chối</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Loại hồ sơ</Label>
            <Select value={type} onValueChange={(value) => setType(value as VerificationType | "all")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="student_card">Thẻ sinh viên</SelectItem>
                <SelectItem value="tutor_identity">Danh tính gia sư</SelectItem>
                <SelectItem value="tutor_certificate">Bằng cấp/chứng chỉ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={() => { setStatus("pending_review"); setType("all") }}>
              Hàng chờ duyệt
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_460px]">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách hồ sơ</CardTitle>
            <CardDescription>{verifications.length} hồ sơ theo bộ lọc hiện tại.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && <p className="text-sm text-muted-foreground">Đang tải...</p>}
            {!isLoading && verifications.length === 0 && <p className="text-sm text-muted-foreground">Không có hồ sơ.</p>}
            {verifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="item-row w-full text-left"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{item.userFullName || item.userEmail}</p>
                    <p className="text-sm text-muted-foreground">{typeLabel(item.verificationType)} · {formatDateTime(item.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.duplicateFile && <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">Trùng file</span>}
                    <StatusBadge kind="verification" status={item.status} />
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chi tiết</CardTitle>
            <CardDescription>File private sẽ được mở qua request có Authorization.</CardDescription>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-5">
                <div className="grid gap-3 text-sm">
                  <Info label="Người dùng" value={`${selected.userFullName || ""} ${selected.userEmail ? `(${selected.userEmail})` : ""}`} />
                  <Info label="Loại" value={typeLabel(selected.verificationType)} />
                  <Info label="Trường/đơn vị" value={selected.schoolName || "Không nhập"} />
                  <Info label="Mã" value={selected.studentCode || "Không nhập"} />
                  <Info label="Họ tên nhập" value={selected.fullNameInput || "Không nhập"} />
                  <Info label="Risk score" value={`${selected.riskScore}${selected.duplicateFile ? " · Trùng file" : ""}`} />
                  <Info label="Trạng thái" value={<StatusBadge kind="verification" status={selected.status} />} />
                  {selected.rejectReason && <Info label="Lý do" value={selected.rejectReason} />}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(selected.cardFileId || selected.cardFileUrl) && <Button variant="outline" onClick={() => openPrivateFile(selected.cardFileId || selected.cardFileUrl!).catch((err) => setError(err instanceof Error ? err.message : "Không thể mở file."))}><Eye className="mr-2 h-4 w-4" />Thẻ sinh viên</Button>}
                  {(selected.selfieFileId || selected.selfieFileUrl) && <Button variant="outline" onClick={() => openPrivateFile(selected.selfieFileId || selected.selfieFileUrl!).catch((err) => setError(err instanceof Error ? err.message : "Không thể mở file."))}><Eye className="mr-2 h-4 w-4" />Selfie</Button>}
                  {(selected.documentFileId || selected.documentFileUrl) && <Button variant="outline" onClick={() => openPrivateFile(selected.documentFileId || selected.documentFileUrl!).catch((err) => setError(err instanceof Error ? err.message : "Không thể mở file."))}><Eye className="mr-2 h-4 w-4" />Giấy tờ</Button>}
                </div>

                <div className="space-y-2">
                  <Label>Lý do từ chối hoặc yêu cầu bổ sung</Label>
                  <Textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} />
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <Button disabled={busy} onClick={() => run("approve")}>
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                    Duyệt
                  </Button>
                  <Button disabled={busy} variant="outline" onClick={() => run("need_more_info")}>Cần bổ sung</Button>
                  <Button disabled={busy} variant="destructive" onClick={() => run("reject")}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Từ chối
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Chọn một hồ sơ để xem chi tiết.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-3">
      <p className="text-muted-foreground">{label}</p>
      <div className="font-medium">{value}</div>
    </div>
  )
}

function typeLabel(type: VerificationType) {
  return {
    student_card: "Thẻ sinh viên",
    tutor_identity: "Danh tính gia sư",
    tutor_certificate: "Bằng cấp/chứng chỉ",
  }[type]
}

async function openPrivateFile(path: string) {
  const blob = await fileApi.getFileBlob(path)
  window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer")
}
