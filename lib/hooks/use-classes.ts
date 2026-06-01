"use client"

import useSWR from "swr"
import type { Class as LearningClass, ClassStatus } from "@/types"
import type { ApiPage, ApiPagination } from "@/lib/api/client"
import { classService } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"

interface UseClassesOptions {
  userId?: string
  tutorId?: string
  role?: "student" | "tutor" | "admin"
  page?: number
  pageSize?: number
}

const emptyPagination: ApiPagination = { page: 1, pageSize: 50, total: 0, totalPages: 1 }

export function useClasses(options: UseClassesOptions = {}) {
  const { userId, tutorId, role = "student", page = 1, pageSize = 50 } = options
  const { toast } = useToast()

  const key =
    role === "admin"
      ? ["classes", "admin", page, pageSize]
      : role === "tutor" && tutorId
        ? ["classes", "tutor", tutorId]
        : userId
          ? ["classes", "student", userId]
          : null

  const { data, error, isLoading, mutate } = useSWR<LearningClass[] | ApiPage<LearningClass>>(
    key,
    () =>
      role === "admin"
        ? classService.getAllClassesPage({ page, pageSize })
        : role === "tutor" && tutorId
          ? classService.getClassesByTutor(tutorId)
          : userId
            ? classService.getClassesByStudent(userId)
            : Promise.resolve([]),
    { revalidateOnFocus: false }
  )

  const updateClassStatus = async (classId: string, status: ClassStatus): Promise<boolean> => {
    const result = await classService.updateClassStatus(classId, status)
    if (result.success) {
      mutate()
      toast({ title: "Cập nhật lớp học thành công" })
      return true
    }
    toast({ title: "Cập nhật thất bại", description: result.error, variant: "destructive" })
    return false
  }

  const adminData = role === "admin" && data && !Array.isArray(data) ? data : null

  return {
    classes: adminData ? adminData.items : Array.isArray(data) ? data : ([] as LearningClass[]),
    pagination: adminData?.pagination || emptyPagination,
    isLoading,
    loading: isLoading,
    error,
    updateClassStatus,
    refetch: mutate,
    refresh: mutate,
  }
}
