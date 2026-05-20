import { Badge } from "@/components/ui/badge"
import { getStatusLabel, getStatusTone, type StatusKind } from "@/lib/helpers"
import { cn } from "@/lib/utils"

const toneClasses = {
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
}

export function StatusBadge({
  className,
  kind,
  status,
}: {
  className?: string
  kind: StatusKind
  status?: string | null
}) {
  const tone = getStatusTone(status)

  return (
    <Badge variant="outline" className={cn(toneClasses[tone], className)}>
      {getStatusLabel(kind, status)}
    </Badge>
  )
}
