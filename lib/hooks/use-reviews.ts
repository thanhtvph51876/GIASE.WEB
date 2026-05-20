"use client"

import { useCallback } from "react"
import useSWR from "swr"
import type { Review, User } from "@/types"
import { reviewService } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"

// ============================================
// USE REVIEWS HOOK
// Manages reviews
// ============================================

interface CreateReviewData {
  tutorId: string
  studentId?: string
  studentName: string
  avatar?: string
  sessionId?: string
  classId?: string
  rating: number
  content: string
  actor?: User | null
}

export function useReviews(tutorId?: string) {
  const { toast } = useToast()

  // Fetch reviews for tutor
  const {
    data: reviews,
    error,
    isLoading,
    mutate,
  } = useSWR(
    tutorId ? ["reviews", tutorId] : null,
    () => reviewService.getReviewsByTutor(tutorId!),
    {
      revalidateOnFocus: false,
    }
  )

  // Fetch rating stats
  const { data: ratingStats } = useSWR(
    tutorId ? ["rating-stats", tutorId] : null,
    () => reviewService.getAverageRating(tutorId!),
    {
      revalidateOnFocus: false,
    }
  )

  // Create review
  const createReview = useCallback(
    async (data: CreateReviewData): Promise<Review | null> => {
      try {
        const result = await reviewService.createReview(data)

        if (result.success && result.review) {
          mutate()
          toast({
            title: "Đánh giá thành công",
            description: "Cảm ơn bạn đã gửi đánh giá!",
          })
          return result.review
        }

        toast({
          title: "Đánh giá thất bại",
          description: result.error,
          variant: "destructive",
        })
        return null
      } catch {
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra, vui lòng thử lại",
          variant: "destructive",
        })
        return null
      }
    },
    [mutate, toast]
  )

  // Delete review
  const deleteReview = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const result = await reviewService.deleteReview(id)

        if (result.success) {
          mutate()
          toast({
            title: "Đã xóa đánh giá",
          })
          return true
        }

        toast({
          title: "Xóa thất bại",
          description: result.error,
          variant: "destructive",
        })
        return false
      } catch {
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra, vui lòng thử lại",
          variant: "destructive",
        })
        return false
      }
    },
    [mutate, toast]
  )

  return {
    reviews: reviews || [],
    averageRating: ratingStats?.average || 0,
    reviewCount: ratingStats?.count || 0,
    isLoading,
    error,
    createReview,
    deleteReview,
    refresh: mutate,
  }
}

export function useStudentReviews(studentId?: string) {
  const {
    data: reviews,
    error,
    isLoading,
    mutate,
  } = useSWR(
    studentId ? ["reviews", "student", studentId] : null,
    () => reviewService.getReviewsByStudent(studentId!),
    { revalidateOnFocus: false }
  )

  return {
    reviews: reviews || [],
    isLoading,
    loading: isLoading,
    error,
    refetch: mutate,
    refresh: mutate,
  }
}
