// src/pages/doctor/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { getDoctorDashboardApi } from "@/services/doctor.service";
import { getErrorMessage } from "@/services/api";
import { formatFull, formatDateTime } from "@/utils/formatDate";
import {
  getRiskLevel,
  getRiskColor,
  DISEASE_META,
} from "@/components/common/riskUtils";
import Card, { CardHeader } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/common/EmptyState";
import type { DiseaseKey } from "@/types/report";
import type { DoctorDashboardResponse, DoctorCase } from "@/types/doctor";

const KEY_MAP: Record<string, DiseaseKey> = {
  diabetes:       "diabetes",
  hypertension:   "hypertension",
  heart_disease:  "heartDisease",
  heartdisease:   "heartDisease",
  heartDisease:   "heartDisease",
  kidney_disease: "kidneyDisease",
  kidneydisease:  "kidneyDisease",
  kidneyDisease:  "kidneyDisease",
  liver_disease:  "liverDisease",
  liverdisease:   "liverDisease",
  liverDisease:   "liverDisease",
  anemia:         "anemia",
};

function normalisePreds(raw: Record<string, number>): [DiseaseKey, number][] {
  return (Object.entries(raw) as [string, number][])
    .map(([k, v]) => {
      const key = KEY_MAP[k] ?? KEY_MAP[k.toLowerCase()];
      const pct = v <= 1 ? Math.round(v * 100) : Math.round(v);
      return [key, pct] as [DiseaseKey, number];
    })
    .filter(([k]) => k !== undefined)
    .sort((a, b) => b[1] - a[1]);
}

function topRiskScore(c: DoctorCase): number {
  const entries = normalisePreds(c.result?.predictions ?? {});
  return entries[0]?.[1] ?? 0;
}

function caseRiskLevel(c: DoctorCase): "low" | "medium" | "high" | "critical" {
  const lvl = (c.risk_level ?? "").toLowerCase();
  if (lvl === "high" || lvl === "critical") return "high";
  if (lvl === "medium" || lvl === "moderate") return "medium";
  if (lvl === "low") return "low";
  return getRiskLevel(topRiskScore(c));
}

