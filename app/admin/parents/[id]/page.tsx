import { AdminCrmDetail } from "@/components/admin/admin-crm-detail"

export default async function AdminParentCrmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AdminCrmDetail id={id} entity="parent" backHref="/admin/parents" />
}
