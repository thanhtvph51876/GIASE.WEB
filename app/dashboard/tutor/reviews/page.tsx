"use client"

import { Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useReviews } from "@/lib/hooks/use-reviews"
import { useTutorProfileByUser } from "@/lib/hooks/use-tutors"

export default function TutorReviewsPage() {
  const { user } = useAuthContext()
  const { tutor } = useTutorProfileByUser(user?.id)
  const { reviews } = useReviews(tutor?.id)
  const avg = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Đánh giá</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Rating trung bình: {avg.toFixed(1)} / 5 từ {reviews.length} đánh giá.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="metric-tile">
          <p className="text-sm text-muted-foreground">Rating trung bình</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{avg.toFixed(1)} / 5</p>
        </div>
        <div className="metric-tile">
          <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{reviews.length}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-5">
              <div className="flex gap-1 text-amber-500">{Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-3 text-muted-foreground">{review.content}</p>
              <p className="mt-3 font-semibold text-slate-900">{review.studentName}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {!reviews.length && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Chưa có đánh giá</CardTitle>
            <CardDescription>Đánh giá sẽ xuất hiện sau khi học sinh hoàn thành buổi học và gửi review.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
