"use client"

import useSWR from "swr"
import { tutorService } from "@/lib/services"
import type { TutorApprovalEligibility } from "@/types"

export function useTutorApprovalEligibilityMap(tutorIds: string[]) {
  const stableIds = [...new Set(tutorIds.filter(Boolean))].sort()
  const key = stableIds.length ? ["tutor-approval-eligibility", stableIds.join(",")] : null
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const entries = await Promise.all(
        stableIds.map(async (id) => [id, await tutorService.getApprovalEligibility(id)] as const)
      )
      return Object.fromEntries(entries) as Record<string, TutorApprovalEligibility>
    },
    { revalidateOnFocus: false }
  )

  return {
    eligibilityByTutorId: data || {},
    error,
    isLoading,
    refresh: mutate,
  }
}
