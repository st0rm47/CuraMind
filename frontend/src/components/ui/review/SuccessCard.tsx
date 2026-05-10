// src/components/ui/review/SuccessCard.tsx
interface Props {
  patientName: string | null
  onReviewNext: () => void
}

export default function SuccessCard({ patientName, onReviewNext }: Props) {
  return (
    // FIX: tighter padding on mobile, break-words on patient name
    <div
      className="rounded-2xl text-center px-4 sm:px-6 py-10 sm:py-12 min-w-0"
      style={{
        border:     '1px solid rgba(29,158,117,0.25)',
        background: 'rgba(29,158,117,0.06)',
      }}
    >
      <div
        style={{
          fontSize: 52, marginBottom: 16,
          animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'inline-block',
        }}
      >
        ✅
      </div>

      <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-100 mb-2">
        Review Saved & Patient Notified
      </h2>

      <p className="text-[13px] text-gray-400 mb-6 leading-relaxed mx-auto max-w-[360px] break-words">
        Your diagnosis for{' '}
        <strong className="text-gray-100">{patientName ?? 'the patient'}</strong>{' '}
        has been stored and they have received a push notification.
      </p>

      {/* FIX: full-width button on mobile */}
      <button
        onClick={onReviewNext}
        className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-[13px] font-semibold text-gray-100 transition-colors"
        style={{
          border:     '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
      >
        Review Next Case →
      </button>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}