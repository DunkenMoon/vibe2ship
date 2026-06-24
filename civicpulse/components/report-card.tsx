import { SeverityBadge } from "@/components/severity-badge"

export interface Report {
  id: string
  lat: number
  lon: number
  category: "pothole" | "water_leakage" | "streetlight" | "waste_management" | "other"
  description: string
  severity: number
  status: "reported" | "verified" | "in_progress" | "resolved"
  department: string
  createdAt: string
}

const CATEGORY_LABELS: Record<Report["category"], string> = {
  pothole: "Pothole",
  water_leakage: "Water Leakage",
  streetlight: "Streetlight",
  waste_management: "Waste Management",
  other: "Other",
}

const STATUS_LABELS: Record<Report["status"], string> = {
  reported: "Reported",
  verified: "Verified",
  in_progress: "In Progress",
  resolved: "Resolved",
}

interface ReportCardProps {
  report: Report
}

export function ReportCard({ report }: ReportCardProps) {
  const date = new Date(report.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <div className="rounded-xl border border-[#E6DDCF] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-xs font-medium uppercase tracking-widest text-[#7A6A58]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {CATEGORY_LABELS[report.category]}
        </p>
        <SeverityBadge severity={report.severity} />
      </div>

      <p
        className="mt-2 text-sm text-[#1A1208] line-clamp-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {report.description}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span
          className="text-xs text-[#7A6A58]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {report.department}
        </span>
        <span
          className="text-xs text-[#7A6A58]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {STATUS_LABELS[report.status]} · {date}
        </span>
      </div>
    </div>
  )
}
