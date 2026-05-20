"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardMetricCard, RatingDisplay } from "@/components/platform/operational-components"
import { reviewService } from "@/lib/services"
import { formatDate } from "@/lib/helpers"
import type { Review } from "@/types"

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  useEffect(() => { reviewService.getAllReviews().then(setReviews) }, [])
  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6"><h1 className="text-2xl font-bold">Đánh giá</h1><p className="text-sm text-muted-foreground">Theo dõi review tốt và cảnh báo review thấp.</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Tổng review" value={reviews.length} />
        <DashboardMetricCard label="Review thấp" value={reviews.filter((item) => item.rating <= 3).length} />
        <DashboardMetricCard label="Rating TB" value={reviews.length ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1) : "0.0"} />
      </div>
      <Card><CardHeader><CardTitle>Danh sách review</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2">
        {reviews.map((review) => <div key={review.id} className="item-row"><RatingDisplay value={review.rating} /><p className="mt-2 text-sm">{review.content}</p><p className="mt-2 text-xs text-muted-foreground">{review.studentName} · {formatDate(review.createdAt)}</p></div>)}
      </CardContent></Card>
    </div>
  )
}
