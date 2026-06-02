import { AdminCrmDetail } from "@/components/admin/admin-crm-detail"

export default async function AdminStudentCrmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AdminCrmDetail id={id} entity="student" backHref="/admin/students" />
}
