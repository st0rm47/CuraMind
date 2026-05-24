// src/pages/patient/Predictions.tsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/services/api";
import { ApiResponse } from "@/types/report";
import { getLatestAssessmentApi } from "@/services/patient.service";
import { formatDateTime } from "@/utils/formatDate";

// Risk config
const RISK_META: Record<
  string,
  {
    color: string;
    bg: string;
    border: string;
    glow: string;
    icon: string;
    label: string;
  }
> = {
  low: {
    color: "#34d399",
    bg: "rgba(52,211,153,0.07)",
    border: "rgba(52,211,153,0.18)",
    glow: "rgba(52,211,153,0.12)",
    icon: "✓",
    label: "Low Risk",
  },
  medium: {
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.07)",
    border: "rgba(251,191,36,0.18)",
    glow: "rgba(251,191,36,0.12)",
    icon: "◐",
    label: "Medium Risk",
  },
  high: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.07)",
    border: "rgba(248,113,113,0.18)",
    glow: "rgba(248,113,113,0.12)",
    icon: "↑",
    label: "High Risk",
  },
  critical: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.07)",
    border: "rgba(239,68,68,0.22)",
    glow: "rgba(239,68,68,0.15)",
    icon: "⚠",
    label: "Critical",
  },
};
const getRiskMeta = (level: string) =>
  RISK_META[level?.toLowerCase()] ?? RISK_META.low;

// Recommendation icon map
const REC_ICONS = [
  {
    icon: "🥦",
    keywords: [
      "diet",
      "nutrition",
      "food",
      "eat",
      "balanced diet",
      "fruits",
      "vegetables",
    ],
  },
  {
    icon: "🏃",
    keywords: [
      "exercise",
      "workout",
      "physical activity",
      "gym",
      "walking",
      "fitness",
    ],
  },
  { icon: "🚭", keywords: ["smoke", "smoking", "tobacco"] },
  { icon: "🍷", keywords: ["alcohol", "drink", "drinking"] },
  { icon: "🛌", keywords: ["sleep", "rest", "insomnia"] },
  { icon: "🧘", keywords: ["stress", "anxiety", "relax", "mental"] },
  {
    icon: "👨‍⚕️",
    keywords: ["doctor", "consult", "physician", "check", "follow"],
  },
  { icon: "📊", keywords: ["monitor", "track", "measure"] },
  { icon: "⚖️", keywords: ["weight", "bmi", "obesity"] },
  { icon: "💊", keywords: ["medicine", "medication", "drug", "prescription"] },
  { icon: "💧", keywords: ["water", "hydrate", "hydration"] },
  {
    icon: "🫀",
    keywords: ["heart", "cardiac", "blood pressure", "cholesterol"],
  },
];

const getRecIcon = (text: string) => {
  const lower = text.toLowerCase();

  let bestIcon = "💡";
  let bestScore = 0;

  for (const item of REC_ICONS) {
    let score = 0;

    for (const kw of item.keywords) {
      if (lower.includes(kw)) {
        score += kw.length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIcon = item.icon;
    }
  }

  return bestIcon;
};

const AI_STEPS = [
  "Processing patient health data…",
  "Analyzing clinical risk factors…",
  "Running predictive model…",
  "Evaluating risk probability…",
  "Generating personalized insights…",
];

function AiStepCycler() {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex((i) => (i + 1) % AI_STEPS.length)
    }, 900)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      fontSize: 13,
      fontFamily: "var(--font-mono)",
      color: "#6366f1",
      marginTop: 8,
      minHeight: 20,
      transition: "opacity 0.3s",
    }}>
      {AI_STEPS[stepIndex]}
    </div>
  )
}


// Shared style helpers
const SL: React.CSSProperties = {
  fontSize: 10,
  fontFamily: "var(--font-mono)",
  fontWeight: 700,
  color: "#4b5563",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "1rem",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};
const Accent = ({ color }: { color: string }) => (
  <span
    style={{
      width: 3,
      height: 12,
      borderRadius: 2,
      background: color,
      display: "inline-block",
      flexShrink: 0,
    }}
  />
);

