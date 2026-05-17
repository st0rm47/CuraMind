// src/pages/doctor/Review.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { getDoctorQueueApi, submitReviewApi } from "@/services/doctor.service";
import { getErrorMessage } from "@/services/api";
import { getResults, validateReviewForm } from "@/utils/reviewHelpers";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/common/EmptyState";
import PatientParamsCard from "@/components/ui/review/PatientParamsCard";
import AiPredictionsCard from "@/components/ui/review/AiPredictionsCard";
import DiagnosisForm from "@/components/ui/review/DiagnosisForm";
import SuccessCard from "@/components/ui/review/SuccessCard";
import type { ReviewItem, ReviewForm, ReviewFormErrors, RiskLevel } from "@/types/review";

export default function DoctorReview() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const selectedId = location.state?.report_id as string | undefined;

  const [queue,      setQueue]      = useState<ReviewItem[]>([]);
  const [currentId,  setCurrentId]  = useState<string | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [saved,      setSaved]      = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<ReviewForm>({
    diagnosis: "", recommendations: "", follow_up_weeks: 4,
  });
  const [overrides, setOverrides] = useState<Partial<Record<string, RiskLevel>>>({});
  const [errors,    setErrors]    = useState<ReviewFormErrors>({});

  useEffect(() => {
    getDoctorQueueApi("all", 1, 50)
      .then((res) => {
        const items = res.items as ReviewItem[];
        setQueue(items);
        if (selectedId && items.some((i) => i.id === selectedId)) {
          setCurrentId(selectedId);
        } else {
          const firstPending = items.find(
            (i) => i.status === "pending_review" || i.status === "pending",
          );
          setCurrentId(firstPending?.id ?? items[0]?.id ?? null);
        }
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [selectedId]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, diagnosis: "", recommendations: "" }));
    setOverrides({});
    setErrors({});
    setSaved(false);
  }, [currentId]);

  const item         = queue.find((q) => q.id === currentId) ?? null;
  const results      = item ? getResults(item) : null;
  const pendingCount = queue.filter(
    (q) => q.status === "pending_review" || q.status === "pending",
  ).length;

  const handleFormChange     = (updates: Partial<ReviewForm>) => setForm((f) => ({ ...f, ...updates }));
  const handleOverrideChange = (disease: string, level: RiskLevel) =>
    setOverrides((o) => ({ ...o, [disease]: level }));

  const handleSubmit = async () => {
    const e = validateReviewForm(form);
    if (Object.keys(e).length) { setErrors(e); return; }
    if (!item) return;
    setSubmitting(true);
    try {
      await submitReviewApi({
        report_id: item.id, patient_id: item.patient_id,
        diagnosis: form.diagnosis, recommendations: form.recommendations,
        follow_up_weeks: form.follow_up_weeks, risk_override: overrides,
      });
      toast.success("Review saved! Patient has been notified.");
      setSaved(true);
      setQueue((prev) =>
        prev.map((a) =>
          a.id === item.id
            ? { ...a, status: "reviewed" as const, doctor_review: {
                report_id: item.id, reviewed_at: new Date().toISOString(),
                diagnosis: form.diagnosis, recommendations: form.recommendations,
                follow_up_weeks: form.follow_up_weeks, risk_override: overrides,
              }}
            : a,
        ),
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewNext = () => {
    if (!item) return;
    const currentIndex = queue.findIndex((a) => a.id === item.id);
    const searchOrder  = [...queue.slice(currentIndex + 1), ...queue.slice(0, currentIndex)];
    const next = searchOrder.find((a) => a.status === "pending_review" || a.status === "pending");
    setSaved(false);
    setForm({ diagnosis: "", recommendations: "", follow_up_weeks: 4 });
    setOverrides({});
    setErrors({});
    if (next) { setCurrentId(next.id); }
    else { toast.success("All pending cases reviewed!"); navigate("/doctor/dashboard"); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    // FIX 1: w-full min-w-0 on root
    <div className="animate-fade-in flex flex-col gap-4 sm:gap-5 w-full min-w-0">

      {/* Header — FIX 2: stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="page-title">Review Case</h1>
          <p className="page-sub">
            Patient data · AI predictions · Clinical Evaluation
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-400 font-semibold">
                ({pendingCount} pending)
              </span>
            )}
          </p>
        </div>

        {/* Controls — FIX 3: wrap on mobile */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {queue.length > 1 && (
            // FIX 4: full-width select on mobile
            <select
              value={currentId ?? ""}
              onChange={(e) => setCurrentId(e.target.value)}
              className="w-full sm:w-auto text-[12px] bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500"
            >
              {queue.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.patient_name ?? "Patient"} —{" "}
                  {q.status === "pending_review" || q.status === "pending" ? "⏳ Pending" : "✅ Reviewed"}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => navigate("/doctor/dashboard")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium text-gray-400 border border-white/[0.08] bg-transparent transition-colors hover:text-gray-200 hover:border-white/[0.15] shrink-0"
          >
            ← Dashboard
          </button>
        </div>
      </div>

      {/* No cases */}
      {!item ? (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <EmptyState icon="🩺" title="No cases to review" description="No patient cases found in the queue." />
        </div>
      ) : (
        <>
          <PatientParamsCard item={item} />
          {results && (
            <AiPredictionsCard
              results={results}
              overrides={overrides}
              onOverrideChange={handleOverrideChange}
            />
          )}
          {saved ? (
            <SuccessCard patientName={item.patient_name ?? "Patient"} onReviewNext={handleReviewNext} />
          ) : (
            <DiagnosisForm
              form={form} errors={errors} submitting={submitting}
              onChange={handleFormChange} onSubmit={handleSubmit}
            />
          )}
        </>
      )}
    </div>
  );
}