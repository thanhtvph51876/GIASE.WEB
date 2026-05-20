import type { Tutor, TutorFilters, TutorSortBy } from "@/types"

// ============================================
// TUTOR HELPER FUNCTIONS
// Pure functions for tutor filtering and sorting
// ============================================

/**
 * Filter tutors based on provided filters
 */
export function filterTutors(tutors: Tutor[], filters: TutorFilters): Tutor[] {
  return tutors.filter((tutor) => {
    // Keyword search (name, subject, location, university, faculty)
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase().trim()
      const matchesKeyword =
        tutor.fullName.toLowerCase().includes(keyword) ||
        tutor.subjects.some((s) => s.toLowerCase().includes(keyword)) ||
        tutor.locations.some((l) => l.toLowerCase().includes(keyword)) ||
        tutor.university.toLowerCase().includes(keyword) ||
        tutor.faculty.toLowerCase().includes(keyword) ||
        tutor.major.toLowerCase().includes(keyword)
      if (!matchesKeyword) return false
    }

    // Subject filter
    if (filters.subject && !tutor.subjects.includes(filters.subject)) {
      return false
    }

    // Grade filter
    if (filters.grade && !tutor.grades.includes(filters.grade)) {
      return false
    }

    // Location filter
    if (filters.location && !tutor.locations.includes(filters.location)) {
      return false
    }

    // Teaching mode filter
    if (filters.teachingMode) {
      if (filters.teachingMode === "online" && tutor.teachingModes === "offline") {
        return false
      }
      if (filters.teachingMode === "offline" && tutor.teachingModes === "online") {
        return false
      }
    }

    // Price range filter
    if (filters.minPrice !== undefined && tutor.pricePerHour < filters.minPrice) {
      return false
    }
    if (filters.maxPrice !== undefined && tutor.pricePerHour > filters.maxPrice) {
      return false
    }

    // Minimum rating filter
    if (filters.minRating !== undefined && tutor.rating < filters.minRating) {
      return false
    }

    // Verified filter
    if (filters.verified !== undefined && tutor.verified !== filters.verified) {
      return false
    }

    // Gender filter
    if (filters.gender && tutor.gender !== filters.gender) {
      return false
    }

    return true
  })
}

/**
 * Calculate match score for sorting
 */
export function calculateMatchScore(tutor: Tutor, filters?: TutorFilters): number {
  let score = 0

  // Base score from rating (0-5)
  score += tutor.rating

  // Verified bonus (+1)
  if (tutor.verified) score += 1

  // Experience bonus (up to +2)
  score += Math.min(tutor.experienceYears * 0.5, 2)

  // Response rate bonus (up to +1)
  score += tutor.responseRate * 0.01

  // Review count bonus (up to +1)
  score += Math.min(tutor.reviewCount * 0.02, 1)

  // Filter match bonuses
  if (filters) {
    // Subject match (+3)
    if (filters.subject && tutor.subjects.includes(filters.subject)) {
      score += 3
    }

    // Grade match (+2)
    if (filters.grade && tutor.grades.includes(filters.grade)) {
      score += 2
    }

    // Location match (+2)
    if (filters.location && tutor.locations.includes(filters.location)) {
      score += 2
    }

    // Teaching mode match (+1)
    if (filters.teachingMode) {
      if (tutor.teachingModes === "both") {
        score += 1
      } else if (tutor.teachingModes === filters.teachingMode) {
        score += 1
      }
    }
  }

  return score
}

/**
 * Sort tutors based on sort option
 */
export function sortTutors(
  tutors: Tutor[],
  sortBy: TutorSortBy,
  filters?: TutorFilters
): Tutor[] {
  const sorted = [...tutors]

  switch (sortBy) {
    case "rating_desc":
      return sorted.sort((a, b) => {
        // Primary: rating, Secondary: review count
        if (b.rating !== a.rating) return b.rating - a.rating
        return b.reviewCount - a.reviewCount
      })

    case "price_asc":
      return sorted.sort((a, b) => a.pricePerHour - b.pricePerHour)

    case "price_desc":
      return sorted.sort((a, b) => b.pricePerHour - a.pricePerHour)

    case "experience_desc":
      return sorted.sort((a, b) => b.experienceYears - a.experienceYears)

    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

    case "best_match":
    default:
      return sorted.sort((a, b) => {
        const scoreA = calculateMatchScore(a, filters)
        const scoreB = calculateMatchScore(b, filters)
        return scoreB - scoreA
      })
  }
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Format price range for display
 */
export function formatPriceRange(min?: number, max?: number): string {
  if (min && max) {
    return `${formatPrice(min)} - ${formatPrice(max)}`
  }
  if (min) {
    return `Từ ${formatPrice(min)}`
  }
  if (max) {
    return `Đến ${formatPrice(max)}`
  }
  return "Tất cả mức giá"
}

/**
 * Get teaching mode label
 */
export function getTeachingModeLabel(mode: string): string {
  switch (mode) {
    case "online":
      return "Online"
    case "offline":
      return "Tại nhà"
    case "both":
      return "Online & Tại nhà"
    default:
      return mode
  }
}

/**
 * Get day of week label
 */
export function getDayLabel(dayOfWeek: number): string {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
  return days[dayOfWeek] || ""
}

/**
 * Format available slots for display
 */
export function formatAvailableSlots(
  slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
): string {
  if (!slots || slots.length === 0) return "Linh hoạt"

  const grouped: Record<string, string[]> = {}

  slots.forEach((slot) => {
    const timeRange = `${slot.startTime}-${slot.endTime}`
    const day = getDayLabel(slot.dayOfWeek)
    if (!grouped[timeRange]) {
      grouped[timeRange] = []
    }
    grouped[timeRange].push(day)
  })

  return Object.entries(grouped)
    .map(([time, days]) => `${days.join(", ")}: ${time}`)
    .join(" | ")
}
