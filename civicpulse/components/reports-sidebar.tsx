import { ReportCard, Report } from "@/components/report-card"

interface ReportsSidebarProps {
  reports: Report[]
}

export function ReportsSidebar({ reports }: ReportsSidebarProps) {
  return (
    <aside className="w-full lg:w-80 xl:w-96">
      <div className="mb-4 flex items-center justify-between">
        <p
          className="text-xs uppercase tracking-widest text-[#7A6A58]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Recent Reports
        </p>
        <span
          className="text-xs text-[#7A6A58]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {reports.length} issue{reports.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex max-h-[480px] flex-col gap-3 overflow-y-auto pr-1">
        {reports.length === 0 ? (
          <p
            className="text-sm text-[#7A6A58] text-center py-12"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            No reports yet. Seed data loads in Unit 2.
          </p>
        ) : (
          reports.map((r) => <ReportCard key={r.id} report={r} />)
        )}
      </div>
    </aside>
  )
}
