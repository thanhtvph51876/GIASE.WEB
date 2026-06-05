import type { ReactNode } from "react"
import { ShieldCheck, Stamp } from "lucide-react"
import { cn } from "@/lib/utils"

export type CommitmentRole = "Học sinh" | "Gia sư" | "Nhân sự" | "Cộng tác viên"

export interface CommitmentData {
  platformName: string
  slogan: string
  formCode: string
  title: string
  subtitle: string
  fullName: string
  dateOfBirth?: string
  identityNumber?: string
  phone?: string
  email?: string
  address?: string
  role: CommitmentRole
  city: string
  signedDate: string
  platformRepresentative: string
  evidence?: Array<{ label: string; value?: string }>
  items: string[]
  version?: string
  effectiveDate?: string
  contentHash?: string
}

export function formatCommitmentDate(dateValue?: string) {
  if (!dateValue) return "ngày ..... tháng ..... năm 20....."

  const parts = dateValue.split("-").map(Number)
  if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
    const [year, month, day] = parts
    return `ngày ${String(day).padStart(2, "0")} tháng ${String(month).padStart(2, "0")} năm ${year}`
  }

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return "ngày ..... tháng ..... năm 20....."

  return `ngày ${String(date.getDate()).padStart(2, "0")} tháng ${String(date.getMonth() + 1).padStart(2, "0")} năm ${date.getFullYear()}`
}

export function CommitmentDocument({ data, className }: { data: CommitmentData; className?: string }) {
  const signedDateText = formatCommitmentDate(data.signedDate)
  const contentHash = data.contentHash ? `${data.contentHash.slice(0, 16)}...${data.contentHash.slice(-12)}` : undefined

  return (
    <div className={cn("commitment-print-area overflow-x-auto rounded-lg bg-slate-100/70 p-3", className)}>
      <article className="commitment-paper mx-auto w-full min-w-[640px] max-w-[820px] rounded-lg border border-slate-200 bg-white p-6 text-slate-950 shadow-lg sm:p-8">
        <header className="flex items-center justify-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 border-blue-900 bg-emerald-50 text-blue-900">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold tracking-normal text-blue-950 sm:text-3xl">{data.platformName}</p>
            <p className="mt-1 text-sm font-semibold text-emerald-700 sm:text-base">{data.slogan}</p>
          </div>
        </header>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-blue-900" />
          <div className="h-2 w-2 rotate-45 bg-amber-400" />
          <div className="h-px flex-1 bg-blue-900" />
        </div>

        <section className="text-center">
          <h2 className="text-2xl font-extrabold tracking-normal text-blue-950 sm:text-3xl">{data.title}</h2>
          <p className="mt-2 text-sm italic text-slate-600 sm:text-base">{data.subtitle}</p>
        </section>

        <section className="mt-8">
          <SectionTitle>I. THÔNG TIN NGƯỜI CAM KẾT</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldLine label="Họ và tên:" value={data.fullName} />
            <FieldLine label="Ngày sinh:" value={data.dateOfBirth} />
            <FieldLine label="CCCD/CMND:" value={data.identityNumber} />
            <FieldLine label="Số điện thoại:" value={data.phone} />
            <FieldLine label="Email:" value={data.email} className="sm:col-span-2" />
            <FieldLine label="Địa chỉ liên hệ:" value={data.address} className="sm:col-span-2" />
            <div className="flex items-center gap-2 text-sm sm:col-span-2 sm:text-[15px]">
              <span className="shrink-0">Vai trò:</span>
              <span className="font-semibold">{data.role}</span>
            </div>
          </div>
        </section>

        {data.evidence?.some((item) => item.value) && (
          <section className="mt-7">
            <SectionTitle>II. THÔNG TIN HỒ SƠ XÁC THỰC</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.evidence.map((item) => (
                <FieldLine key={item.label} label={`${item.label}:`} value={item.value} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-7">
          <SectionTitle>{data.evidence?.some((item) => item.value) ? "III" : "II"}. NỘI DUNG CAM KẾT</SectionTitle>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 sm:text-[15px]">
            {data.items.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="mt-7">
          <SectionTitle>{data.evidence?.some((item) => item.value) ? "IV" : "III"}. HIỆU LỰC CAM KẾT</SectionTitle>
          <p className="text-sm leading-7 sm:text-[15px]">
            Cam kết này có hiệu lực kể từ ngày ký và được lưu kèm thông tin kỹ thuật của phiên ký điện tử để phục vụ đối soát, kiểm duyệt và xử lý khi có tranh chấp.
          </p>
          {(data.version || data.effectiveDate || contentHash) && (
            <div className="mt-4 grid gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-slate-700 sm:grid-cols-3">
              {data.version && <Metadata label="Version" value={data.version} />}
              {data.effectiveDate && <Metadata label="Hiệu lực" value={data.effectiveDate} />}
              {contentHash && <Metadata label="Hash nội dung" value={contentHash} mono />}
            </div>
          )}
        </section>

        <div className="mt-8 text-right text-sm italic text-slate-800 sm:text-base">
          {data.city}, {signedDateText}
        </div>

        <section className="mt-9 grid grid-cols-2 gap-8">
          <SignatureBlock title="ĐẠI DIỆN NỀN TẢNG" name={data.platformRepresentative} />
          <SignatureBlock title="NGƯỜI CAM KẾT" name={data.fullName} className="border-l border-blue-900" />
        </section>

        <footer className="mt-9">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-blue-900" />
            <Stamp className="h-4 w-4 text-emerald-700" />
            <div className="h-px flex-1 bg-blue-900" />
          </div>
          <p className="mt-3 text-center text-xs font-semibold text-blue-950 sm:text-sm">
            {data.formCode} | Cam kết điện tử
          </p>
        </footer>
      </article>
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-4 border-l-4 border-emerald-600 pl-3 text-base font-bold text-blue-950 sm:text-lg">{children}</h3>
}

function FieldLine({ label, value, className }: { label: string; value?: string; className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-end gap-2", className)}>
      <span className="shrink-0 text-sm sm:text-[15px]">{label}</span>
      <span className="min-h-6 min-w-0 flex-1 overflow-hidden border-b border-dotted border-slate-500 px-2 text-sm font-semibold sm:text-[15px]">
        {value || "\u00A0"}
      </span>
    </div>
  )
}

function Metadata({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="font-semibold uppercase tracking-wide text-emerald-800">{label}</p>
      <p className={cn("mt-1 break-words text-slate-800", mono && "font-mono")}>{value}</p>
    </div>
  )
}

function SignatureBlock({ title, name, className }: { title: string; name?: string; className?: string }) {
  return (
    <div className={cn("min-h-36 text-center", className)}>
      <p className="text-sm font-bold text-blue-950 sm:text-base">{title}</p>
      <p className="text-xs italic text-slate-600 sm:text-sm">(Ký, ghi rõ họ tên)</p>
      <div className="mt-20 font-semibold text-slate-900">{name || "\u00A0"}</div>
    </div>
  )
}
