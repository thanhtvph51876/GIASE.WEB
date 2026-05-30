"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface AdminReasonOption {
  value: string
  label: string
}

interface ConfirmReasonDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode
  title: string
  description?: string
  actionName: string
  severity?: "normal" | "warning" | "danger"
  reasonOptions?: AdminReasonOption[]
  requireReason?: boolean
  requireNoteForOther?: boolean
  requireTypedConfirmation?: string
  loading?: boolean
  onConfirm: (reason: string, note: string) => Promise<void> | void
}

export function ConfirmReasonDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  actionName,
  severity = "normal",
  reasonOptions = [],
  requireReason = true,
  requireNoteForOther = true,
  requireTypedConfirmation,
  loading = false,
  onConfirm,
}: ConfirmReasonDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [typed, setTyped] = useState("")
  const [touched, setTouched] = useState(false)

  const isOpen = open ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const otherSelected = reason === "OTHER"
  const needsReason = requireReason && reasonOptions.length > 0
  const needsNote = (requireReason && reasonOptions.length === 0) || (requireNoteForOther && otherSelected)
  const needsTyped = Boolean(requireTypedConfirmation)
  const typedMatches = !requireTypedConfirmation || typed.trim() === requireTypedConfirmation
  const disabled = loading || (needsReason && !reason) || (needsNote && !note.trim()) || !typedMatches

  const icon = severity === "normal" ? ShieldCheck : AlertTriangle
  const Icon = icon

  const toneClass = useMemo(() => {
    if (severity === "danger") return "border-red-200 bg-red-50 text-red-700"
    if (severity === "warning") return "border-amber-200 bg-amber-50 text-amber-700"
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }, [severity])

  useEffect(() => {
    if (!isOpen) {
      setReason("")
      setNote("")
      setTyped("")
      setTouched(false)
    }
  }, [isOpen])

  const submit = async () => {
    setTouched(true)
    if (disabled) return
    await onConfirm(reason || "CONFIRMED", note.trim())
    setOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <div className={cn("mb-1 flex h-11 w-11 items-center justify-center rounded-lg border", toneClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          {reasonOptions.length > 0 && (
            <div className="space-y-2">
              <Label>Lý do{requireReason ? " *" : ""}</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lý do xử lý" />
                </SelectTrigger>
                <SelectContent>
                  {reasonOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched && needsReason && !reason && <p className="text-sm text-destructive">Vui lòng chọn lý do.</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label>Ghi chú{needsNote ? " *" : ""}</Label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              placeholder="Nhập bối cảnh xử lý để lưu audit và giúp các admin khác hiểu quyết định này..."
            />
            {touched && needsNote && !note.trim() && <p className="text-sm text-destructive">Vui lòng nhập ghi chú.</p>}
          </div>

          {needsTyped && (
            <div className="space-y-2">
              <Label>Nhập `{requireTypedConfirmation}` để xác nhận</Label>
              <Input value={typed} onChange={(event) => setTyped(event.target.value)} />
              {touched && !typedMatches && <p className="text-sm text-destructive">Nội dung xác nhận chưa khớp.</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={loading} onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            variant={severity === "danger" ? "destructive" : "default"}
            disabled={disabled}
            onClick={submit}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {actionName}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
