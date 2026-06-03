import { redirect } from "next/navigation"
import { pageMetadata } from "@/lib/site-config"

export const metadata = pageMetadata({
  title: "Quy trình kết nối gia sư",
  description: "Trang quy trình kết nối gia sư được chuyển tới /how-it-works để giữ route /process hoạt động.",
  path: "/process",
})

export default function ProcessPage() {
  redirect("/how-it-works")
}
