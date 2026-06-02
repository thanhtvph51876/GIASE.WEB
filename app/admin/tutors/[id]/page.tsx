import { AdminCrmDetail } from "@/components/admin/admin-crm-detail"

export default async function AdminTutorCrmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AdminCrmDetail id={id} entity="tutor" backHref="/admin/tutors" />
}
