// src/components/common/Timeline.tsx
import clsx from 'clsx'

interface TimelineItem {
  date?:  string
  title:  string
  body?:  string
  type?:  'default' | 'success' | 'warning'
}

const dotColor: Record<string, string> = {
  default: 'bg-brand-500',
  success: 'bg-teal-500',
  warning: 'bg-yellow-500',
}

export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="relative pl-5">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gray-800" />
      {items.map((item, i) => (
        <div key={i} className="relative mb-4 last:mb-0">
          <div
            className={clsx(
              'absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full border-2 border-gray-900',
              dotColor[item.type ?? 'default'],
            )}
          />
          {item.date && (
            <p className="text-[10px] text-gray-500 font-mono mb-0.5">{item.date}</p>
          )}
          <p className="text-[13px] font-semibold text-gray-200 mb-0.5">{item.title}</p>
          {item.body && (
            <p className="text-[12px] text-gray-400 leading-relaxed">{item.body}</p>
          )}
        </div>
      ))}
    </div>
  )
}
