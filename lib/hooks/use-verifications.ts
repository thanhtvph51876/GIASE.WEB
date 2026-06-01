"use client"

import { useCallback } from "react"
import useSWR from "swr"
import type { VerificationStatus, VerificationType } from "@/types"
import type { ApiPagination, PageRequestParams } from "@/lib/api/client"
import { verificationService } from "@/lib/services/verification-service"
import type { StudentCardUploadInput, TutorDocumentUploadInput } from "@/lib/api/verification-api"
import { useToast } from "@/hooks/use-toast"

export function useStudentVerifications(enabled = true) {
  const { toast } = useToast()
  const { data, error, isLoading, mutate } = useSWR(enabled ? "student-verifications" : null, () => verificationService.getStudentVerifications(), {
    revalidateOnFocus: false,
  })

  const uploadStudentCard = useCallback(async (input: StudentCardUploadInput) => {
    const verification = await verificationService.uploadStudentCard(input)
    await mutate()
    toast({ title: "Đã tải thẻ sinh viên", description: "Vui lòng ký bản cam kết để gửi xét duyệt." })
    return verification
  }, [mutate, toast])

  const signAndSubmit = useCallback(async (id: string, signerFullName: string, signerEmail?: string) => {
    const verification = await verificationService.signAndSubmitStudent(id, signerFullName, signerEmail)
    await mutate()
    toast({ title: "Đã gửi hồ sơ xác thực", description: "Admin sẽ kiểm tra và cập nhật trạng thái." })
    return verification
  }, [mutate, toast])

  return {
    verifications: data || [],
    latest: data?.[0],
    error,
    isLoading,
    uploadStudentCard,
    signAndSubmit,
    refresh: mutate,
  }
}

export function useTutorVerifications(enabled = true) {
  const { toast } = useToast()
  const { data, error, isLoading, mutate } = useSWR(enabled ? "tutor-verifications" : null, () => verificationService.getTutorVerifications(), {
    revalidateOnFocus: false,
  })

  const uploadTutorDocument = useCallback(async (input: TutorDocumentUploadInput) => {
    const verification = await verificationService.uploadTutorDocument(input)
    await mutate()
    toast({ title: "Đã tải giấy tờ", description: "Vui lòng ký bản cam kết để gửi xét duyệt." })
    return verification
  }, [mutate, toast])

  const signAndSubmit = useCallback(async (id: string, signerFullName: string, signerEmail?: string) => {
    const verification = await verificationService.signAndSubmitTutor(id, signerFullName, signerEmail)
    await mutate()
    toast({ title: "Đã gửi hồ sơ xác thực", description: "Admin sẽ kiểm tra và cập nhật trạng thái." })
    return verification
  }, [mutate, toast])

  return {
    verifications: data || [],
    latest: data?.[0],
    error,
    isLoading,
    uploadTutorDocument,
    signAndSubmit,
    refresh: mutate,
  }
}

const emptyPagination: ApiPagination = { page: 1, pageSize: 50, total: 0, totalPages: 1 }

export function useAdminVerifications(filters?: PageRequestParams & { status?: VerificationStatus | "all"; type?: VerificationType | "all" }) {
  const { toast } = useToast()
  const key = ["admin-verifications", filters?.status || "all", filters?.type || "all", filters?.page || 1, filters?.pageSize || 50]
  const { data, error, isLoading, mutate } = useSWR(key, () => verificationService.adminListPage(filters), {
    revalidateOnFocus: false,
  })

  const approve = useCallback(async (id: string) => {
    await verificationService.approve(id)
    await mutate()
    toast({ title: "Đã duyệt xác thực" })
  }, [mutate, toast])

  const reject = useCallback(async (id: string, reason: string) => {
    await verificationService.reject(id, reason)
    await mutate()
    toast({ title: "Đã từ chối xác thực" })
  }, [mutate, toast])

  const needMoreInfo = useCallback(async (id: string, reason: string) => {
    await verificationService.needMoreInfo(id, reason)
    await mutate()
    toast({ title: "Đã yêu cầu bổ sung" })
  }, [mutate, toast])

  return {
    verifications: data?.items || [],
    pagination: data?.pagination || emptyPagination,
    error,
    isLoading,
    approve,
    reject,
    needMoreInfo,
    refresh: mutate,
  }
}
