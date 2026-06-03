"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BookOpen, Calendar, MapPin, Search } from "lucide-react"
import { Header, Footer } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ErrorState, LoadingSkeleton, PublicDataNotice } from "@/components/platform/operational-components"
import { useOpenLearningRequests } from "@/lib/hooks/use-learning-requests"
import { useMasterDataCatalog } from "@/lib/hooks/use-master-data"
import { formatCurrency, formatDate } from "@/lib/helpers"
import type { LearningRequestStatus } from "@/types"

const statusLabels: Record<LearningRequestStatus, string> = {
  new: "Yêu cầu mới",
  draft: "Nháp",
  submitted: "Đã gửi",
  matching: "Đang matching",
  waiting_tutor_proposal: "Chờ proposal",
  proposal_received: "Đã có proposal",
  waiting_parent_confirmation: "Chờ phụ huynh xác nhận",
  consulting: "Đang tư vấn",
  matched: "Đã ghép gia sư",
  trial_scheduled: "Đã hẹn học thử",
  trial_completed: "Đã học thử",
  active: "Đang học",
  rematch: "Cần ghép lại",
  converted_to_class: "Đã chuyển lớp",
  expired: "Hết hạn",
  closed: "Đã đóng",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
}

export default function LearningRequestsPage() {
  const [keyword, setKeyword] = useState("")
  const [subject, setSubject] = useState("all")
  const [grade, setGrade] = useState("all")
  const [location, setLocation] = useState("all")
  const { requests: openRequests, isLoading: requestsLoading, error: requestsError, refetch } = useOpenLearningRequests()
  const {
    subjects,
    grades,
    locations,
    isLoading: masterDataLoading,
    error: masterDataError,
    refresh: refreshMasterData,
  } = useMasterDataCatalog()
  const locationOptions = locations?.map((item) => item.fullPath || item.name) || []

  const requests = useMemo(() => {
    return openRequests.filter((request) => {
      const query = keyword.trim().toLowerCase()
      if (query) {
        const match =
          request.subject.toLowerCase().includes(query) ||
          request.grade.toLowerCase().includes(query) ||
          request.location?.toLowerCase().includes(query)
        if (!match) return false
      }
      if (subject !== "all" && request.subject !== subject) return false
      if (grade !== "all" && request.grade !== grade) return false
      if (location !== "all" && request.location !== location) return false
      return true
    })
  }, [keyword, subject, grade, location, openRequests])

  return (
    <div className="premium-page-bg flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="gradient-mesh py-12">
          <div className="app-container text-center">
            <Badge className="premium-badge mb-3">Dành cho gia sư</Badge>
            <h1 className="font-heading text-3xl font-bold md:text-5xl">Yêu cầu tìm gia sư đang mở</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Gia sư có thể xem nhu cầu học tập thật từ phụ huynh, sau đó đăng nhập để nhận lớp phù hợp.
            </p>
          </div>
        </section>

        <section className="app-container py-8">
          <Card className="glass-card-strong mb-6 rounded-2xl">
            <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_180px_180px_180px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm theo môn, lớp, khu vực..."
                  className="pl-9"
                />
              </div>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn</SelectItem>
                  {subjects?.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Lớp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả lớp</SelectItem>
                  {grades?.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Khu vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu vực</SelectItem>
                  {locationOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {(masterDataLoading || masterDataError) && (
            <PublicDataNotice
              className="mb-5"
              isLoading={masterDataLoading}
              loadingMessage="Đang tải danh mục lọc. Danh sách lớp vẫn có thể xem bằng dữ liệu hiện có."
              message="Một số danh mục lọc đang dùng dữ liệu dự phòng vì backend chưa phản hồi."
              onRetry={masterDataError ? () => refreshMasterData() : undefined}
              retryLabel="Thử lại danh mục"
            />
          )}

          {requestsError ? (
            <ErrorState
              message="Không tải được yêu cầu học đang mở."
              onRetry={() => {
                refetch()
              }}
            />
          ) : requestsLoading ? (
            <LoadingSkeleton label="Đang tải yêu cầu học..." />
          ) : (
            <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Tìm thấy <b className="text-foreground">{requests.length}</b> yêu cầu phù hợp
            </p>
            <Button className="rounded-full" asChild>
              <Link href="/register-student">Tạo yêu cầu học</Link>
            </Button>
          </div>

          {requests.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {requests.map((request) => (
                <Card key={request.id} className="glass-card gradient-border-hover premium-hover-lift rounded-2xl transition-colors hover:border-primary/30">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">{request.subject} · {request.grade}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">{request.requestCode}</p>
                      </div>
                      <Badge variant="secondary">{statusLabels[request.status] || request.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {request.teachingMode === "online" ? "Online" : request.location || "Linh hoạt"}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {request.preferredSchedule || "Linh hoạt"} · {formatDate(request.createdAt)}
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <BookOpen className="h-4 w-4" />
                      {request.expectedFee ? `${formatCurrency(request.expectedFee)}/giờ` : "Trao đổi sau tư vấn"}
                    </div>
                    <p className="line-clamp-3 text-muted-foreground">Thông tin liên hệ và địa chỉ cụ thể được ẩn cho đến khi admin xử lý.</p>
                    <Button className="w-full rounded-full" asChild>
                      <Link href="/login">Đăng nhập để nhận lớp</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card-strong rounded-2xl">
              <CardContent className="py-14 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">Chưa có yêu cầu học đang mở</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Hãy thử thay đổi bộ lọc hoặc hoàn thiện hồ sơ gia sư để sẵn sàng nhận lớp khi có yêu cầu mới.
                </p>
                <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button variant="outline" onClick={() => {
                    setKeyword("")
                    setSubject("all")
                    setGrade("all")
                    setLocation("all")
                  }}>
                    Xóa bộ lọc
                  </Button>
                  <Button asChild>
                    <Link href="/register?role=tutor&redirect=%2Fdashboard%2Ftutor%2Fprofile">Hoàn thiện hồ sơ gia sư</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
