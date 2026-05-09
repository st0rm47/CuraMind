import { getStatusConfig } from "@/utils/queueHelpers";

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const cfg = getStatusConfig(status);
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: cfg.bg,
        color: cfg.text,
      }}
    >
      <span style={{ fontSize: 12, lineHeight: 1 }}>{cfg.icon}</span>
       {cfg.label}
    </span>
  );
}
