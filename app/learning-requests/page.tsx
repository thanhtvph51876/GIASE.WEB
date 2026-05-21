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
import { GRADES, LOCATIONS_HCM, SUBJECT_OPTIONS } from "@/lib/constants"
import { useOpenLearningRequests } from "@/lib/hooks/use-learning-requests"
import { formatCurrency, formatDate } from "@/lib/helpers"
import type { LearningRequestStatus } from "@/types"

const statusLabels: Record<LearningRequestStatus, string> = {
  new: "Yêu cầu mới",
  consulting: "Đang tư vấn",
  matched: "Đã ghép gia sư",
  trial_scheduled: "Đã hẹn học thử",
  trial_completed: "Đã học thử",
  active: "Đang học",
  rematch: "Cần ghép lại",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
}

export default function LearningRequestsPage() {
  const [keyword, setKeyword] = useState("")
  const [subject, setSubject] = useState("all")
  const [grade, setGrade] = useState("all")
  const [location, setLocation] = useState("all")
  const { requests: openRequests } = useOpenLearningRequests()

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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="page-band py-10">
          <div className="app-container text-center">
            <Badge className="mb-3 bg-blue-100 text-blue-700 hover:bg-blue-100">Dành cho gia sư</Badge>
            <h1 className="text-3xl font-bold md:text-5xl">Yêu cầu tìm gia sư đang mở</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Gia sư có thể xem nhu cầu học tập thật từ phụ huynh, sau đó đăng nhập để nhận lớp phù hợp.
            </p>
          </div>
        </section>

        <section className="app-container py-8">
          <Card className="mb-6">
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
                  {SUBJECT_OPTIONS.map((item) => (
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
                  {GRADES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
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
                  {LOCATIONS_HCM.slice(0, 18).map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Tìm thấy <b className="text-foreground">{requests.length}</b> yêu cầu phù hợp
            </p>
            <Button asChild>
              <Link href="/register-student">Tạo yêu cầu học</Link>
            </Button>
          </div>

          {requests.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {requests.map((request) => (
                <Card key={request.id} className="transition-colors hover:border-primary/30">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">{request.subject} · {request.grade}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">{request.requestCode}</p>
                      </div>
                      <Badge variant="secondary">{statusLabels[request.status]}</Badge>
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
                    <Button className="w-full" asChild>
                      <Link href="/login">Đăng nhập để nhận lớp</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-14 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">Chưa có yêu cầu phù hợp</h2>
                <p className="mt-2 text-sm text-muted-foreground">Hãy thử thay đổi bộ lọc hoặc quay lại sau.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
