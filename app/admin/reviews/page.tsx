"use client"

import { useEffect, useMemo, useState } from "react"
import { Flag, Star } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardMetricCard, RatingDisplay } from "@/components/platform/operational-components"
import { reviewService } from "@/lib/services"
import { formatDate } from "@/lib/helpers"
import type { Review } from "@/types"

type ReviewStatusFilter = "all" | "visible" | "hidden" | "flagged"

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [tutorId, setTutorId] = useState("all")
  const [classId, setClassId] = useState("all")
  const [rating, setRating] = useState("all")
  const [status, setStatus] = useState<ReviewStatusFilter>("all")
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => setReviews(await reviewService.getAllReviews())
  useEffect(() => { load() }, [])

  const tutorOptions = useMemo(() => unique(reviews.map((item) => item.tutorId)), [reviews])
  const classOptions = useMemo(() => unique(reviews.map((item) => item.classId).filter(Boolean) as string[]), [reviews])
  const visibleReviews = useMemo(() => reviews.filter((item) => {
    const rawStatus = rawText(item, "status", "moderationStatus") || "visible"
    return (tutorId === "all" || item.tutorId === tutorId)
      && (classId === "all" || item.classId === classId)
      && (rating === "all" || item.rating === Number(rating))
      && (status === "all" || rawStatus === status || (status === "visible" && !["hidden", "flagged"].includes(rawStatus)))
  }), [classId, rating, reviews, status, tutorId])
  const topTutor = useMemo(() => mostReviewed(reviews, "tutorId"), [reviews])
  const topClass = useMemo(() => mostReviewed(reviews.filter((item) => item.classId), "classId"), [reviews])

  const moderate = async (id: string, action: "hide" | "show" | "flag") => {
    setBusyId(id)
    try {
      const result = action === "hide"
        ? await reviewService.deleteReview(id)
        : action === "show"
          ? await reviewService.showReview(id)
          : await reviewService.flagReview(id)
      if (result.success) {
        toast.success("Đã cập nhật đánh giá")
        load()
      } else toast.error(result.error)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold">Đánh giá</h1>
        <p className="text-sm text-muted-foreground">Theo dõi đánh giá theo gia sư, lớp học, rating và trạng thái moderation.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <DashboardMetricCard label="Tổng review" value={reviews.length} icon={Star} />
        <DashboardMetricCard label="Review thấp" value={reviews.filter((item) => item.rating <= 3).length} icon={Flag} tone="amber" />
        <DashboardMetricCard label="Rating TB" value={reviews.length ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1) : "0.0"} />
        <DashboardMetricCard label="Gia sư nhiều review" value={topTutor ? topTutor.count : 0} helper={topTutor?.id || "Chưa có"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc quản trị</CardTitle>
          <CardDescription>Lọc theo tutor, class, rating và trạng thái để xử lý chất lượng có trọng tâm.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Select value={tutorId} onValueChange={setTutorId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả gia sư</SelectItem>
              {tutorOptions.map((id) => <SelectItem key={id} value={id}>{id}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả lớp</SelectItem>
              {classOptions.map((id) => <SelectItem key={id} value={id}>{id}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả rating</SelectItem>
              {[5, 4, 3, 2, 1].map((item) => <SelectItem key={item} value={String(item)}>{item} sao</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => setStatus(value as ReviewStatusFilter)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="visible">Đang hiển thị</SelectItem>
              <SelectItem value="flagged">Đã gắn cờ</SelectItem>
              <SelectItem value="hidden">Đã ẩn</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách review</CardTitle>
            <CardDescription>{visibleReviews.length} review theo bộ lọc hiện tại.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {visibleReviews.map((review) => (
              <div key={review.id} className="item-row">
                <div className="flex items-start justify-between gap-3">
                  <RatingDisplay value={review.rating} />
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{rawText(review, "status", "moderationStatus") || "visible"}</span>
                </div>
                <p className="mt-2 text-sm leading-6">{review.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">{review.studentName} · {formatDate(review.createdAt)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Tutor: {review.tutorId} · Lớp: {review.classId || "Không gắn"} · Session: {review.sessionId || "Không gắn"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={busyId === review.id} onClick={() => moderate(review.id, "flag")}>Gắn cờ</Button>
                  <Button size="sm" variant="outline" disabled={busyId === review.id} onClick={() => moderate(review.id, "hide")}>Ẩn</Button>
                  <Button size="sm" variant="outline" disabled={busyId === review.id} onClick={() => moderate(review.id, "show")}>Hiện</Button>
                </div>
              </div>
            ))}
            {!visibleReviews.length && <div className="soft-panel border-dashed p-8 text-center text-sm text-muted-foreground md:col-span-2">Không có review theo bộ lọc.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tổng hợp theo đối tượng</CardTitle>
            <CardDescription>Giúp admin nhìn nhanh review tập trung ở tutor/lớp nào.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Summary title="Tutor nhiều review nhất" value={topTutor?.id || "Chưa có"} count={topTutor?.count || 0} />
            <Summary title="Lớp nhiều review nhất" value={topClass?.id || "Chưa có"} count={topClass?.count || 0} />
            <div className="rounded-lg border bg-slate-50 p-3">
              <p className="text-sm font-semibold">Tìm nhanh Tutor/Class ID</p>
              <Input className="mt-2" placeholder="Dán tutorId để lọc" onChange={(event) => setTutorId(event.target.value.trim() || "all")} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function mostReviewed(items: Review[], key: "tutorId" | "classId") {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    const id = item[key]
    if (id) acc[id] = (acc[id] || 0) + 1
    return acc
  }, {})
  const [id, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || []
  return id ? { id, count } : null
}

function rawText(item: unknown, ...keys: string[]) {
  const raw = item && typeof item === "object" ? item as Record<string, unknown> : {}
  for (const key of keys) {
    const value = raw[key]
    if (value !== undefined && value !== null && String(value).trim()) return String(value)
  }
  return ""
}

function Summary({ title, value, count }: { title: string; value: string; count: number }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 break-words text-xs text-muted-foreground">{value}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{count}</p>
    </div>
  )
}
