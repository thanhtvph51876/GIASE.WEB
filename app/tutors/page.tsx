"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Grid2X2, List, Search, SlidersHorizontal, X } from "lucide-react"
import { Header, Footer } from "@/components/layout"
import { TutorCard } from "@/components/tutor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { LOCATIONS_HCM, SUBJECT_OPTIONS } from "@/lib/constants"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useFavorites, useTutors } from "@/lib/hooks/use-tutors"
import type { Gender, TeachingMode, TutorFilters, TutorSortBy } from "@/types"

const sortLabels: Record<TutorSortBy, string> = {
  best_match: "Phù hợp nhất",
  rating_desc: "Rating cao nhất",
  price_asc: "Học phí thấp nhất",
  price_desc: "Học phí cao nhất",
  experience_desc: "Kinh nghiệm nhiều nhất",
  newest: "Mới nhất",
}

function TutorsContent() {
  const searchParams = useSearchParams()
  const initialFilters: TutorFilters = {
    subject: searchParams.get("subject") || undefined,
    grade: searchParams.get("grade") || undefined,
    location: searchParams.get("location") || undefined,
    teachingMode: (searchParams.get("mode") as TeachingMode | null) || undefined,
  }
  const { user } = useAuthContext()
  const { tutors, filters, sortBy, isLoading, updateFilters, setSortBy, resetFilters } = useTutors({
    initialFilters,
  })
  const { toggleFavorite, isFavorite } = useFavorites(
    user?.role === "student" || user?.role === "parent" ? user.id : undefined
  )
  const [mobileOpen, setMobileOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [compareIds, setCompareIds] = useState<string[]>([])

  const price = useMemo(() => [filters.maxPrice || 500000], [filters.maxPrice])
  const activeFilters = [
    filters.keyword,
    filters.subject,
    filters.grade,
    filters.location,
    filters.teachingMode,
    filters.minRating,
    filters.verified,
    filters.gender,
  ].filter(Boolean).length
  const comparedTutors = tutors.filter((tutor) => compareIds.includes(tutor.id))
  const toggleCompare = (id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length >= 3) return current
      return [...current, id]
    })
  }

  const filterPanel = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="keyword">Từ khóa</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="keyword"
            value={filters.keyword || ""}
            onChange={(event) => updateFilters({ keyword: event.target.value || undefined })}
            placeholder="Tên, môn học, khu vực..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Môn học</Label>
        <Select
          value={filters.subject || "all"}
          onValueChange={(value) => updateFilters({ subject: value === "all" ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả môn học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả môn học</SelectItem>
            {SUBJECT_OPTIONS.map((subject) => (
              <SelectItem key={subject.id} value={subject.name}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Lớp học</Label>
        <Select
          value={filters.grade || "all"}
          onValueChange={(value) => updateFilters({ grade: value === "all" ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả lớp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lớp</SelectItem>
            {["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5", "Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12", "Luyện thi THPT", "IELTS"].map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Khu vực</Label>
        <Select
          value={filters.location || "all"}
          onValueChange={(value) => updateFilters({ location: value === "all" ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả khu vực" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khu vực</SelectItem>
            {LOCATIONS_HCM.slice(0, 18).map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Hình thức học</Label>
        <Select
          value={filters.teachingMode || "all"}
          onValueChange={(value) =>
            updateFilters({ teachingMode: value === "all" ? undefined : (value as TeachingMode) })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả hình thức" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả hình thức</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="both">Cả hai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Học phí tối đa: {(filters.maxPrice || 500000).toLocaleString("vi-VN")}đ/giờ</Label>
        <Slider
          value={price}
          min={100000}
          max={500000}
          step={50000}
          onValueChange={([value]) => updateFilters({ maxPrice: value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Rating</Label>
          <Select
            value={String(filters.minRating || 0)}
            onValueChange={(value) => updateFilters({ minRating: Number(value) || undefined })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Tất cả</SelectItem>
              <SelectItem value="4">Từ 4 sao</SelectItem>
              <SelectItem value="4.5">Từ 4.5 sao</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Giới tính</Label>
          <Select
            value={filters.gender || "all"}
            onValueChange={(value) => updateFilters({ gender: value === "all" ? undefined : (value as Gender) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="female">Nữ</SelectItem>
              <SelectItem value="male">Nam</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border p-3">
        <Checkbox
          id="verified"
          checked={filters.verified === true}
          onCheckedChange={(checked) => updateFilters({ verified: checked === true ? true : undefined })}
        />
        <Label htmlFor="verified" className="text-sm">
          Chỉ hiển thị gia sư đã xác minh
        </Label>
      </div>

      <Button variant="outline" className="w-full" onClick={resetFilters}>
        Xóa bộ lọc
      </Button>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="page-band py-10">
          <div className="app-container">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-3 bg-blue-100 text-blue-700 hover:bg-blue-100">Hồ sơ gia sư minh bạch</Badge>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Tìm gia sư phù hợp chỉ trong vài phút
              </h1>
              <p className="mt-4 text-muted-foreground">
                Xem kinh nghiệm, học phí, lịch rảnh và đánh giá trước khi đăng ký học thử.
              </p>
            </div>
          </div>
        </section>

        <section className="app-container py-8">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <Card className="sticky top-24 shadow-sm">
                <CardContent className="p-5">{filterPanel}</CardContent>
              </Card>
            </aside>

            <div className="space-y-5">
                <div className="surface-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{isLoading ? "Đang tải..." : `${tutors.length} gia sư phù hợp`}</p>
                  <p className="text-sm text-muted-foreground">Dữ liệu được đồng bộ qua service và lưu lại trong trình duyệt.</p>
                  {compareIds.length > 0 && <p className="mt-1 text-sm font-medium text-primary">Đang chọn {compareIds.length}/3 gia sư để so sánh</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" disabled={comparedTutors.length < 2}>
                        So sánh {comparedTutors.length ? `(${comparedTutors.length})` : ""}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>So sánh gia sư</DialogTitle>
                      </DialogHeader>
                      <div className="overflow-x-auto">
                        <div className="grid min-w-[720px] gap-3" style={{ gridTemplateColumns: `180px repeat(${Math.max(comparedTutors.length, 1)}, minmax(160px, 1fr))` }}>
                          {["Tiêu chí", ...comparedTutors.map((tutor) => tutor.fullName)].map((item) => <div key={item} className="rounded-lg bg-slate-100 p-3 font-semibold">{item}</div>)}
                          <CompareRow label="Học phí" values={comparedTutors.map((tutor) => `${tutor.pricePerHour.toLocaleString("vi-VN")}đ/giờ`)} />
                          <CompareRow label="Rating" values={comparedTutors.map((tutor) => `${tutor.rating} (${tutor.reviewCount} review)`)} />
                          <CompareRow label="Kinh nghiệm" values={comparedTutors.map((tutor) => `${tutor.experienceYears} năm`)} />
                          <CompareRow label="Môn dạy" values={comparedTutors.map((tutor) => tutor.subjects.join(", "))} />
                          <CompareRow label="Lớp dạy" values={comparedTutors.map((tutor) => tutor.grades.slice(0, 3).join(", "))} />
                          <CompareRow label="Hình thức" values={comparedTutors.map((tutor) => tutor.teachingModes)} />
                          <CompareRow label="Khu vực" values={comparedTutors.map((tutor) => tutor.locations.slice(0, 2).join(", ") || "Online")} />
                          <CompareRow label="Xác minh" values={comparedTutors.map((tutor) => tutor.verified ? "Đã xác minh" : "Chưa xác minh")} />
                          <div className="rounded-lg bg-white p-3 font-semibold">Đặt học thử</div>
                          {comparedTutors.map((tutor) => <Button key={tutor.id} asChild><a href={`/tutors/${tutor.id}/booking`}>Đặt lịch</a></Button>)}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Bộ lọc
                        {activeFilters > 0 && <Badge className="ml-2">{activeFilters}</Badge>}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[86vw] overflow-y-auto sm:max-w-sm">
                      <SheetHeader>
                        <SheetTitle>Bộ lọc gia sư</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">{filterPanel}</div>
                    </SheetContent>
                  </Sheet>

                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as TutorSortBy)}>
                    <SelectTrigger className="w-[190px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sortLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="hidden rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:flex">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      aria-label="Xem dạng lưới"
                    >
                      <Grid2X2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      aria-label="Xem dạng danh sách"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {activeFilters > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {Object.entries(filters).map(([key, value]) =>
                    value ? (
                      <Badge key={key} variant="secondary" className="gap-1">
                        {String(value)}
                        <button
                          type="button"
                          onClick={() => updateFilters({ [key]: undefined } as Partial<TutorFilters>)}
                          aria-label="Xóa bộ lọc"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  )}
                </div>
              )}

              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-80 rounded-lg" />
                  ))}
                </div>
              ) : tutors.length > 0 ? (
                <div className={viewMode === "grid" ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3" : "grid gap-4"}>
                  {tutors.map((tutor) => (
                    <div key={tutor.id} className="relative">
                      <TutorCard tutor={tutor} />
                      <Button
                        type="button"
                        variant={isFavorite(tutor.id) ? "default" : "outline"}
                        size="sm"
                        className="absolute right-4 top-4 shadow-sm"
                        onClick={() => toggleFavorite(tutor.id)}
                      >
                        {isFavorite(tutor.id) ? "Đã lưu" : "Lưu"}
                      </Button>
                      <Button
                        type="button"
                        variant={compareIds.includes(tutor.id) ? "default" : "outline"}
                        size="sm"
                        className="absolute right-4 top-14 shadow-sm"
                        onClick={() => toggleCompare(tutor.id)}
                        disabled={!compareIds.includes(tutor.id) && compareIds.length >= 3}
                      >
                        {compareIds.includes(tutor.id) ? "Đang so sánh" : "So sánh"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Search className="h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-semibold">Không tìm thấy gia sư phù hợp</h2>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Hãy thử mở rộng khu vực, giảm mức rating hoặc chọn hình thức học khác.
                    </p>
                    <Button className="mt-5" onClick={resetFilters}>
                      Xóa bộ lọc
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <>
      <div className="rounded-lg border bg-white p-3 font-medium">{label}</div>
      {values.map((value, index) => (
        <div key={`${label}-${index}`} className="rounded-lg border bg-white p-3 text-sm text-muted-foreground">{value}</div>
      ))}
    </>
  )
}

export default function TutorsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải danh sách gia sư...</div>}>
      <TutorsContent />
    </Suspense>
  )
}
