import type { Metadata } from "next"
import { pageMetadata } from "@/lib/config/site"
import BookingPageClient from "./page-client"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return pageMetadata({
    title: "Đặt lịch học thử",
    description:
      "Gửi yêu cầu đặt lịch học thử với gia sư, giữ thông tin đã nhập khi backend phản hồi lỗi và tạo workflow thật cho admin xử lý.",
    path: `/tutors/${id}/booking`,
  })
}

export default function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string; mode?: string }>
}) {
  return <BookingPageClient params={params} searchParams={searchParams} />
}
