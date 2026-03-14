"use client"

import { Button } from "@/components/ui/button"

type Props = {
  page: number
  pageCount: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function PaginationControls({
  page,
  pageCount,
  totalItems,
  pageSize,
  onPageChange,
}: Props) {
  if (pageCount <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
      <span>
        Showing {start}-{end} of {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Prev
        </Button>
        <span className="text-xs text-slate-500">
          Page {page} of {pageCount}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
