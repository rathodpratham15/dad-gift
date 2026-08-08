import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function getPageNumbers(current: number, last: number): Array<number | 'ellipsis'> {
  const pages: Array<number | 'ellipsis'> = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(last - 1, current + 1)

  if (start > 2) pages.push('ellipsis')
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < last - 1) pages.push('ellipsis')
  if (last > 1) pages.push(last)

  return pages
}

interface AdminPaginationProps {
  page: number
  lastPage: number
  basePath: string
  extraParams?: Record<string, string>
}

export default function AdminPagination({ page, lastPage, basePath, extraParams = {} }: AdminPaginationProps) {
  if (lastPage <= 1) return null

  const buildHref = (p: number) => {
    const params = new URLSearchParams(extraParams)
    params.set('page', String(p))
    return `${basePath}?${params.toString()}`
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          page === 1 ? 'pointer-events-none bg-white text-gray-300' : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {getPageNumbers(page, lastPage).map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
              p === page ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildHref(Math.min(lastPage, page + 1))}
        aria-disabled={page === lastPage}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          page === lastPage ? 'pointer-events-none bg-white text-gray-300' : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
