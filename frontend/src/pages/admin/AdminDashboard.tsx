import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Card, { CardHeader } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/common/EmptyState";
import { getErrorMessage } from "@/services/api";
import { formatDateTime } from "@/utils/formatDate";
import RegisterDoctorForm from "@/components/ui/RegisterDoctorForm";
import { adminApi } from "@/services/admin.service";
import { riskColor, getInitials } from "@/utils/adminHelpers";
import type { AdminStats, Doctor, Patient, Tab } from "@/types/admin";
import ConfirmModal from "@/components/common/ConfirmModel";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [docSearch, setDocSearch] = useState("");
  const [patSearch, setPatSearch] = useState("");
  const [docPage, setDocPage] = useState(1);
  const [patPage, setPatPage] = useState(1);
  const [docPages, setDocPages] = useState(1);
  const [patPages, setPatPages] = useState(1);
  const [showForm, setShowForm] = useState(false);

  // Modal state
  const [modal, setModal] = useState<{
    open: boolean;
    doctorId: string;
    name: string;
    action: "deactivate" | "activate";
  }>({ open: false, doctorId: "", name: "", action: "deactivate" });
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    adminApi
      .getStats()
      .then(setStats)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "doctors") loadDoctors(docPage, docSearch);
    if (activeTab === "patients") loadPatients(patPage, patSearch);
  }, [activeTab]);

  const loadDoctors = (p: number, search: string) => {
    adminApi
      .getDoctors(p, search)
      .then(({ doctors, pages }) => {
        setDoctors(doctors);
        setDocPage(p);
        setDocPages(pages);
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  };

  const loadPatients = (p: number, search: string) => {
    adminApi
      .getPatients(p, search)
      .then(({ patients, pages }) => {
        setPatients(patients);
        setPatPage(p);
        setPatPages(pages);
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  };

  const openModal = (doc: Doctor, action: "deactivate" | "activate") => {
    setModal({ open: true, doctorId: doc.id, name: doc.name, action });
  };

  const handleModalConfirm = async () => {
    setModalLoading(true);
    try {
      if (modal.action === "deactivate") {
        await adminApi.deactivateDoctor(modal.doctorId);
        toast.success(`${modal.name} deactivated.`);
      } else {
        await adminApi.activateDoctor(modal.doctorId);
        toast.success(`${modal.name} reactivated.`);
      }
      setModal((m) => ({ ...m, open: false }));
      loadDoctors(docPage, docSearch);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5 sm:space-y-6 w-full min-w-0">
      {/* Header */}
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-sub">Platform management and oversight</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-none">
        {(
          [
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "doctors", label: "Doctors", icon: "🩺" },
            { id: "patients", label: "Patients", icon: "🧑" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150"
            style={{
              background:
                activeTab === t.id
                  ? "rgba(77,163,255,0.15)"
                  : "rgba(255,255,255,0.04)",
              border:
                activeTab === t.id
                  ? "1px solid rgba(77,163,255,0.35)"
                  : "1px solid rgba(255,255,255,0.08)",
              color: activeTab === t.id ? "#4da3ff" : "#9ca3af",
            }}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === "overview" && stats && (
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
              Users
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="Total Users"
                value={String(stats.total_users)}
                icon="👥"
                accent="blue"
                note={`${stats.new_patients_this_month + stats.new_doctors_this_month} new this month`}
              />
              <StatCard
                label="Patients"
                value={String(stats.patient_count)}
                icon="🧑"
                accent="teal"
                note={`${stats.new_patients_this_month} joined this month`}
              />
              <StatCard
                label="Doctors"
                value={String(stats.doctor_count)}
                icon="🩺"
                accent="rose"
                note={`${stats.new_doctors_this_month} joined this month`}
              />
              <StatCard
                label="Admins"
                value={String(stats.admin_count)}
                icon="🔑"
                accent="amber"
                note="System administrators"
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
              Assessments
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="Total"
                value={String(stats.total_assessments)}
                icon="📋"
                accent="blue"
              />
              <StatCard
                label="Pending"
                value={String(stats.pending_assessments)}
                icon="⏳"
                accent="amber"
              />
              <StatCard
                label="Reviewed"
                value={String(stats.reviewed_assessments)}
                icon="✅"
                accent="teal"
              />
              <StatCard
                label="High Risk"
                value={String(stats.high_risk_count)}
                icon="🚨"
                accent="rose"
              />
            </div>
          </div>
          <Card>
            <CardHeader title="Quick Actions" subtitle="Common admin tasks" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <button
                onClick={() => {
                  setActiveTab("doctors");
                  setShowForm(true);
                }}
                className="flex items-center gap-3 p-4 rounded-xl border border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/10 transition-colors text-left"
              >
                <span className="text-2xl">🩺</span>
                <div>
                  <p className="text-[13px] font-semibold text-gray-100">
                    Register New Doctor
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Add a doctor to the platform
                  </p>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("patients")}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-700/40 bg-gray-800/30 hover:bg-gray-800/50 transition-colors text-left"
              >
                <span className="text-2xl">👥</span>
                <div>
                  <p className="text-[13px] font-semibold text-gray-100">
                    View All Patients
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Browse registered patients
                  </p>
                </div>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ── DOCTORS ── */}
      {activeTab === "doctors" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-0 max-w-xs">
              <input
                type="search"
                placeholder="Search doctors…"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && loadDoctors(1, docSearch)
                }
                className="w-full text-[13px] bg-gray-800 border border-gray-700 text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-500"
              />
            </div>
            <Button
              variant="primary"
              onClick={() => setShowForm((v) => !v)}
              className="shrink-0"
            >
              {showForm ? "✕ Cancel" : "＋ Register Doctor"}
            </Button>
          </div>

          {showForm && (
            <RegisterDoctorForm
              onSuccess={() => {
                setShowForm(false);
                loadDoctors(1, docSearch);
              }}
            />
          )}

          <Card className="min-w-0 overflow-hidden">
            <CardHeader
              title="Registered Doctors"
              subtitle={`${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} on the platform`}
            />
            {doctors.length === 0 ? (
              <EmptyState
                icon="🩺"
                title="No doctors yet"
                description="Register the first doctor using the button above."
              />
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto mt-3 rounded-xl border border-gray-800">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-800/70">
                        {[
                          "Doctor",
                          "Speciality",
                          "License",
                          "Reviews",
                          "Joined",
                          "Status",
                          "Action",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2.5 text-left text-[9px] font-bold font-mono uppercase tracking-widest text-gray-500 border-b border-gray-700/60 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doc) => (
                        <tr
                          key={doc.id}
                          className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                style={{
                                  background:
                                    "linear-gradient(135deg,#4da3ff,#00d4a8)",
                                }}
                              >
                                {getInitials(doc.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-[12px] text-gray-200 truncate">
                                  {doc.name}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate">
                                  {doc.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-[12px] text-gray-300">
                            {doc.speciality ?? "—"}
                          </td>
                          <td className="px-3 py-3 font-mono text-[11px] text-gray-400">
                            {doc.license_number ?? "—"}
                          </td>
                          <td className="px-3 py-3 font-mono text-[12px] text-gray-300">
                            {doc.total_reviews}
                          </td>
                          <td className="px-3 py-3 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                            {doc.created_at
                              ? formatDateTime(doc.created_at)
                              : "—"}
                          </td>
                          <td className="px-3 py-3">
                            {doc.is_active ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400">
                                Active
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {doc.is_active ? (
                              <button
                                onClick={() => openModal(doc, "deactivate")}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 transition-colors"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => openModal(doc, "activate")}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-teal-400 border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/15 transition-colors"
                              >
                                Activate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden mt-3 space-y-2">
                  {doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-xl border border-gray-800 bg-gray-800/20 px-4 py-3 min-w-0"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                            style={{
                              background:
                                "linear-gradient(135deg,#4da3ff,#00d4a8)",
                            }}
                          >
                            {getInitials(doc.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[13px] text-gray-100 truncate">
                              {doc.name}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {doc.email}
                            </p>
                          </div>
                        </div>
                        {doc.is_active ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 shrink-0">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 shrink-0">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-wide">
                            Speciality
                          </p>
                          <p className="text-[12px] text-gray-300">
                            {doc.speciality ?? "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-wide">
                            License
                          </p>
                          <p className="text-[12px] font-mono text-gray-300">
                            {doc.license_number ?? "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-wide">
                            Reviews
                          </p>
                          <p className="text-[12px] font-mono text-gray-300">
                            {doc.total_reviews}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-wide">
                            Joined
                          </p>
                          <p className="text-[11px] font-mono text-gray-400">
                            {doc.created_at
                              ? formatDateTime(doc.created_at)
                              : "—"}
                          </p>
                        </div>
                      </div>
                      {doc.is_active ? (
                        <button
                          onClick={() => openModal(doc, "deactivate")}
                          className="w-full mt-1 py-1.5 rounded-lg text-[12px] font-semibold text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 transition-colors"
                        >
                          Deactivate Doctor
                        </button>
                      ) : (
                        <button
                          onClick={() => openModal(doc, "activate")}
                          className="w-full mt-1 py-1.5 rounded-lg text-[12px] font-semibold text-teal-400 border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/15 transition-colors"
                        >
                          Activate Doctor
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            {docPages > 1 && (
              <div className="flex items-center justify-between sm:justify-center gap-3 mt-4 pt-4 border-t border-gray-800">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={docPage <= 1}
                  onClick={() => loadDoctors(docPage - 1, docSearch)}
                >
                  ← Prev
                </Button>
                <span className="text-[12px] text-gray-500 font-mono">
                  {docPage} / {docPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={docPage >= docPages}
                  onClick={() => loadDoctors(docPage + 1, docSearch)}
                >
                  Next →
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── PATIENTS ── */}
      {activeTab === "patients" && (
        <div className="space-y-4">
          <div className="flex-1 min-w-0 max-w-xs">
            <input
              type="search"
              placeholder="Search patients…"
              value={patSearch}
              onChange={(e) => setPatSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadPatients(1, patSearch)}
              className="w-full text-[13px] bg-gray-800 border border-gray-700 text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-500"
            />
          </div>
          <Card className="min-w-0 overflow-hidden">
            <CardHeader
              title="Registered Patients"
              subtitle={`${patients.length} patient${patients.length !== 1 ? "s" : ""} on the platform`}
            />
            {patients.length === 0 ? (
              <EmptyState
                icon="🧑"
                title="No patients yet"
                description="Patients will appear here once they register."
              />
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto mt-3 rounded-xl border border-gray-800">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-800/70">
                        {[
                          "Patient",
                          "Assessments",
                          "Latest Risk",
                          "Joined",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2.5 text-left text-[9px] font-bold font-mono uppercase tracking-widest text-gray-500 border-b border-gray-700/60 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((pat) => {
                        const rc = riskColor(pat.latest_risk);
                        return (
                          <tr
                            key={pat.id}
                            className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors"
                          >
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                  style={{
                                    background:
                                      "linear-gradient(135deg,#a78bfa,#00d4a8)",
                                  }}
                                >
                                  {getInitials(pat.name)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-[12px] text-gray-200 truncate">
                                    {pat.name}
                                  </p>
                                  <p className="text-[10px] text-gray-500 truncate">
                                    {pat.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 font-mono text-[12px] text-gray-300">
                              {pat.total_assessments}
                            </td>
                            <td className="px-3 py-3">
                              {pat.latest_risk ? (
                                <span
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: `${rc}20`, color: rc }}
                                >
                                  {pat.latest_risk.charAt(0).toUpperCase() +
                                    pat.latest_risk.slice(1)}
                                </span>
                              ) : (
                                <span className="text-gray-600 text-[12px]">
                                  No assessments
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                              {pat.created_at
                                ? formatDateTime(pat.created_at)
                                : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden mt-3 space-y-2">
                  {patients.map((pat) => {
                    const rc = riskColor(pat.latest_risk);
                    return (
                      <div
                        key={pat.id}
                        className="rounded-xl border border-gray-800 bg-gray-800/20 px-4 py-3 min-w-0"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                              style={{
                                background:
                                  "linear-gradient(135deg,#a78bfa,#00d4a8)",
                              }}
                            >
                              {getInitials(pat.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[13px] text-gray-100 truncate">
                                {pat.name}
                              </p>
                              <p className="text-[11px] text-gray-500 truncate">
                                {pat.email}
                              </p>
                            </div>
                          </div>
                          {pat.latest_risk && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                              style={{ background: `${rc}20`, color: rc }}
                            >
                              {pat.latest_risk.charAt(0).toUpperCase() +
                                pat.latest_risk.slice(1)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span>
                            {pat.total_assessments} assessment
                            {pat.total_assessments !== 1 ? "s" : ""}
                          </span>
                          <span className="font-mono">
                            {pat.created_at
                              ? formatDateTime(pat.created_at)
                              : "—"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {patPages > 1 && (
              <div className="flex items-center justify-between sm:justify-center gap-3 mt-4 pt-4 border-t border-gray-800">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={patPage <= 1}
                  onClick={() => loadPatients(patPage - 1, patSearch)}
                >
                  ← Prev
                </Button>
                <span className="text-[12px] text-gray-500 font-mono">
                  {patPage} / {patPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={patPage >= patPages}
                  onClick={() => loadPatients(patPage + 1, patSearch)}
                >
                  Next →
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
      <ConfirmModal
        open={modal.open}
        loading={modalLoading}
        title={
          modal.action === "deactivate"
            ? "Deactivate Doctor"
            : "Reactivate Doctor"
        }
        message={
          modal.action === "deactivate"
            ? `Dr. ${modal.name} will be locked out of the platform immediately. You can reactivate them at any time.`
            : `Dr. ${modal.name} will regain full access to the platform.`
        }
        confirmLabel={modal.action === "deactivate" ? "Deactivate" : "Activate"}
        variant={modal.action === "deactivate" ? "danger" : "primary"}
        onConfirm={handleModalConfirm}
        onCancel={() =>
          !modalLoading && setModal((m) => ({ ...m, open: false }))
        }
      />
    </div>
  );
}
