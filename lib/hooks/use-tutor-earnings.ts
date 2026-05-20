"use client"

import useSWR from "swr"
import { earningApi } from "@/lib/api/earning-api"

export function useTutorEarnings(enabled = true) {
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? "tutor-earnings-summary" : null,
    () => earningApi.summary(),
    { revalidateOnFocus: false }
  )

  return {
    earnings: data?.earnings || [],
    payouts: data?.payouts || [],
    availableBalance: data?.availableBalance || 0,
    pendingBalance: data?.pendingBalance || 0,
    paidBalance: data?.paidBalance || 0,
    totalEarnings: data?.totalEarnings || 0,
    loading: isLoading,
    isLoading,
    error,
    refetch: mutate,
    refresh: mutate,
  }
}
