// src/pages/doctor/FollowUps.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Card, { CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/common/EmptyState";
import { getErrorMessage } from "@/services/api";
import { formatDateTime } from "@/utils/formatDate";
import api from "@/services/api";
import { getInitials, feelingColor, feelingIcon, feelingLabel, riskColor} from "@/utils/followHelpers";
import { FollowUpItem, FollowUpsResponse, FollowUpPatient, FollowUpReport} from "@/types/follow";


// Page 

export default function DoctorFollowUps() {
  const navigate = useNavigate();
  const [data, setData] = useState<FollowUpsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = (p: number) => {
    setLoading(true);
    api
      .get<FollowUpsResponse>("/doctor/followups", {
        params: { page: p, limit: 20 },
      })
      .then((res) => {
        setData(res.data);
        setPage(p);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  const grouped: Record<string, FollowUpItem[]> = {};
  items.forEach((item) => {
    const key = item.patient?.name ?? "Unknown Patient";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const worseCount = items.filter((i) => i.feeling === "worse").length;
  const betterCount = items.filter((i) => i.feeling === "better").length;
  const sameCount = items.filter((i) => i.feeling === "same").length;

  return (

    <div className="animate-fade-in space-y-5 sm:space-y-6 w-full min-w-0">
      {/* Header — FIX 2: flex-wrap, always-visible count */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="page-title">Patient Follow-Ups</h1>
          <p className="page-sub">
            Progress updates submitted by your patients after clinical review
          </p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
            {total} submission{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <EmptyState
            icon="🔄"
            title="No follow-ups yet"
            description="Follow-up submissions from your patients will appear here once they start tracking their progress."
          />
        </Card>
      ) : (
        <>
          {/* ── Summary stat strip*/}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              {
                label: "Better",
                count: betterCount,
                color: "#00d4a8",
                icon: "😊",
              },
              { label: "Same", count: sameCount, color: "#ffbe3d", icon: "😐" },
              {
                label: "Worse",
                count: worseCount,
                color: "#ff5f7e",
                icon: "😔",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3 min-w-0"
                style={{
                  background: `${stat.color}08`,
                  borderColor: `${stat.color}25`,
                }}
              >
                {/* Icon */}
                <span className=" xs:block text-xl sm:text-2xl shrink-0">
                  {stat.icon}
                </span>
                <div className="min-w-0">
                  <p
                    className="text-xl sm:text-2xl font-black leading-none tabular-nums"
                    style={{ color: stat.color }}
                  >
                    {stat.count}
                  </p>
                  {/* Label */}
                  <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 truncate">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/*  Follow-up list grouped by patient  */}
          <div className="space-y-4">
            {Object.entries(grouped).map(([patientName, patientItems]) => (
              <Card key={patientName} className="min-w-0 overflow-hidden">
                {/* Patient header — FIX 5: stack on mobile, row on sm+ */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between mb-4">
                  {/* Left: avatar + name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                      style={{
                        background: "linear-gradient(135deg,#4da3ff,#00d4a8)",
                      }}
                    >
                      {getInitials(patientName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-gray-100 truncate">
                        {patientName}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {patientItems.length} follow-up
                        {patientItems.length !== 1 ? "s" : ""} submitted
                      </p>
                    </div>
                  </div>

                  {/* Right: risk badge + status + CTA */}
                  {patientItems[0]?.report && (
             
                    <div className="flex items-center flex-wrap gap-2">
                      {patientItems[0].report.risk_level && (
                        <span
                          className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
                          style={{
                            background: `${riskColor(patientItems[0].report.risk_level)}18`,
                            color: riskColor(patientItems[0].report.risk_level),
                          }}
                        >
                          {patientItems[0].report.risk_level.toUpperCase()} RISK
                        </span>
                      )}
                      {patientItems[0].reviewed_by ? (
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-teal-500/12 text-teal-400 shrink-0">
                          ✓ Reviewed
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-500/12 text-amber-400 flex items-center gap-1 shrink-0">
                          <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse inline-block" />
                          Pending
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate("/doctor/review", {
                            state: { report_id: patientItems[0].report!.id },
                          })
                        }
                        className="shrink-0"
                      >
                        View Case →
                      </Button>
                    </div>
                  )}
                </div>

                {/* Follow-up entries */}
                <div className="space-y-2">
                  {patientItems.map((item, idx) => {
                    const fColor = feelingColor(item.feeling);
                    const isLatest = idx === 0;

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border px-3 sm:px-4 py-3 min-w-0"
                        style={{
                          background: isLatest
                            ? `${fColor}07`
                            : "rgba(255,255,255,0.02)",
                          borderColor: isLatest
                            ? `${fColor}25`
                            : "rgba(255,255,255,0.06)",
                        }}
                      >
                        {/* Feeling and Date */}
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base">
                              {feelingIcon(item.feeling)}
                            </span>
                            <span
                              className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                              style={{
                                background: `${fColor}18`,
                                color: fColor,
                              }}
                            >
                              {feelingLabel(item.feeling)}
                            </span>
                            {isLatest && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-700 text-gray-400 uppercase tracking-wide shrink-0">
                                Latest
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] text-gray-500 shrink-0">
                            {item.submitted_at
                              ? formatDateTime(item.submitted_at)
                              : "—"}
                          </span>
                        </div>

                        {/* Measurements */}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
                          {item.glucose !== null && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">
                                Glucose
                              </span>
                              <span className="font-mono text-[13px] text-gray-200 font-bold">
                                {item.glucose}
                                <span className="text-[10px] text-gray-500 font-normal ml-0.5">
                                  mg/dL
                                </span>
                              </span>
                            </div>
                          )}
                          {item.systolic_bp !== null && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">
                                BP
                              </span>
                              <span className="font-mono text-[13px] text-gray-200 font-bold">
                                {item.systolic_bp}
                                {item.diastolic_bp !== null &&
                                  `/${item.diastolic_bp}`}
                                <span className="text-[10px] text-gray-500 font-normal ml-0.5">
                                  mmHg
                                </span>
                              </span>
                            </div>
                          )}
                          {item.weight !== null && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">
                                Weight
                              </span>
                              <span className="font-mono text-[13px] text-gray-200 font-bold">
                                {item.weight}
                                <span className="text-[10px] text-gray-500 font-normal ml-0.5">
                                  kg
                                </span>
                              </span>
                            </div>
                          )}
                          {item.glucose === null &&
                            item.systolic_bp === null &&
                            item.weight === null && (
                              <span className="text-[11px] text-gray-600 italic">
                                No measurements recorded
                              </span>
                            )}
                        </div>

                        {/* Symptoms */}
                        {item.symptoms && item.symptoms.trim() && (
                          <div className="mt-2 pt-2 border-t border-gray-700/40">
                            <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Reported Symptoms
                            </p>
                            <p className="text-[12px] text-gray-300 leading-relaxed break-words">
                              {item.symptoms}
                            </p>
                          </div>
                        )}

                        {/* Worse alert */}
                        {item.feeling === "worse" && (
                          <div className="mt-2 pt-2 border-t border-rose-500/20 flex items-start gap-2">
                            <span className="text-rose-400 text-sm shrink-0 mt-0.5">
                              ⚠
                            </span>
                            <p className="text-[11px] text-rose-400 font-semibold leading-relaxed">
                              Patient reported worsening condition — consider
                              follow-up action
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between sm:justify-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => load(page - 1)}
                disabled={page <= 1}
              >
                ← Previous
              </Button>
              <span className="text-[12px] text-gray-500 font-mono">
                {page} / {pages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => load(page + 1)}
                disabled={page >= pages}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