// RiskPill
function RiskPill({ level }: { level: string }) {
  const m = getRiskMeta(level);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.2rem 0.65rem",
        borderRadius: 9999,
        fontSize: 10,
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
        textTransform: "uppercase" as const,
        letterSpacing: "0.08em",
        color: m.color,
        background: m.bg,
        border: `1px solid ${m.border}`,
      }}
    >
      {m.icon} {m.label}
    </span>
  );
}

// ConfidenceRing
function ConfidenceRing({
  value,
  color,
  size = 80,
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const r = size / 2 - 7;
  const circ = 2 * Math.PI * r;
  const off = circ - (Math.min(value, 100) / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0 }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#1f2937"
        strokeWidth="5"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={circ}
        strokeDashoffset={off}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: size * 0.175,
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fill: color,
        }}
      >
        {value}%
      </text>
    </svg>
  );
}

// RiskBar
function RiskBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div style={{ marginBottom: "0.875rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.375rem",
        }}
      >
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{label}</span>
        <span
          style={{
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            color,
          }}
        >
          {value}%
        </span>
      </div>
      <div
        style={{
          height: 7,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 9999,
          overflow: "hidden",
          border: "1px solid #1f2937",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}66, ${color})`,
            borderRadius: 9999,
            transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: `0 0 6px ${color}44`,
          }}
        />
      </div>
    </div>
  );
}

// DiseaseCard
function DiseaseCard({
  name,
  probability,
  riskLevel,
  index,
}: {
  name: string;
  probability: number;
  riskLevel: string;
  index: number;
}) {
  const m = getRiskMeta(riskLevel);
  return (
    <div
      className="animate-fade-in"
      style={{
        background: "linear-gradient(150deg, #0d1117 0%, #111827 100%)",
        border: `1px solid ${m.border}`,
        borderRadius: 16,
        padding: "1.5rem 1rem 1.25rem",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: "0.7rem",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        boxShadow: `0 2px 16px ${m.glow}`,
        animationDelay: `${index * 0.06}s`,
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 10px 28px ${m.glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 2px 16px ${m.glow}`;
      }}
    >
      <ConfidenceRing value={probability} color={m.color} size={80} />
      <p
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#e5e7eb",
          textAlign: "center" as const,
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {name}
      </p>
      <RiskPill level={riskLevel} />
    </div>
  );
}

//  RecommendationCard
function RecommendationCard({ text, index }: { text: string; index: number }) {
  const icon = getRecIcon(text);
  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        gap: "0.875rem",
        alignItems: "flex-start",
        padding: "1rem 1.1rem",
        borderRadius: 12,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        transition: "background 0.2s, border-color 0.2s",
        animationDelay: `${index * 0.06}s`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(99,102,241,0.07)";
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.22)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.025)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      {/* Emoji icon bubble */}
      <div
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "rgba(99,102,241,0.1)",
          border: "1px solid rgba(99,102,241,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
        }}
      >
        {icon}
      </div>

      {/* Index + text */}
      <div
        style={{
          display: "flex",
          gap: "0.6rem",
          alignItems: "flex-start",
          flex: 1,
          paddingTop: 2,
        }}
      >
        <span
          style={{
            flexShrink: 0,
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            color: "#4f46e5",
            marginTop: 2,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.65 }}>
          {text}
        </span>
      </div>
    </div>
  );
}

// Stat Tile
function StatTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: "0.75rem",
        borderRadius: 10,
        textAlign: "center" as const,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 20,
          fontFamily: "var(--font-mono)",
          fontWeight: 800,
          color,
        }}
      >
        {value}
      </p>
      <p
        style={{
          margin: "0.2rem 0 0",
          fontSize: 9,
          color: "#6b7280",
          fontFamily: "var(--font-mono)",
          textTransform: "uppercase" as const,
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </p>
    </div>
  );
}

