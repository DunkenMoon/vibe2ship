interface SeverityBadgeProps {
  severity: number // 1–5
}

function severityLabel(s: number): string {
  if (s <= 2) return "Low"
  if (s === 3) return "Medium"
  return "High"
}

function severityColor(s: number): string {
  if (s <= 2) return "#5BBFBF"
  if (s === 3) return "#C9A84C"
  return "#E8957A"
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const color = severityColor(severity)
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: color, fontFamily: "var(--font-mono)" }}
    >
      {severityLabel(severity)} · {severity}
    </span>
  )
}
