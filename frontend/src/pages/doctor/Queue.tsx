// src/pages/doctor/Queue.tsx
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getDoctorQueueApi } from '@/services/doctor.service'
import { getErrorMessage } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import QueueSummaryCards from '@/components/ui/queue/QueueSummaryCards'
import QueueTable from '@/components/ui/queue/QueueTable'
import type { FilterStatus, QueueItem } from '@/types/queue'

const FILTERS: { id: FilterStatus; label: string; icon: string }[] = [
  { id: 'all',      label: 'All Cases', icon: '👥' },
  { id: 'pending',  label: 'Pending',   icon: '⏳' },
  { id: 'reviewed', label: 'Reviewed',  icon: '✔'  },
]

export default function DoctorQueue() {
  const [items,   setItems]   = useState<QueueItem[]>([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [pages,   setPages]   = useState(1)
  const [filter,  setFilter]  = useState<FilterStatus>('all')
  const [loading, setLoading] = useState(true)

  const fetchQueue = useCallback(async (p = 1, f = filter) => {
    setLoading(true)
    try {
      const res = await getDoctorQueueApi(f, p, 15)
      setItems(res.items as QueueItem[])
      setTotal(res.total)
      setPages(res.pages)
      setPage(p)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { void fetchQueue(1, filter) }, [filter])

  const pendingCount  = items.filter(i => i.status?.toLowerCase().includes('pending')).length
  const reviewedCount = items.filter(i => i.status?.toLowerCase() === 'reviewed').length

  return (
    // FIX 1: switch from inline-style flex column to Tailwind so responsive
    // utilities apply correctly; w-full min-w-0 prevents overflow
    <div className="animate-fade-in space-y-5 sm:space-y-6 w-full min-w-0">

      {/* Header — FIX 2: flex-wrap so Refresh button wraps below on narrow screens */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="page-title">Patient List</h1>
          <p className="page-sub">
            {total} {total === 1 ? 'case' : 'cases'} total
          </p>
        </div>

        {/* Refresh button — keep inline styles for hover but add Tailwind for layout */}
        <button
          onClick={() => fetchQueue(page, filter)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium text-gray-400 border border-white/[0.08] bg-transparent transition-all hover:text-gray-200 hover:border-white/[0.15] shrink-0"
        >
          <span className="text-sm">↻</span>
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <QueueSummaryCards
        total={total}
        pendingCount={pendingCount}
        reviewedCount={reviewedCount}
      />

      {/* Filter pills — FIX 3: overflow-x-auto so pills scroll horizontally on
          very small screens instead of wrapping onto two lines */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150"
            style={{
              border:     filter === f.id ? 'none'                          : '1px solid rgba(255,255,255,0.08)',
              background: filter === f.id ? '#4da3ff'                       : 'rgba(255,255,255,0.04)',
              color:      filter === f.id ? '#fff'                          : '#9ca3af',
            }}
          >
            <span className="text-[11px]">{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table card — FIX 4: overflow-x-auto already handled inside QueueTable
          but the Card itself needs min-w-0 so it doesn't expand the page */}
      <Card className="min-w-0 overflow-hidden">
        <QueueTable items={items} loading={loading} />

        {/* Pagination — FIX 5: stack on mobile (count above, buttons below) */}
        {pages > 1 && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-gray-500 font-mono order-2 sm:order-1">
              Page {page} of {pages} · {total} total
            </p>
            <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => fetchQueue(page - 1)}
                className="flex-1 sm:flex-none"
              >
                ← Prev
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= pages}
                onClick={() => fetchQueue(page + 1)}
                className="flex-1 sm:flex-none"
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </Card>

    </div>
  )
}