"use client"

import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { AdminActionAvailability } from "@/lib/admin/admin-actions"

interface AdminActionButtonProps extends ComponentProps<typeof Button> {
  availability: AdminActionAvailability
  hideWhenUnavailable?: boolean
}

export function AdminActionButton({
  availability,
  hideWhenUnavailable = false,
  disabled,
  children,
  ...props
}: AdminActionButtonProps) {
  if (!availability.allowed && hideWhenUnavailable) return null
  const isDisabled = disabled || !availability.allowed
  const button = (
    <Button disabled={isDisabled} {...props}>
      {children}
    </Button>
  )

  if (!availability.allowed && availability.reason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{button}</span>
        </TooltipTrigger>
        <TooltipContent>{availability.reason}</TooltipContent>
      </Tooltip>
    )
  }

  return button
}
