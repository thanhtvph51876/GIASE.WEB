import { redirect } from "next/navigation"

export default async function TutorClassAliasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/dashboard/tutor/classes/${id}`)
}
