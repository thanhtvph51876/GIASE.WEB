import type { Metadata } from "next"
import { pageMetadata } from "@/lib/config/site"
import TutorDetailPageClient from "./page-client"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return pageMetadata({
    title: "Hồ sơ gia sư",
    description:
      "Xem hồ sơ gia sư, môn dạy, khu vực, kinh nghiệm, học phí, đánh giá và gửi yêu cầu học thử an toàn.",
    path: `/tutors/${id}`,
  })
}

export default function TutorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <TutorDetailPageClient params={params} />
}
