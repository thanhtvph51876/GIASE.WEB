"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { AlertTriangle, ArrowRight, Clock, Inbox, Loader2, Mail, MapPin, Phone, RefreshCw, ShieldCheck, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

export { StatusBadge }

const toneClasses = {
  blue: {
    shell: "border-blue-200/80 bg-blue-50/70 text-blue-700",
    icon: "bg-blue-600 text-white shadow-blue-600/20",
  },
  emerald: {
    shell: "border-emerald-200/80 bg-emerald-50/70 text-emerald-700",
    icon: "bg-emerald-600 text-white shadow-emerald-600/20",
  },
  amber: {
    shell: "border-amber-200/80 bg-amber-50/70 text-amber-700",
    icon: "bg-amber-500 text-white shadow-amber-500/20",
  },
  rose: {
    shell: "border-rose-200/80 bg-rose-50/70 text-rose-700",
    icon: "bg-rose-600 text-white shadow-rose-600/20",
  },
  slate: {
    shell: "border-slate-200/80 bg-slate-50/80 text-slate-700",
    icon: "bg-slate-900 text-white shadow-slate-900/20",
  },
}

type Tone = keyof typeof toneClasses

export function PageHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  stats,
}: {
  eyebrow?: string
  title: string
  description?: string
  icon?: LucideIcon
  actions?: ReactNode
  stats?: Array<{ label: string; value: string | number }>
}) {
  return (
    <section className="surface-panel gradient-mesh reveal overflow-hidden border-l-4 border-l-primary bg-white">
      <div className="relative grid gap-5 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
        <div className="flex gap-4">
          {Icon && (
            <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div>
            {eyebrow && <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary hover:bg-primary/10">{eyebrow}</Badge>}
            <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">{title}</h1>
            {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div>}
      </div>
      {stats?.length ? (
        <div className="grid border-t border-slate-200/80 bg-slate-50/70 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="border-b border-r border-slate-200/80 p-4 last:border-r-0 sm:border-b-0">
              <p className="text-xs font-medium uppercase text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <header className={cn("space-y-4", className)}>
      {eyebrow && <Badge className="premium-badge">{eyebrow}</Badge>}
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-normal text-slate-950 md:text-5xl">{title}</h1>
          {description && <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2 md:justify-end">{actions}</div>}
      </div>
    </header>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("grid gap-3 md:grid-cols-[1fr_auto] md:items-end", className)}>
      <div>
        {eyebrow && <p className="text-sm font-semibold uppercase tracking-normal text-primary">{eyebrow}</p>}
        <h2 className="mt-1 text-2xl font-bold tracking-normal text-slate-950">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 md:justify-end">{actions}</div>}
    </div>
  )
}

export function RetryButton({
  onRetry,
  label = "Thử lại",
  className,
}: {
  onRetry: () => void
  label?: string
  className?: string
}) {
  return (
    <Button type="button" variant="outline" onClick={onRetry} className={cn("gap-2", className)}>
      <RefreshCw className="h-4 w-4" />
      {label}
    </Button>
  )
}

export function PublicDataNotice({
  message,
  loadingMessage,
  isLoading,
  onRetry,
  retryLabel = "Thử lại",
  className,
}: {
  message: string
  loadingMessage?: string
  isLoading?: boolean
  onRetry?: () => void
  retryLabel?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-start gap-2">
        {isLoading ? (
          <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <p>{isLoading && loadingMessage ? loadingMessage : message}</p>
      </div>
      {onRetry && !isLoading && (
        <RetryButton onRetry={onRetry} label={retryLabel} className="bg-white/70" />
      )}
    </div>
  )
}

export function TrustBadge({
  label,
  icon: Icon = ShieldCheck,
  tone = "emerald",
}: {
  label: string
  icon?: LucideIcon
  tone?: Tone
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold", toneClasses[tone].shell)}>
      <Icon className="h-4 w-4" />
      {label}
    </span>
  )
}

export function CTASection({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  title: string
  description: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
}) {
  return (
    <section className="surface-panel gradient-mesh reveal p-6 md:p-8">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <Button asChild>
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
          {secondaryLabel && secondaryHref && (
            <Button asChild variant="outline">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

export function FormFieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-start gap-1.5 text-sm text-destructive">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  )
}

export function ContactInfoBlock({ className }: { className?: string }) {
  const rows = [
    { icon: Mail, label: "Email", value: siteConfig.supportEmail, href: `mailto:${siteConfig.supportEmail}` },
    { icon: Phone, label: "Hotline", value: siteConfig.supportPhone, href: siteConfig.supportPhoneHref },
    { icon: MapPin, label: "Địa chỉ", value: siteConfig.businessAddress },
    { icon: Clock, label: "Giờ hỗ trợ", value: siteConfig.workingHours },
  ]

  return (
    <div className={cn("grid gap-3", className)}>
      {rows.map(({ icon: Icon, label, value, href }) => {
        const content = (
          <div className="flex items-start gap-3 rounded-lg border border-slate-200/80 bg-white/80 p-3 text-sm">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-slate-950">{label}</p>
              <p className="text-muted-foreground">{value}</p>
            </div>
          </div>
        )
        return href ? (
          <a key={label} href={href} className="block transition-opacity hover:opacity-80">
            {content}
          </a>
        ) : (
          <div key={label}>{content}</div>
        )
      })}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  actionLabel,
  href,
}: {
  title: string
  description?: string
  actionLabel?: string
  href?: string
}) {
  return (
    <Card className="reveal border-dashed bg-slate-50/70">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="icon-float flex h-14 w-14 items-center justify-center rounded-lg bg-white text-muted-foreground shadow-sm">
          <Inbox className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
        {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
        {actionLabel && href && (
          <Button asChild className="mt-4">
            <Link href={href}>{actionLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function LoadingSkeleton({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return (
    <div className="reveal soft-glow flex min-h-[240px] items-center justify-center rounded-lg border bg-white text-sm text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {label}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="reveal soft-glow rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
      <AlertTriangle className="mx-auto h-8 w-8" />
      <p className="mt-2 font-medium">{message}</p>
      {onRetry && (
        <RetryButton className="mt-4" onRetry={onRetry} />
      )}
    </div>
  )
}

export function DashboardMetricCard({
  label,
  value,
  icon: Icon,
  tone = "blue",
  helper,
  className,
}: {
  label: string
  value: string | number
  icon?: LucideIcon
  tone?: Tone
  helper?: string
  className?: string
}) {
  return (
    <div className={cn("metric-tile premium-card hover-lift reveal group overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
        </div>
        {Icon && (
          <div className={cn("icon-float flex h-11 w-11 items-center justify-center rounded-lg shadow-sm transition-transform group-hover:scale-105", toneClasses[tone].icon)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  )
}

export function EntityCard({
  title,
  subtitle,
  meta,
  icon: Icon,
  tone = "blue",
  badge,
  actions,
  children,
  className,
}: {
  title: string
  subtitle?: string
  meta?: string
  icon?: LucideIcon
  tone?: Tone
  badge?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("item-row premium-card reveal overflow-hidden p-0", className)}>
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex min-w-0 gap-3">
          {Icon && (
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border", toneClasses[tone].shell)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold text-slate-950">{title}</p>
              {badge}
            </div>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            {meta && <p className="mt-1 text-xs font-medium uppercase tracking-normal text-slate-500">{meta}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2 md:justify-end">{actions}</div>}
      </div>
      {children && <div className="border-t border-slate-200/80 bg-slate-50/60 p-4">{children}</div>}
    </div>
  )
}

export function InsightPanel({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href?: string
}) {
  const content = (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4 text-primary">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-primary/80">{description}</p>
      </div>
      {href && <ArrowRight className="h-5 w-5 shrink-0" />}
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

export function RoleBadge({ role }: { role?: string }) {
  const labels: Record<string, string> = {
    admin: "Admin",
    finance_admin: "Finance",
    tutor_admin: "Tutor Ops",
    support_admin: "Support",
    verification_admin: "Verification",
    system_admin: "System",
    tutor: "Gia sư",
    student: "Học sinh",
    parent: "Phụ huynh",
    guest: "Khách",
  }
  return <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{labels[role || "guest"]}</span>
}

export function PaymentStatusBadge({ status }: { status?: string | null }) {
  return <StatusBadge kind="payment" status={status} />
}

export function SessionStatusBadge({ status }: { status?: string | null }) {
  return <StatusBadge kind="session" status={status} />
}

export function MatchingScoreBadge({ score }: { score: number }) {
  return (
    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
      {score}/100 phù hợp
    </span>
  )
}

export function RatingDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={cn("h-4 w-4", index < Math.round(value) && "fill-current")} />
      ))}
      <span className="ml-1 text-sm font-semibold text-slate-700">{value.toFixed(1)}</span>
    </div>
  )
}

export function RequestStatusTimeline({ status }: { status: string }) {
  const steps = ["new", "consulting", "matched", "trial_scheduled", "trial_completed", "active"]
  const current = Math.max(0, steps.indexOf(status))
  return (
    <div className="grid gap-2 sm:grid-cols-6">
      {steps.map((step, index) => (
        <div key={step} className={cn("rounded-lg border p-3 text-xs", index <= current ? "border-primary/30 bg-primary/10 text-primary" : "bg-white text-muted-foreground")}>
          {index + 1}. {step.replace("_", " ")}
        </div>
      ))}
    </div>
  )
}
