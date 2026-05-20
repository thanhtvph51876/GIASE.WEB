"use client"

import useSWR from "swr"
import { paymentService } from "@/lib/services"

export function useTutorPayments(tutorId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    tutorId ? ["payments", "tutor", tutorId] : null,
    () => paymentService.getPaymentsByTutor(tutorId!),
    { revalidateOnFocus: false }
  )

  return {
    payments: data || [],
    error,
    isLoading,
    loading: isLoading,
    refetch: mutate,
    refresh: mutate,
  }
}
