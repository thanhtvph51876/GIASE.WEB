import { redirect } from "next/navigation"

export default async function ClassDetailAliasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/dashboard/student/classes/${id}`)
}
