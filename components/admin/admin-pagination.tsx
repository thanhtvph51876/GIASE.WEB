"use client"

import type { ApiPagination } from "@/lib/api/client"
import { Button } from "@/components/ui/button"

export const ADMIN_PAGE_SIZE = 50

export function AdminPagination({
  pagination,
  loading,
  onPageChange,
}: {
  pagination: ApiPagination
  loading?: boolean
  onPageChange: (page: number) => void
}) {
  const from = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
  const to = Math.min(pagination.total, pagination.page * pagination.pageSize)
  const canPrevious = pagination.page > 1
  const canNext = pagination.page < pagination.totalPages

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-muted-foreground">
      <span>
        Hiển thị {from}-{to} / {pagination.total}
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={loading || !canPrevious} onClick={() => onPageChange(pagination.page - 1)}>
          Trước
        </Button>
        <span className="min-w-20 text-center font-medium text-slate-700">
          {pagination.page}/{Math.max(1, pagination.totalPages)}
        </span>
        <Button size="sm" variant="outline" disabled={loading || !canNext} onClick={() => onPageChange(pagination.page + 1)}>
          Sau
        </Button>
      </div>
    </div>
  )
}

export function defaultPagination(page = 1, pageSize = ADMIN_PAGE_SIZE): ApiPagination {
  return { page, pageSize, total: 0, totalPages: 1 }
}
