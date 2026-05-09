// src/pages/patient/HealthInput.tsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Disclaimer from "@/components/ui/Disclaimer";

import {
  submitAssessmentApi,
} from "@/services/patient.service";
import { getErrorMessage } from "@/services/api";

import type { Assessment, HealthParams } from "@/types/report";
import Spinner from "@/components/ui/Spinner";

// ── Default values ───────────────────────────────
const DEFAULT_PARAMS: HealthParams = {
  age: 45,
  gender: "male",
  weight: 72,
  height: 170,

  glucose: 118,
  resting_bp: 130,
  cholesterol: 215,

  hemoglobin: 13.2,
  creatinine: 1.1,
  wbc_count: 7500,
  platelet_count: 225000,

  smoking_status: "never",
  alcohol_consumption: "none",
  physical_activity: "moderate",
  family_history: "none",
  symptoms: "",

  chest_pain_type: "ASY",
  resting_ecg: "Normal",
  st_slope: "Flat",
  exercise_angina: "N",
  fasting_bs: 50,
  max_hr: 150,
  oldpeak: 0,
};

export default function HealthInput() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(false);
  }, []);

  const latest = assessments[0] ?? null;

  const handleNewAssessment = async (params: HealthParams) => {
    setAnalyzing(true);
    try {
      const bmi = +(params.weight / Math.pow(params.height / 100, 2)).toFixed(
        2,
      );
      const payload = { ...params, bmi };
      const assessment = await submitAssessmentApi(payload);
      setAssessments((prev) => [assessment, ...prev]);
      navigate("/patient/predictions", {
        state: { assessment, formSubmission: true, runAI: true },
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAnalyzing(false);
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
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-title">Health Parameter Input</h1>
        <p className="page-sub">
          Submit accurate data for best prediction accuracy
        </p>
      </div>
      <HealthInputTab onSubmit={handleNewAssessment} initial={latest?.params} />
    </div>
  );
}

// ── Step Wizard ───────────────────────────────────────────────────────────────
const STEPS_LABELS = [
  { label: "Personal", icon: "👤" },
  { label: "Lifestyle", icon: "🏃" },
  { label: "Heart", icon: "🫀" },
  { label: "Vitals", icon: "💉" },
  { label: "Labs", icon: "🔬" },
  { label: "Symptoms", icon: "📋" },
  { label: "Review", icon: "✅" },
];

function StepWizardPro({ currentStep }: { currentStep: number }) {
  return (
    <div className="relative flex items-center justify-between mb-8 px-0">
      {/* connecting line */}
      <div className="absolute top-[18px] left-2 right-2 h-px bg-gray-800 z-0" />
      <div
        className="absolute top-[18px] left-1 right-1 h-px bg-brand-500 z-0 transition-all duration-500"
        style={{ width: `${(currentStep / (STEPS_LABELS.length - 1)) * 100}%` }}
      />

      {/* step indicators */}
      {STEPS_LABELS.map((s, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div
            key={s.label}
            className="relative z-10 flex flex-col items-center gap-0"
          >
            <div
              className={`
                w-9 h-9 rounded-full flex items-center justify-center text-[13px]
                border-2 transition-all duration-300
                ${
                  done
                    ? "bg-brand-500 border-brand-500 text-white"
                    : active
                      ? "bg-gray-900 border-brand-500 text-brand-400 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                      : "bg-gray-900 border-gray-700 text-gray-600"
                }
              `}
            >
              {done ? (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M2 6.5L5.5 10L11 3"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span>{s.icon}</span>
              )}
            </div>
            <span
              className={`text-[9px] font-mono font-semibold uppercase tracking-widest whitespace-nowrap transition-colors duration-300
                ${active ? "text-brand-400" : done ? "text-gray-400" : "text-gray-600"}
              `}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-800">
      <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-[16px]">
        {icon}
      </div>
      <div>
        <h2 className="text-[14px] font-bold text-gray-100">{title}</h2>
        <p className="text-[11px] text-gray-500 font-mono">{subtitle}</p>
      </div>
    </div>
  );
}

// ── Field Group ───────────────────────────────────────────────────────────────
function FieldGrid({
  children,
  cols = 2,
}: {
  children: React.ReactNode;
  cols?: number;
}) {
  return (
    <div className={`grid gap-4 ${cols === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
      {children}
    </div>
  );
}

// ── Enhanced Select with visible dropdown arrow ───────────────────────────────
function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="form-label">{label}</label>
      <div className="relative">
        <select
          className="form-input appearance-none pr-9 cursor-pointer"
          value={value}
          onChange={onChange}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {/* custom dropdown arrow — always right-aligned */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            width="12"
            height="7"
            viewBox="0 0 12 7"
            fill="none"
            className="text-gray-400"
          >
            <path
              d="M1 1L6 6L11 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}

// ── BMI Capsule ───────────────────────────────────────────────────────────────
function BmiCapsule({ bmi }: { bmi: number }) {
  const { color, label } =
    bmi < 18.5
      ? { color: "#60a5fa", label: "Underweight" }
      : bmi < 25
        ? { color: "#34d399", label: "Normal" }
        : bmi < 30
          ? { color: "#fbbf24", label: "Overweight" }
          : { color: "#f87171", label: "Obese" };

  return (
    <div className="col-span-2 flex items-center gap-0">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-800/80 border border-gray-700 text-sm">
        <span className="text-gray-500 text-[11px] font-mono">BMI</span>
        <span className="font-mono font-bold text-[13px]" style={{ color }}>
          {bmi}
        </span>
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${color}18`,
            color,
            border: `1px solid ${color}40`,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// ── Review Section Card ───────────────────────────────────────────────────────
function ReviewCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: [string, string][];
}) {
  return (
    <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[13px]">{icon}</span>
        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-semibold">
          {title}
        </p>
      </div>
      <div className="space-y-2">
        {items.map(([k, v]) => (
          <div key={k} className="flex justify-between items-center">
            <span className="text-[11px] text-gray-500">{k}</span>
            <span className="font-mono text-[11px] font-semibold text-gray-200 bg-gray-800 px-2 py-0.5 rounded">
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Health Input Tab ──────────────────────────────────────────────────────────
function HealthInputTab({
  onSubmit,
  initial,
}: {
  onSubmit: (p: HealthParams) => void;
  initial?: HealthParams;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<HealthParams>(initial ?? DEFAULT_PARAMS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bmi = +(form.weight / Math.pow(form.height / 100, 2)).toFixed(1);

  const set =
    (k: keyof HealthParams) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((f) => ({
        ...f,
        [k]: e.target.type === "number" ? +e.target.value : e.target.value,
      }));

  const validate = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.age || form.age < 1 || form.age > 120) e.age = "1–120 years";
      if (!form.weight || form.weight < 20 || form.weight > 300)
        e.weight = "20-300 kg";
      if (!form.height || form.height < 50 || form.height > 250)
        e.height = "50-250 cm";
    }
    if (s === 1) {
      if (!form.smoking_status) e.smoking_status = "Please select an option";
      if (!form.alcohol_consumption)        e.alcohol_consumption = "Please select an option";
      if (!form.physical_activity)        e.physical_activity = "Please select an option";
      if (!form.family_history)        e.family_history = "Please select an option";
    }
    if (s === 2) {
      if (!form.chest_pain_type) e.chest_pain_type = "Please select an option";
      if (!form.resting_ecg) e.resting_ecg = "Please select an option";
      if (!form.st_slope) e.st_slope = "Please select an option";
      if (!form.exercise_angina) e.exercise_angina = "Please select an option";
      if (form.fasting_bs < 50 || form.fasting_bs > 100) e.fasting_bs = "Should be in range 50-100 mg/dL";
      if (form.max_hr < 0 || form.max_hr > 220) e.max_hr = "Should be in range 0-220 bpm";
      if (form.oldpeak < 0 || form.oldpeak > 6) e.oldpeak = "Should be in range 0-6";
    }

    if (s === 3) {
      if (!form.glucose || form.glucose < 50 || form.glucose > 500)
        e.glucose = "Should be in range 50-500 mg/dL";
      if (!form.cholesterol || form.cholesterol < 100 || form.cholesterol > 600)
        e.cholesterol = "Should be in range 100-600 mg/dL";
    }
    if (s === 4) {
      if (!form.hemoglobin || form.hemoglobin < 5 || form.hemoglobin > 25)
        e.hemoglobin = "Should be in range 5-25 g/dL";
      if (!form.creatinine || form.creatinine < 0.3 || form.creatinine > 15)
        e.creatinine = "Should be in range 0.3-15 mg/dL";
      if (!form.wbc_count || form.wbc_count < 1000 || form.wbc_count > 30000)
        e.wbc_count = "Should be in range 1,000-30,000";
      if (
        !form.platelet_count ||
        form.platelet_count < 10000 ||
        form.platelet_count > 800000
      )
        e.platelet_count = "Should be in range 10,000-800,000 cells/μL";
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  // ── Select option groups ──────────────────────────────────────────────────
  const GENDER_OPTS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];
  const SMOKING_OPTS = [
    { value: "never", label: "Non-smoker" },
    { value: "former", label: "Former smoker" },
    { value: "current", label: "Current smoker" },
  ];
  const ALCOHOL_OPTS = [
    { value: "none", label: "None" },
    { value: "occasional", label: "Occasional" },
    { value: "moderate", label: "Moderate" },
    { value: "high", label: "Frequent" },
  ];
  const EXERCISE_OPTS = [
    { value: "none", label: "No regular exercise" },
    { value: "light", label: "Light (1-2 times/week)" },
    { value: "moderate", label: "Moderate (3-4 times/week)" },
    { value: "high", label: "High (5+ times/week)" },
  ];
  const FAMILY_OPTS = [
    { value: "none", label: "No known conditions" },
    { value: "diabetes", label: "Diabetes" },
    { value: "heart_disease", label: "Heart Disease" },
    { value: "both", label: "Both" },
  ];
  const CHEST_PAIN_OPTS = [
    { value: "TA", label: "Chest pain during activity" },
    { value: "ATA", label: "Unusual chest discomfort" },
    { value: "NAP", label: "Mild / non-heart related pain" },
    { value: "ASY", label: "No chest pain" },
  ];
  const ECG_OPTS = [
    { value: "Normal", label: "Normal" },
    { value: "ST", label: "Minor irregularity" },
    { value: "LVH", label: "Possible heart strain" },
  ];
  const ST_SLOPE_OPTS = [
    { value: "Up", label: "Good recovery" },
    { value: "Flat", label: "Slow recovery" },
    { value: "Down", label: "Poor recovery" },
  ];
  const ANGINA_OPTS = [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" },
  ];

  // ── Step panels ───────────────────────────────────────────────────────────
  const panels = [
    // Step 0 — Personal
    <div key="personal" className="animate-fade-in space-y-4">
      <SectionHeader
        icon="👤"
        title="Personal Information"
        subtitle="Basic demographic and body measurements"
      />
      <FieldGrid>
        <Input
          label="Age (years)"
          type="number"
          value={String(form.age)}
          onChange={set("age")}
          error={errors.age}
          hint="Valid range: 1–120"
        />
        <SelectField
          label="Gender"
          options={GENDER_OPTS}
          value={form.gender}
          onChange={set("gender")}
        />
        <Input
          label="Weight (kg)"
          type="number"
          value={String(form.weight)}
          onChange={set("weight")}
          error={errors.weight}
          hint="20–300 kg"
        />
        <Input
          label="Height (cm)"
          type="number"
          value={String(form.height)}
          onChange={set("height")}
          error={errors.height}
          hint="100–250 cm"
        />
        {form.weight > 0 && form.height > 0 && <BmiCapsule bmi={bmi} />}
      </FieldGrid>
    </div>,

    // Step 1 — Lifestyle
    <div key="lifestyle" className="animate-fade-in space-y-4">
      <SectionHeader
        icon="🏃"
        title="Lifestyle Factors"
        subtitle="Habits that influence your cardiovascular health"
      />
      <FieldGrid>
        <SelectField
          label="Smoking Status"
          options={SMOKING_OPTS}
          value={form.smoking_status}
          onChange={set("smoking_status")}
        />
        <SelectField
          label="Alcohol Consumption"
          options={ALCOHOL_OPTS}
          value={form.alcohol_consumption}
          onChange={set("alcohol_consumption")}

        />
        <SelectField
          label="Physical Activity"
          options={EXERCISE_OPTS}
          value={form.physical_activity}
          onChange={set("physical_activity")}
        />
        <SelectField
          label="Family Medical History"
          options={FAMILY_OPTS}
          value={form.family_history}
          onChange={set("family_history")}
        />
      </FieldGrid>
    </div>,

    // Step 2 — Heart-specific
    <div key="heart" className="animate-fade-in space-y-4">
      <SectionHeader
        icon="🫀"
        title="Cardiac Indicators"
        subtitle="Heart-specific measurements and clinical observations"
      />
      <FieldGrid>
        <SelectField
          label="Chest Pain Type"
          options={CHEST_PAIN_OPTS}
          value={form.chest_pain_type}
          onChange={set("chest_pain_type")}
        />
        <SelectField
          label="Heart Rhythm (Resting ECG)"
          options={ECG_OPTS}
          value={form.resting_ecg}
          onChange={set("resting_ecg")}
        />
        <SelectField
          label="Recovery After Exercise"
          options={ST_SLOPE_OPTS}
          value={form.st_slope}
          onChange={set("st_slope")}
        />
        <SelectField
          label="Chest Pain During Exercise ?"
          options={ANGINA_OPTS}
          value={form.exercise_angina}
          onChange={set("exercise_angina")}
        />
        <Input
          label="Fasting Blood Sugar"
          type="number"
          value={String(form.fasting_bs)}
          onChange={set("fasting_bs")}
          error={errors.fasting_bs}
          hint="Normal: < 100 mg/dL"
        />
        <Input
          label="Max Heart Rate"
          type="number"
          value={String(form.max_hr)}
          onChange={set("max_hr")}
          error={errors.max_hr}
          hint="Typical max: 220 - age bpm"
        />
        <div className="col-span-2">
          <Input
            label="Stress During Exercise"
            type="number"
            step="0.1"
            value={String(form.oldpeak)}
            onChange={set("oldpeak")}
            error={errors.oldpeak}
            hint="Higher values indicate more stress"
          />
        </div>
      </FieldGrid>
    </div>,

    // Step 3 — Vitals
    <div key="vitals" className="animate-fade-in space-y-4">
      <SectionHeader
        icon="💉"
        title="Vital Signs"
        subtitle="Core clinical measurements from recent tests"
      />
      <FieldGrid>
        <Input
          label="Glucose Level"
          type="number"
          value={String(form.glucose)}
          onChange={set("glucose")}
          error={errors.glucose}
          hint="Normal fasting: < 100 mg/dL"
        />
        <Input
          label="Cholesterol"
          type="number"
          value={String(form.cholesterol)}
          onChange={set("cholesterol")}
          error={errors.cholesterol}
          hint="Desirable: < 200 mg/dL"
        />
        <div className="col-span-2">
          <Input
            label="Resting Blood Pressure"
            type="number"
            value={String(form.resting_bp)}
            onChange={set("resting_bp")}
            error={errors.resting_bp}
            hint="Normal systolic: 90–120 mmHg"
          />
        </div>
      </FieldGrid>
    </div>,

    // Step 4 — Labs
    <div key="labs" className="animate-fade-in space-y-4">
      <SectionHeader
        icon="🔬"
        title="Laboratory Results"
        subtitle="Blood panel values from your most recent CBC"
      />
      <FieldGrid>
        <Input
          label="Hemoglobin"
          type="number"
          step="0.1"
          value={String(form.hemoglobin)}
          onChange={set("hemoglobin")}
          error={errors.hemoglobin}
          hint="Male: 13.5–17.5 g/dL | Female: 12–15.5 g/dL"
        />
        <Input
          label="Creatinine"
          type="number"
          step="0.1"
          value={String(form.creatinine)}
          onChange={set("creatinine")}
          error={errors.creatinine}
          hint="Normal: 0.7–1.2 mg/dL"
        />
        <Input
          label="WBC Count"
          type="number"
          value={String(form.wbc_count)}
          onChange={set("wbc_count")}
          error={errors.wbc_count}
          hint="Normal: 4,500–11,000 cells/μL"
        />
        <Input
          label="Platelet Count"
          type="number"
          value={String(form.platelet_count)}
          onChange={set("platelet_count")}
          error={errors.platelet_count}
          hint="Normal: 150,000–400,000 cells/μL"
        />
      </FieldGrid>
    </div>,

    // Step 5 — Symptoms
    <div key="symptoms" className="animate-fade-in space-y-4">
      <SectionHeader
        icon="📋"
        title="Current Symptoms"
        subtitle="Describe any symptoms you are currently experiencing"
      />
      <div className="space-y-1.5">
        <label className="form-label">
          Symptoms{" "}
          <span className="normal-case text-gray-600 font-normal">
            (optional)
          </span>
        </label>
        <textarea
          className="form-input resize-y min-h-[120px] leading-relaxed"
          placeholder="Chest discomfort, shortness of breath, fatigue, dizziness...."
          value={form.symptoms}
          onChange={set("symptoms")}
        />
        <p className="form-hint">
          Be as specific as possible — onset, duration, and severity help the AI
          calibrate results.
        </p>
      </div>
    </div>,

    // Step 6 — Review
    <div key="review" className="animate-fade-in space-y-5">
      <SectionHeader
        icon="✅"
        title="Review & Submit"
        subtitle="Confirm your data before running the AI analysis"
      />
      <Disclaimer title="Important Notice — Not a Medical Diagnosis">
        The AI predictions are <strong>screening tools only</strong> and do not
        constitute a medical diagnosis. Results will be reviewed by your
        physician.{" "}
        <strong>
          Do not make medical decisions based solely on these results.
        </strong>
      </Disclaimer>
      <div className="grid grid-cols-2 gap-3">
        <ReviewCard
          title="Personal"
          icon="👤"
          items={[
            ["Age", `${form.age} yrs`],
            ["Gender",GENDER_OPTS.find((o) => o.value === form.gender)?.label ?? form.gender,],
            ["BMI", String(bmi)],
          ]}
        />
        <ReviewCard
          title="Vital Signs"
          icon="💉"
          items={[
            ["Glucose", `${form.glucose} mg/dL`],
            ["Blood Pressure", `${form.resting_bp} mmHg`],
            ["Cholesterol", `${form.cholesterol} mg/dL`],
          ]}
        />
        <ReviewCard
          title="Lab Values"
          icon="🔬"
          items={[
            ["Hemoglobin", `${form.hemoglobin} g/dL`],
            ["Creatinine", `${form.creatinine} mg/dL`],
            ["WBC", (+form.wbc_count).toLocaleString() + " cells/μL"],
            ["Platelets", (+form.platelet_count).toLocaleString() + " cells/μL"],
          ]}
        />
        <ReviewCard
          title="Lifestyle"
          icon="🏃"
          items={[
            ["Smoking", SMOKING_OPTS.find((o) => o.value === form.smoking_status)?.label ?? form.smoking_status,],
            ["Alcohol", ALCOHOL_OPTS.find((o) => o.value === form.alcohol_consumption)?.label ?? form.alcohol_consumption,],
            ["Exercise", EXERCISE_OPTS.find((o) => o.value === form.physical_activity)?.label ?? form.physical_activity,],
            ["Family Hx", FAMILY_OPTS.find((o) => o.value === form.family_history)?.label ?? form.family_history,],
          ]}
        />
        <div className="col-span-2">
          <ReviewCard
            title="Cardiac Indicators"
            icon="🫀"
            items={[
              ["Chest Pain Type", CHEST_PAIN_OPTS.find((o) => o.value === form.chest_pain_type)?.label ?? form.chest_pain_type,],
              ["Heart Rhythm (Resting ECG)", ECG_OPTS.find((o) => o.value === form.resting_ecg)?.label ?? form.resting_ecg,],
              ["Recovery After Exercise", ST_SLOPE_OPTS.find((o) => o.value === form.st_slope)?.label ?? form.st_slope,],
              ["Chest Pain During Exercise", ANGINA_OPTS.find((o) => o.value === form.exercise_angina)?.label ?? form.exercise_angina,],
              ["Fasting Blood Sugar", `${form.fasting_bs} mg/dL`],
              ["Max Heart Rate", `${form.max_hr} bpm`],
              ["Stress During Exercise", String(form.oldpeak) + " mm"],
            ]}
          />
        </div>
      </div>
    </div>,
  ];

  return (
    <Card>
      <StepWizardPro currentStep={step} />

      <div style={{ minHeight: 300 }}>{panels[step]}</div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-800">
        <Button
          variant="ghost"
          onClick={() => {
            setStep((s) => Math.max(0, s - 1));
            setErrors({});
          }}
          disabled={step === 0}
        >
          ← Back
        </Button>

        <span className="text-[11px] text-gray-600 font-mono">
          Step {step + 1} of {STEPS_LABELS.length}
        </span>

        {step < STEPS_LABELS.length - 1 ? (
          <Button variant="primary" onClick={next}>
            Continue →
          </Button>
        ) : (
          <Button variant="teal" onClick={() => onSubmit(form)}>
            🧠 Run AI Analysis
          </Button>
        )}
      </div>
    </Card>
  );
}
