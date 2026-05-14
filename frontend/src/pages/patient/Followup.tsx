// src/pages/patient/FollowUp.tsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Card, { CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/common/EmptyState";
import { getErrorMessage } from "@/services/api";
import { submitFollowUpApi } from "@/services/patient.service";
import { formatDateTime } from "@/utils/formatDate";
import api from "@/services/api";
import type { FeelingStatus } from "@/types/report";
import type { FollowUpStatusResponse, LatestReport, PreviousFollowUp } from "@/types/follow";
import { computeDaysRemaining, dueColor, dueLabel, feelingColor, feelingIcon } from "@/utils/followHelpers";


// Page 
export default function FollowUp() {
  const [data, setData] = useState<FollowUpStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    api
      .get<FollowUpStatusResponse>("/patient/followup-status")
      .then((res) => setData(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const report   = data?.latest_report ?? null;
  const previous = data?.previous_followups ?? [];

  return (
    // FIX 1: w-full min-w-0 on root
    <div className="animate-fade-in space-y-5 sm:space-y-6 w-full min-w-0">
      <div>
        <h1 className="page-title">Follow-Up Update</h1>
        <p className="page-sub">
          Submit your latest measurements so your doctor can track your progress
        </p>
      </div>

      {!report ? (
        <Card>
          <EmptyState
            icon="🔄"
            title="No assessment found"
            description="You need a completed assessment before submitting a follow-up."
          />
        </Card>
      ) : (
        <>
          {/*
           * Three distinct states driven by backend flags:
           *
           * 1. NOT REVIEWED  — followup_cycle_active: false
           *    → amber waiting card
           * 2. CAN SUBMIT    — followup_cycle_active: true, followup_submitted: false
           *    → countdown + form
           * 3. SUBMITTED     — followup_cycle_active: true, followup_submitted: true
           *    → green confirmation + last submitted details
           */}

          {/* ── State 1: Awaiting doctor review ── */}
          {!report.followup_cycle_active && (
            <Card>
              <div className="flex flex-col items-center text-center py-10 gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                  style={{ background: "rgba(251,191,36,0.1)", border: "2px solid #ffbe3d" }}
                >
                  🩺
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-gray-100 mb-1">
                    Awaiting Doctor Review
                  </h2>
                  <p className="text-[12px] text-gray-400 max-w-[300px] leading-relaxed">
                    Your assessment is currently pending physician review. Once your doctor
                    completes the review and sets a follow-up schedule, the countdown and
                    submission form will appear here.
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-400 mt-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                    Pending review
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ── State 2: Doctor reviewed, not yet submitted ── */}
          {report.followup_cycle_active && !report.followup_submitted && (
            <>
              <FollowUpCountdown report={report} />
              <FollowUpForm reportId={report.id} onSuccess={reload} />
            </>
          )}

          {/* ── State 3: Follow-up already submitted ── */}
          {report.followup_cycle_active && report.followup_submitted && (
            <>
              <Card>
                <div className="flex flex-col items-center text-center py-8 gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                    style={{ background: "rgba(0,212,168,0.12)", border: "2px solid #00d4a8" }}
                  >
                    ✅
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-gray-100 mb-1">
                      Follow-Up Submitted
                    </h2>
                    <p className="text-[12px] text-gray-400 max-w-[300px] leading-relaxed">
                      You have already submitted your follow-up for this review cycle.
                      Your doctor has been notified.
                    </p>
                  </div>
                </div>

                {/* Last submitted details */}
                {report.latest_followup && (
                  <div className="border-t border-gray-800 pt-4 mt-2 space-y-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Last Submitted Details
                    </p>

                    {/* Date + feeling */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{feelingIcon(report.latest_followup.feeling)}</span>
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: `${feelingColor(report.latest_followup.feeling)}18`,
                            color: feelingColor(report.latest_followup.feeling),
                          }}
                        >
                          {report.latest_followup.feeling.charAt(0).toUpperCase() +
                            report.latest_followup.feeling.slice(1)}
                        </span>
                      </div>
                      {report.latest_followup.submitted_at && (
                        <span className="font-mono text-[11px] text-gray-500">
                          {formatDateTime(report.latest_followup.submitted_at)}
                        </span>
                      )}
                    </div>

                    {/* Measurements */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {report.latest_followup.glucose !== null && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500">Glucose</span>
                          <span className="font-mono text-[12px] text-gray-200 font-semibold">
                            {report.latest_followup.glucose}
                            <span className="text-[10px] text-gray-500 ml-0.5">mg/dL</span>
                          </span>
                        </div>
                      )}
                      {report.latest_followup.systolic_bp !== null && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500">BP</span>
                          <span className="font-mono text-[12px] text-gray-200 font-semibold">
                            {report.latest_followup.systolic_bp}
                            {report.latest_followup.diastolic_bp !== null &&
                              `/${report.latest_followup.diastolic_bp}`}
                            <span className="text-[10px] text-gray-500 ml-0.5">mmHg</span>
                          </span>
                        </div>
                      )}
                      {report.latest_followup.weight !== null && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500">Weight</span>
                          <span className="font-mono text-[12px] text-gray-200 font-semibold">
                            {report.latest_followup.weight}
                            <span className="text-[10px] text-gray-500 ml-0.5">kg</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Symptoms */}
                    {report.latest_followup.symptoms && (
                      <p className="text-[11px] text-gray-400 leading-relaxed break-words border-t border-gray-800 pt-3">
                        {report.latest_followup.symptoms}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            </>
          )}

          {/* Always show full history if any previous submissions exist */}
          {previous.length > 0 && <PreviousFollowUps items={previous} />}
        </>
      )}
    </div>
  );
}

// ── Countdown card ────────────────────────────────────────────────────────────

function FollowUpCountdown({ report }: { report: LatestReport }) {
  const dr    = report.doctor_review;
  const days  = computeDaysRemaining(dr?.reviewed_at ?? null, dr?.follow_up_weeks ?? null);
  const color = days !== null ? dueColor(days) : "#6b7280";

  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">

        {/* Countdown ring — centered on mobile, left-aligned on sm+ */}
        <div
          className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center mx-auto sm:mx-0"
          style={{ background: `${color}15`, border: `3px solid ${color}` }}
        >
          {days !== null ? (
            <>
              <span className="text-xl sm:text-2xl font-black tabular-nums leading-none" style={{ color }}>
                {Math.abs(days)}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wide mt-0.5" style={{ color }}>
                {days < 0 ? "overdue" : days === 0 ? "today" : "days"}
              </span>
            </>
          ) : (
            <span className="text-2xl">📋</span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          {dr ? (
            <>
              {/* FIX 2: flex-wrap on the title+badge row */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="text-[14px] sm:text-[15px] font-bold text-gray-100">
                  {days !== null ? dueLabel(days) : "Follow-up scheduled"}
                </p>
                {days !== null && (
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0"
                    style={{ background: `${color}20`, color }}
                  >
                    {days < 0 ? "Overdue" : days <= 3 ? "Urgent" : days <= 7 ? "Soon" : "On Track"}
                  </span>
                )}
              </div>

              {dr.follow_up_weeks && (
                <p className="text-[12px] text-gray-400 mb-2">
                  Your doctor requested a follow-up in{" "}
                  <span className="text-gray-200 font-semibold">
                    {dr.follow_up_weeks} week{dr.follow_up_weeks !== 1 ? "s" : ""}
                  </span>
                </p>
              )}

              {dr.doctor_name && (
                <p className="text-[11px] text-gray-500">
                  Reviewed by{" "}
                  <span className="text-gray-300 font-medium">{dr.doctor_name}</span>
                </p>
              )}

              {dr.diagnosis && (
                <div className="mt-3 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/40 min-w-0">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Last Diagnosis
                  </p>
                  {/* FIX 3: break-words on diagnosis text */}
                  <p className="text-[12px] text-gray-300 leading-relaxed line-clamp-2 break-words">
                    {dr.diagnosis}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div>
              <p className="text-[14px] font-semibold text-gray-200 mb-1">
                Awaiting doctor review
              </p>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Your assessment is currently pending physician review. Once your doctor
                completes the review and sets a follow-up schedule, the countdown will
                appear here.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                Pending review
              </div>
            </div>
          )}
        </div>

        {/* Risk level pill — visible on mobile too (removed hidden sm:block) */}
        {report.risk_level && (
          <div className="shrink-0 flex sm:flex-col items-center sm:items-center gap-2 sm:gap-1">
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
              Risk Level
            </p>
            <span
              className="text-[11px] font-bold px-3 py-1.5 rounded-full"
              style={{
                background: `${dueColor(
                  report.risk_level === "high" ? -1 : report.risk_level === "medium" ? 5 : 14,
                )}20`,
                color: dueColor(
                  report.risk_level === "high" ? -1 : report.risk_level === "medium" ? 5 : 14,
                ),
              }}
            >
              {report.risk_level.charAt(0).toUpperCase() + report.risk_level.slice(1)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

// Submit form 

interface FollowUpFormProps {
  reportId: string;
  onSuccess: () => void;
}

function FollowUpForm({ reportId, onSuccess }: FollowUpFormProps) {
  const [done, setDone]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    glucose: "",
    systolic_bp: "",
    diastolic_bp: "",
    weight: "",
    feeling: "same" as FeelingStatus,
    symptoms: "",
  });

  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    const hasAny = form.glucose || form.systolic_bp || form.weight;
    if (!hasAny) e.glucose = "Enter at least one measurement";
    if (form.glucose && (+form.glucose < 50 || +form.glucose > 600))       e.glucose = "50–600 mg/dL";
    if (form.systolic_bp && (+form.systolic_bp < 70 || +form.systolic_bp > 250)) e.systolic_bp = "70–250 mmHg";
    if (form.diastolic_bp && (+form.diastolic_bp < 40 || +form.diastolic_bp > 150)) e.diastolic_bp = "40–150 mmHg";
    if (form.weight && (+form.weight < 20 || +form.weight > 300))          e.weight = "20–300 kg";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await submitFollowUpApi(reportId, {
        glucose:      form.glucose      ? +form.glucose      : undefined,
        systolic_bp:  form.systolic_bp  ? +form.systolic_bp  : undefined,
        diastolic_bp: form.diastolic_bp ? +form.diastolic_bp : undefined,
        weight:       form.weight       ? +form.weight       : undefined,
        feeling:      form.feeling,
        symptoms:     form.symptoms,
      });
      toast.success("Follow-up submitted! Your doctor has been notified.");
      setDone(true);
      onSuccess();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDone(false);
    setForm({ glucose: "", systolic_bp: "", diastolic_bp: "", weight: "", feeling: "same", symptoms: "" });
    setErrors({});
  };

  if (done) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center py-10 gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ background: "rgba(0,212,168,0.12)", border: "2px solid #00d4a8" }}
          >
            ✅
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-gray-100 mb-1">Follow-Up Submitted!</h2>
            <p className="text-[12px] text-gray-400 max-w-[280px] leading-relaxed">
              Your measurements have been recorded and your doctor has been notified.
            </p>
          </div>
          <Button variant="ghost" onClick={reset}>Submit Another Update</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="min-w-0">
      <CardHeader title="Submit Health Update" subtitle="" />

      <div className="space-y-5 mt-2">

        {/* Blood & Vitals — FIX 4: grid-cols-1 sm:grid-cols-2 throughout */}
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            Blood & Vitals
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Blood Glucose (mg/dL)"
              type="number"
              placeholder="e.g. 110"
              value={form.glucose}
              onChange={set("glucose")}
              error={errors.glucose}
            />
            <Input
              label="Weight (kg)"
              type="number"
              placeholder="e.g. 72"
              value={form.weight}
              onChange={set("weight")}
              error={errors.weight}
            />
          </div>
        </div>

        {/* Blood Pressure */}
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            Blood Pressure
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Systolic BP (mmHg)"
              type="number"
              placeholder="e.g. 125"
              value={form.systolic_bp}
              onChange={set("systolic_bp")}
              error={errors.systolic_bp}
            />
            <Input
              label="Diastolic BP (mmHg)"
              type="number"
              placeholder="e.g. 80"
              value={form.diastolic_bp}
              onChange={set("diastolic_bp")}
              error={errors.diastolic_bp}
            />
          </div>
          {(form.systolic_bp || form.diastolic_bp) && (
            <div className="mt-2 px-3 py-2 rounded-lg bg-gray-800/40 border border-gray-700/30">
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Normal range: Systolic 90–120 mmHg · Diastolic 60–80 mmHg
              </p>
            </div>
          )}
        </div>

        {/* Wellbeing — FIX 5: feeling indicator stacks below select on mobile */}
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            How Are You Feeling?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Overall feeling compared to last visit"
              value={form.feeling}
              onChange={(e) => setForm((f) => ({ ...f, feeling: e.target.value as FeelingStatus }))}
              options={[
                { value: "better", label: "😊 Better than before" },
                { value: "same",   label: "😐 About the same" },
                { value: "worse",  label: "😔 Worse than before" },
              ]}
            />
            {/* Feeling indicator card */}
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3 min-w-0"
              style={{
                background: `${feelingColor(form.feeling)}10`,
                border: `1px solid ${feelingColor(form.feeling)}30`,
              }}
            >
              <span className="text-2xl shrink-0">{feelingIcon(form.feeling)}</span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold truncate" style={{ color: feelingColor(form.feeling) }}>
                  {form.feeling === "better" ? "Great progress!" : form.feeling === "worse" ? "Let your doctor know" : "Staying consistent"}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {form.feeling === "worse" ? "Add details in symptoms below" : "Keep tracking your progress"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label className="form-label">
            Any New or Changed Symptoms?
            <span className="text-gray-600 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            className="form-input resize-y min-h-[80px] w-full"
            placeholder="Describe any changes in how you feel, new pain, discomfort, or anything unusual…"
            value={form.symptoms}
            onChange={set("symptoms")}
          />
        </div>

        {/* Submit — FIX 6: full-width button on mobile */}
        <div className="pt-1">
          <Button variant="primary" loading={loading} onClick={submit} className="w-full sm:w-auto">
            Submit Follow-Up
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Previous follow-ups 

function PreviousFollowUps({ items }: { items: PreviousFollowUp[] }) {
  return (
    <Card className="min-w-0">
      <CardHeader
        title="Previous Follow-Ups"
        subtitle={`${items.length} submission${items.length !== 1 ? "s" : ""} recorded`}
      />
      <div className="space-y-2 mt-2">
        {items.map((item) => {
          const fColor = feelingColor(item.feeling);
          return (
            <div
              key={item.id}
              className="rounded-xl border border-gray-700/30 bg-gray-800/30 px-3 sm:px-4 py-3 min-w-0"
            >
              {/* Header row — FIX 7: flex-wrap so date wraps below on small screens */}
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{feelingIcon(item.feeling)}</span>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: `${fColor}18`, color: fColor }}
                  >
                    {item.feeling.charAt(0).toUpperCase() + item.feeling.slice(1)}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-gray-500 shrink-0">
                  {item.submitted_at ? formatDateTime(item.submitted_at) : "—"}
                </span>
              </div>

              {/* Measurements — flex-wrap already handles overflow */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {item.glucose !== null && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">Glucose</span>
                    <span className="font-mono text-[12px] text-gray-200 font-semibold">
                      {item.glucose}<span className="text-[10px] text-gray-500 ml-0.5">mg/dL</span>
                    </span>
                  </div>
                )}
                {item.systolic_bp !== null && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">BP</span>
                    <span className="font-mono text-[12px] text-gray-200 font-semibold">
                      {item.systolic_bp}{item.diastolic_bp !== null && `/${item.diastolic_bp}`}
                      <span className="text-[10px] text-gray-500 ml-0.5">mmHg</span>
                    </span>
                  </div>
                )}
                {item.weight !== null && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">Weight</span>
                    <span className="font-mono text-[12px] text-gray-200 font-semibold">
                      {item.weight}<span className="text-[10px] text-gray-500 ml-0.5">kg</span>
                    </span>
                  </div>
                )}
                {!item.glucose && !item.systolic_bp && !item.weight && (
                  <span className="text-[11px] text-gray-600">No measurements recorded</span>
                )}
              </div>

              {/* Symptoms — FIX 8: break-words for long unbroken text */}
              {item.symptoms && (
                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed border-t border-gray-700/30 pt-2 break-words">
                  {item.symptoms}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}