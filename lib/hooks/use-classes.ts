"use client"

import useSWR from "swr"
import type { Class as LearningClass, ClassStatus } from "@/types"
import { classService } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"

interface UseClassesOptions {
  userId?: string
  tutorId?: string
  role?: "student" | "tutor" | "admin"
}

export function useClasses(options: UseClassesOptions = {}) {
  const { userId, tutorId, role = "student" } = options
  const { toast } = useToast()

  const key =
    role === "admin"
      ? ["classes", "admin"]
      : role === "tutor" && tutorId
        ? ["classes", "tutor", tutorId]
        : userId
          ? ["classes", "student", userId]
          : null

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () =>
      role === "admin"
        ? classService.getAllClasses()
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

  return {
    classes: data || ([] as LearningClass[]),
    isLoading,
    loading: isLoading,
    error,
    updateClassStatus,
    refetch: mutate,
    refresh: mutate,
  }
}
