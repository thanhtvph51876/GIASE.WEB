"use client"

import { useState, type ReactNode } from "react"
import { Loader2 } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export interface ReasonOption {
  value: string
  label: string
}

interface ConfirmReasonDialogProps {
  trigger: ReactNode
  title: string
  description?: string
  confirmLabel?: string
  reasonLabel?: string
  noteLabel?: string
  reasons?: ReasonOption[]
  requireReason?: boolean
  requireNoteWhen?: string
  loading?: boolean
  onConfirm: (reason: string, note: string) => Promise<void> | void
}

export function ConfirmReasonDialog({
  trigger,
  title,
  description,
  confirmLabel = "Xác nhận",
  reasonLabel = "Lý do",
  noteLabel = "Ghi chú",
  reasons = [],
  requireReason = false,
  requireNoteWhen = "OTHER",
  loading = false,
  onConfirm,
}: ConfirmReasonDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [touched, setTouched] = useState(false)

  const needsReason = requireReason && reasons.length > 0
  const needsNote = reason === requireNoteWhen
  const disabled = loading || (needsReason && !reason) || (needsNote && !note.trim())

  const submit = async () => {
    setTouched(true)
    if (disabled) return
    await onConfirm(reason, note.trim())
    setOpen(false)
    setReason("")
    setNote("")
    setTouched(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">
          {reasons.length > 0 && (
            <div className="space-y-2">
              <Label>{reasonLabel}</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lý do" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched && needsReason && !reason && <p className="text-sm text-destructive">Vui lòng chọn lý do.</p>}
            </div>
          )}
          <div className="space-y-2">
            <Label>{noteLabel}{needsNote ? " *" : ""}</Label>
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Nhập ghi chú để lưu lại ngữ cảnh xử lý..." />
            {touched && needsNote && !note.trim() && <p className="text-sm text-destructive">Vui lòng nhập ghi chú.</p>}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Đóng
          </Button>
          <Button type="button" onClick={submit} disabled={disabled}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
