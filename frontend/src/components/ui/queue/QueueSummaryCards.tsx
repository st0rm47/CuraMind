// src/components/ui/queue/QueueSummaryCards.tsx
interface Props {
  total: number;
  pendingCount: number;
  reviewedCount: number;
}

const CARDS = [
  {
    key: "total",
    label: "Total Cases",
    color: "#4da3ff",
    bg: "rgba(77,163,255,0.08)",
    border: "rgba(77,163,255,0.13)",
  },
  {
    key: "pending",
    label: "Pending Review",
    color: "#BA7517",
    bg: "rgba(186,117,23,0.08)",
    border: "rgba(186,117,23,0.13)",
  },
  {
    key: "reviewed",
    label: "Reviewed",
    color: "#1D9E75",
    bg: "rgba(29,158,117,0.08)",
    border: "rgba(29,158,117,0.13)",
  },
] as const;

export default function QueueSummaryCards({
  total,
  pendingCount,
  reviewedCount,
}: Props) {
  const values: Record<(typeof CARDS)[number]["key"], number> = {
    total,
    pending: pendingCount,
    reviewed: reviewedCount,
  };

  return (
    // FIX: was inline style grid — Tailwind grid-cols-3 works at all sizes here
    // since each cell only needs to show a number + short label; tighter padding on mobile
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="rounded-xl px-3 sm:px-[18px] py-3 sm:py-[14px] min-w-0"
          style={{ background: card.bg, border: `1px solid ${card.border}` }}
        >
          {/* Label — truncate on mobile so it never wraps and breaks the 3-col grid */}
          <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium uppercase tracking-wide truncate mb-1">
            {card.label}
          </p>
          <p
            className="text-2xl sm:text-[26px] font-bold leading-none tabular-nums"
            style={{ color: card.color }}
          >
            {values[card.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
