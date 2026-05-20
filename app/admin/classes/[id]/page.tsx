import { redirect } from "next/navigation"

export default async function AdminClassDetailAlias({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/admin/classes?id=${id}`)
}
