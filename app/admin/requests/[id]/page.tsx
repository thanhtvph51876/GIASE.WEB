import { redirect } from "next/navigation"

export default async function AdminRequestDetailAlias({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/admin/requests?id=${id}`)
}
