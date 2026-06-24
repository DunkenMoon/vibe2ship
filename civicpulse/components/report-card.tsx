import { SeverityBadge } from './severity-badge'
import type { CivicReport } from '@/lib/seed-reports'

interface ReportCardProps {
  report: CivicReport
  isSelected: boolean
  onClick: () => void
}

export function ReportCard({ report, isSelected, onClick }: ReportCardProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
        isSelected ? 'border-[#C9A84C] bg-[#FAF7F2]' : 'border-[#E8E4DB] bg-white'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#1A1208]">{report.department}</h3>
          <p className="text-xs text-[#7A6A58]" style={{ fontFamily: 'JetBrains Mono' }}>
            {report.category}
          </p>
        </div>
        <SeverityBadge severity={report.severity} />
      </div>
      <p className="mb-2 text-sm leading-relaxed text-[#1A1208] line-clamp-2">
        {report.description}
      </p>
      <span className="text-xs text-[#7A6A58]">{report.timeAgo}</span>
    </div>
  )
}
