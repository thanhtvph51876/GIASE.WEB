import { redirect } from "next/navigation"

export default async function AdminTutorDetailAlias({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/admin/tutors?id=${id}`)
}