const RISK_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function sortByRisk(cases: DoctorCase[]): DoctorCase[] {
  return [...cases].sort(
    (a, b) => RISK_ORDER[caseRiskLevel(a)] - RISK_ORDER[caseRiskLevel(b)],
  );
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DoctorDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctorDashboardApi()
      .then(setData)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats          = data?.stats;
  const pendingSorted  = sortByRisk(data?.pending_cases ?? []).slice(0, 6);
  const recentReviewed = data?.recent_reviewed ?? [];

  const highCases   = pendingSorted.filter((c) => caseRiskLevel(c) === "high"   || caseRiskLevel(c) === "critical");
  const mediumCases = pendingSorted.filter((c) => caseRiskLevel(c) === "medium");
  const lowCases    = pendingSorted.filter((c) => caseRiskLevel(c) === "low");

  return (
    // FIX 1: w-full min-w-0 on root
    <div className="animate-fade-in space-y-5 sm:space-y-6 w-full min-w-0">

      {/* Header — FIX 2: flex-wrap + remove hidden on pending badge */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="page-title truncate">
            Dr. {user?.name?.replace("Dr. ", "").split(" ")[0]}&apos;s Overview
          </h1>
          <p className="page-sub">{formatFull()}</p>
        </div>
        {(stats?.pending ?? 0) > 0 && (
          // FIX 3: was hidden sm:flex — now always visible on mobile too
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {stats?.pending} case{stats?.pending !== 1 ? "s" : ""} awaiting review
          </div>
        )}
      </div>

      {/* Stat row — grid-cols-2 on mobile, 4 on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pending Review"   value={String(stats?.pending             ?? 0)} icon="⏳" accent="amber" />
        <StatCard label="Reviewed"         value={String(stats?.reviewed            ?? 0)} icon="✅" accent="teal"  />
        <StatCard label="High Risk Cases"  value={String(stats?.high_risk_patients  ?? 0)} icon="🚨" accent="rose"  />
        <StatCard label="Total Cases"      value={String(stats?.total_assessments   ?? 0)} icon="📊" accent="blue"  />
      </div>

      {/* Main 2-col grid — FIX 4: min-w-0 on grid + each card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">

        {/* Pending Cases */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader
            title="Pending Cases"
            subtitle="Sorted by risk level — highest priority first"
            action={
              stats?.pending ? (
                <span className="tag tag-amber shrink-0">{stats.pending} pending</span>
              ) : undefined
            }
          />

          {pendingSorted.length === 0 ? (
            <EmptyState icon="✅" title="All caught up!" description="No pending cases right now." />
          ) : (
            <div className="space-y-4">
              {highCases.length > 0 && (
                <RiskSection color="rose" label="High Risk" count={highCases.length}>
                  {highCases.map((c) => <CaseRow key={c.id} c={c} navigate={navigate} />)}
                </RiskSection>
              )}
              {mediumCases.length > 0 && (
                <RiskSection color="amber" label="Medium Risk" count={mediumCases.length}>
                  {mediumCases.map((c) => <CaseRow key={c.id} c={c} navigate={navigate} />)}
                </RiskSection>
              )}
              {lowCases.length > 0 && (
                <RiskSection color="emerald" label="Low Risk" count={lowCases.length}>
                  {lowCases.map((c) => <CaseRow key={c.id} c={c} navigate={navigate} />)}
                </RiskSection>
              )}
            </div>
          )}

          {pendingSorted.length > 0 && (
            <Button variant="primary" full className="mt-5" onClick={() => navigate("/doctor/review")}>
              Open Review Queue →
            </Button>
          )}
        </Card>

        {/* Recently Reviewed */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader title="Recently Reviewed" subtitle="Last 5 completed assessments" />
          {recentReviewed.length === 0 ? (
            <EmptyState icon="📋" title="No reviews yet" description="Completed reviews will appear here." />
          ) : (
            <div className="space-y-0.5">
              {recentReviewed.map((c) => {
                const level = caseRiskLevel(c);
                const color = getRiskColor(level);
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 py-3 border-b border-gray-800/60 last:border-0 min-w-0"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg,#4da3ff,#00d4a8)" }}
                    >
                      {getInitials(c.patient_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[13px] truncate">{c.patient_name}</p>
                      <p className="text-[11px] text-gray-500 font-mono">
                        {c.doctor_review?.reviewed_at
                          ? formatDateTime(c.doctor_review.reviewed_at)
                          : formatDateTime(c.submitted_at)}
                      </p>
                    </div>
                    <span
                      className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ background: `${color}20`, color }}
                    >
                      {level.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ── Risk section header ───────────────────────────────────────────────────────
function RiskSection({
  color,
  label,
  count,
  children,
}: {
  color: "rose" | "amber" | "emerald";
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  const dotColor  = color === "rose" ? "bg-rose-500"    : color === "amber" ? "bg-amber-400"    : "bg-emerald-400";
  const textColor = color === "rose" ? "text-rose-400"  : color === "amber" ? "text-amber-400"  : "text-emerald-400";
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
        <span className={`text-[10px] font-bold uppercase tracking-widest ${textColor}`}>
          {label} — {count} case{count !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

// ── Case row ──────────────────────────────────────────────────────────────────
function CaseRow({
  c,
  navigate,
}: {
  c: DoctorCase;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const preds      = normalisePreds(c.result?.predictions ?? {});
  const topDisease = preds[0];
  const level      = caseRiskLevel(c);
  const color      = getRiskColor(level);

  return (
    <div
      className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 rounded-xl hover:bg-gray-800/50 transition-colors cursor-pointer group min-w-0"
      onClick={() => navigate("/doctor/review")}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
        style={{ background: "linear-gradient(135deg,#4da3ff,#00d4a8)" }}
      >
        {getInitials(c.patient_name)}
      </div>

      {/* Name + time — FIX 5: min-w-0 so long names truncate instead of pushing risk badge off */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[13px] text-gray-100 truncate">{c.patient_name}</p>
        <p className="text-[11px] text-gray-500 font-mono truncate">{formatDateTime(c.submitted_at)}</p>
      </div>

      {/* Top disease — FIX 6: hidden on mobile (too cramped), visible sm+ */}
      {topDisease && DISEASE_META[topDisease[0]] && (
        <span className="hidden sm:block text-[11px] text-gray-400 truncate max-w-[90px] shrink-0">
          {DISEASE_META[topDisease[0]].icon} {DISEASE_META[topDisease[0]].name}
        </span>
      )}

      {/* Risk badge */}
      <span
        className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full"
        style={{ background: `${color}20`, color }}
      >
        {level.toUpperCase()}
      </span>

      {/* Arrow */}
      <span className="text-gray-600 group-hover:text-gray-400 transition-colors text-sm shrink-0">→</span>
    </div>
  );
}