// Main Page
export default function Predictions() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  let isMounted = true;

  (async () => {
    try {
      setLoading(true);
      setAiThinking(true);

      const res = await getLatestAssessmentApi();

      // simulate AI delay (ONLY for UI effect)
      setTimeout(() => {
        if (!isMounted) return;

        setData(res);
        setAiThinking(false);
        setLoading(false);
      }, 2000);

    } catch (err) {
      toast.error(getErrorMessage(err));

      if (isMounted) {
        setLoading(false);
        setAiThinking(false);
      }
    }
  })();

  return () => {
    isMounted = false;
  };
}, []);

  if (loading) {
  return (
    <div className="card fade-in">
      <div className="ai-loading">
        <div className="ai-spinner" />
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 18,
            fontWeight: 700,
            color: "#e5e7eb",
            marginBottom: 6,
          }}>
            AI Diagnosing Patient Data
          </div>
          <AiStepCycler />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {["AI Model", "Random Forest", "Clinical Risk Assessment"].map((m) => (
            <span key={m} className="tag tag-blue">{m}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

  if (!data) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🤖</div>
        <p>No predictions yet. Submit your health data first.</p>
        <button
        onClick={() => navigate("/patient/healthinput")}
        style={{
          marginTop: "1rem",
          padding: "0.6rem 1.2rem",
          borderRadius: 10,
          border: "1px solid rgba(99,102,241,0.4)",
          background: "rgba(99,102,241,0.1)",
          color: "#818cf8",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(99,102,241,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(99,102,241,0.1)";
        }}
      >
        ➜ Go to Health Prediction
      </button>
      </div>
    );
  }

  const overallMeta = getRiskMeta(data.risk_level);
  const confidence = Math.round(data.risk_percentage ?? 0);
  const createdAt = formatDateTime(data.created_at);
  const diseases = Object.entries(data.predictions ?? {}).map(
    ([key, result]) => ({
      key,
      name: result.disease_name,
      probability: Math.round(result.probability),
      riskLevel: result.risk_level,
    }),
  );
  const modelName = data.models_used ?? "Ensemble Model";
  const allRecommendations = data.recommendations ?? [];

  return (
    <div
      className="animate-fade-in"
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
    >
      {/* 1. HEADER  */}
      <div>
        <h1 className="page-title">AI Health Predictions</h1>
        <p className="page-sub">
          Predictions generated by our AI model
          {createdAt ? `   ·   ${createdAt}` : ""}
        </p>
      </div>

      {/* 2. AI DISCLAIMER BANNER  */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          padding: "1rem 1.25rem",
          borderRadius: 14,
          background:
            "linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(245,158,11,0.03) 100%)",
          border: "1px solid rgba(251,191,36,0.22)",
        }}
      >
        {/* Animated pulse dot + label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#fbbf24",
              boxShadow: "0 0 0 4px rgba(251,191,36,0.18)",
              animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: "#fbbf24",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              whiteSpace: "nowrap",
            }}
          >
            AI Generated
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "#d1d5db",
            lineHeight: 1.75,
            
            minWidth: 0,
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
        >
          These results are{" "}
          <strong style={{ color: "#fbbf24" }}>
            AI-generated screening outputs
          </strong>{" "}
          and are intended solely for informational and decision-support
          purposes. They do not constitute a medical diagnosis, clinical
          opinion, or treatment recommendation.{" "}
          <span style={{ color: "#9ca3af" }}>
            All findings should be interpreted by a qualified healthcare
            professional, and no clinical decisions should be made based solely
            on these results without appropriate medical consultation.
          </span>
        </p>

        {/* <span
          style={{
            flexShrink: 0,
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.35rem 0.85rem",
            borderRadius: 8,
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            color: "#fbbf24",
            background: "rgba(251,191,36,0.1)",
            border: "1px solid rgba(251,191,36,0.2)",
            whiteSpace: "nowrap",
          }}
        >
          👨‍⚕️ Consult Doctor
        </span> */}
      </div>

      {/* 3. DISEASE CARDS 
      {diseases.length > 0 && (
        <section>
          <p style={SL}>
            <Accent color="#6366f1" />
            Disease Risk Breakdown
          </p>
          <div className="disease-grid">
            {diseases.map((d, i) => (
              <div key={d.key} style={{ minWidth: 0, width: "100%" }}>
                <DiseaseCard {...d} index={i} />
              </div>
            ))}
          </div>
        </section>
      )} */}

      {/* 4. OVERALL ASSESSMENT (left) + MODEL + RISK BARS (right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1rem",
        }}
      >
        {/* Overall Assessment card */}
        <div
          style={{
            padding: "1.5rem",
            borderRadius: 16,
            background: `linear-gradient(145deg, ${overallMeta.bg} 0%, rgba(13,17,23,0) 100%)`,
            border: `1px solid ${overallMeta.border}`,
            boxShadow: `0 4px 28px ${overallMeta.glow}`,
            display: "flex",
            flexDirection: "column" as const,
            gap: "1.1rem",
          }}
        >
          <p style={SL}>
            <Accent color={overallMeta.color} />
            Overall Assessment
          </p>

          {/* Ring + label */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
          >
            <ConfidenceRing
              value={confidence}
              color={overallMeta.color}
              size={90}
            />
            
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  color: "#6b7280",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.08em",
                }}
              >
                Risk Classification
              </p>
              <p
                style={{
                  margin: "0.3rem 0 0.65rem",
                  fontSize: 22,
                  fontWeight: 800,
                  color: overallMeta.color,
                  lineHeight: 1.1,
                }}
              >
                {overallMeta.label}
              </p>
              <RiskPill level={data.risk_level} />
            </div>
          </div>

          {/* Stat tiles */}
          <div style={{ display: "flex", gap: "0.65rem" }}>
            <StatTile
              label="Classification Confidence"
              value={`${confidence}%`}
              color={overallMeta.color}
            />
            <StatTile
              label="Diseases"
              value={String(diseases.length)}
              color={overallMeta.color}
            />
          </div>
        </div>

        {/* Model info + Risk distribution */}
        <div
          style={{
            padding: "1.5rem",
            borderRadius: 16,
            background: "linear-gradient(145deg, #0d1117 0%, #111827 100%)",
            border: "1px solid #1f2937",
            display: "flex",
            flexDirection: "column" as const,
            gap: "1.25rem",
          }}
        >
          {/* Model pill */}
          <div>
            <p style={SL}>
              <Accent color="#6366f1" />
              Model Information
            </p>
            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: 10,
                background: "rgba(99,102,241,0.07)",
                border: "1px solid rgba(99,102,241,0.18)",
              }}
            >
              <p
                style={{
                  margin: "0 0 0.25rem",
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                  color: "#6366f1",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
                }}
              >
                ML Model Used
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#e5e7eb",
                }}
              >
                {modelName}
              </p>
            </div>
          </div>

          {/* Risk distribution bars */}
          <div style={{ flex: 1 }}>
            <p style={{ ...SL, marginBottom: "0.75rem" }}>
              <Accent color="#6366f1" />
              Risk Distribution
            </p>
            {diseases.map((d) => {
              const m = getRiskMeta(d.riskLevel);
              return (
                <RiskBar
                  key={d.key}
                  label={d.name}
                  value={d.probability}
                  color={m.color}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/*  5. RECOMMENDATIONS  */}
      <section
        style={{
          padding: "1.5rem",
          borderRadius: 16,
          background: "linear-gradient(145deg, #0d1117 0%, #111827 100%)",
          border: "1px solid #1f2937",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <p style={{ ...SL, marginBottom: 0 }}>
            <Accent color="#34d399" />
            Personalized Recommendations
          </p>
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              color: "#6b7280",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid #1f2937",
              padding: "0.2rem 0.65rem",
              borderRadius: 6,
            }}
          >
            {allRecommendations.length} actions
          </span>
        </div>

        {allRecommendations.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
              gap: "0.65rem",
            }}
          >
            {allRecommendations.map((rec, i) => (
              <RecommendationCard key={i} text={rec} index={i} />
            ))}
          </div>
        ) : (
          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              textAlign: "center" as const,
              padding: "2rem 0",
            }}
          >
            No recommendations available for this assessment.
          </p>
        )}
      </section>

      {/* 6. FOOTER NOTE  */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.875rem 1.25rem",
          borderRadius: 12,
          background: "rgba(99,102,241,0.04)",
          border: "1px solid rgba(99,102,241,0.12)",
        }}
      >
        <span style={{ fontSize: 14, flexShrink: 0 }}>🔒</span>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "#6b7280",
            lineHeight: 1.55,
          }}
        >
          These results are{" "}
          <strong style={{ color: "#818cf8" }}>
            AI-generated screening insights
          </strong>{" "}
          and are intended for informational purposes only. Clinical
          interpretation should always be performed by a qualified healthcare
          professional before any medical decision-making.
        </p>
      </div>
    </div>
  );
}
