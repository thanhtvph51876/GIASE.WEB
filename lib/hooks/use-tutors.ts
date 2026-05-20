"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import type { Tutor, TutorFilters, TutorSortBy, TutorRegistrationFormData } from "@/types"
import { tutorService } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"

// ============================================
// USE TUTORS HOOK
// Manages tutor listing and filtering
// ============================================

interface UseTutorsOptions {
  initialFilters?: TutorFilters
  initialSortBy?: TutorSortBy
}

export function useTutors(options: UseTutorsOptions = {}) {
  const { initialFilters, initialSortBy = "best_match" } = options

  const [filters, setFilters] = useState<TutorFilters>(initialFilters || {})
  const [sortBy, setSortBy] = useState<TutorSortBy>(initialSortBy)

  // Fetch tutors with SWR
  const {
    data: tutors,
    error,
    isLoading,
    mutate,
  } = useSWR(
    ["tutors", filters, sortBy],
    () => tutorService.getTutors(filters, sortBy),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<TutorFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({})
    setSortBy("best_match")
  }, [])

  // Refresh data
  const refresh = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    tutors: tutors || [],
    filters,
    sortBy,
    isLoading,
    error,
    setFilters,
    updateFilters,
    setSortBy,
    resetFilters,
    refresh,
  }
}

// ============================================
// USE TUTOR DETAIL HOOK
// Fetches single tutor by ID
// ============================================

export function useTutorDetail(id: string) {
  const {
    data: tutor,
    error,
    isLoading,
    mutate,
  } = useSWR(id ? ["tutor", id] : null, () => tutorService.getTutorById(id), {
    revalidateOnFocus: false,
  })

  return {
    tutor,
    isLoading,
    error,
    refresh: mutate,
  }
}

export function useTutorProfileByUser(userId?: string) {
  const {
    data: tutor,
    error,
    isLoading,
    mutate,
  } = useSWR(userId ? ["tutor-profile", userId] : null, () => tutorService.getTutorByUserId(userId!), {
    revalidateOnFocus: false,
  })

  const updateTutorProfile = useCallback(
    async (id: string, data: Partial<Tutor>): Promise<Tutor | null> => {
      const result = await tutorService.updateTutorProfile(id, data)
      if (result.success && result.tutor) {
        mutate(result.tutor, { revalidate: false })
        return result.tutor
      }
      return null
    },
    [mutate]
  )

  return {
    tutor,
    isLoading,
    loading: isLoading,
    error,
    refetch: mutate,
    refresh: mutate,
    updateTutorProfile,
  }
}

export function useAllTutors() {
  const {
    data: tutors,
    error,
    isLoading,
    mutate,
  } = useSWR("all-tutors", () => tutorService.getAllTutors(), {
    revalidateOnFocus: false,
  })

  return {
    tutors: tutors || [],
    isLoading,
    loading: isLoading,
    error,
    refetch: mutate,
    refresh: mutate,
  }
}

// ============================================
// USE FAVORITES HOOK
// Manages favorite tutors
// ============================================

export function useFavorites(userId: string | undefined) {
  const { toast } = useToast()

  const {
    data: favoriteTutors,
    error,
    isLoading,
    mutate,
  } = useSWR(
    userId ? ["favorites", userId] : null,
    () => tutorService.getFavoriteTutors(userId!),
    {
      revalidateOnFocus: false,
    }
  )

  const favoriteIds = userId ? tutorService.getFavoriteTutorIds(userId) : []

  const toggleFavorite = useCallback(
    async (tutorId: string) => {
      if (!userId) {
        toast({
          title: "Vui lòng đăng nhập",
          description: "Bạn cần đăng nhập để lưu gia sư yêu thích",
          variant: "destructive",
        })
        return false
      }

      const { isFavorite } = await tutorService.toggleFavorite(userId, tutorId)
      mutate()

      toast({
        title: isFavorite ? "Đã lưu gia sư" : "Đã bỏ lưu gia sư",
        description: isFavorite
          ? "Gia sư đã được thêm vào danh sách yêu thích"
          : "Gia sư đã được xóa khỏi danh sách yêu thích",
      })

      return isFavorite
    },
    [userId, mutate, toast]
  )

  const isFavorite = useCallback(
    (tutorId: string) => {
      return favoriteIds.includes(tutorId)
    },
    [favoriteIds]
  )

  return {
    favoriteTutors: favoriteTutors || [],
    favoriteIds,
    isLoading,
    error,
    toggleFavorite,
    isFavorite,
    refresh: mutate,
  }
}

export function useTutorRegistration(userId?: string) {
  const { toast } = useToast()

  const createTutorProfile = useCallback(
    async (data: TutorRegistrationFormData): Promise<Tutor | null> => {
      try {
        const result = await tutorService.createTutorProfile(
          data,
          userId || `guest-tutor-${Date.now()}`
        )
        if (result.success && result.tutor) {
          toast({
            title: "Gửi hồ sơ gia sư thành công",
            description: "Hồ sơ của bạn đang chờ xét duyệt.",
          })
          return result.tutor
        }
        toast({
          title: "Không thể gửi hồ sơ",
          description: result.error,
          variant: "destructive",
        })
        return null
      } catch (error) {
        toast({
          title: "Lỗi",
          description: error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại",
          variant: "destructive",
        })
        return null
      }
    },
    [toast, userId]
  )

  return { createTutorProfile }
}
