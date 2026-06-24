'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Navbar } from '@/components/navbar'
import { MapLegend } from '@/components/map-legend'
import { ReportCard } from '@/components/report-card'
import { seedReports } from '@/lib/seed-reports'

const CivicMap = dynamic(
  () => import('@/components/civic-map').then((m) => m.CivicMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-[#FAF7F2] flex items-center justify-center text-sm text-[#7A6A58]">
        Loading map...
      </div>
    ),
  }
)

export default function MapPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reports] = useState(seedReports)

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
      <Navbar />

      <div className="border-b border-[#E8E4DB] bg-[#FAF7F2] px-6 py-5">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-light text-[#1A1208] mb-1" style={{ fontFamily: 'Cormorant Garamond' }}>
            Community Reports
          </h1>
          <p className="text-sm text-[#7A6A58]">View and track civic issues reported in Hyderabad</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        <div className="relative flex-1">
          <CivicMap reports={reports} selectedId={selectedId} onMarkerClick={setSelectedId} />
          <MapLegend />
        </div>

        <div className="w-80 flex flex-col border-l border-[#E8E4DB] bg-white overflow-hidden">
          <div className="flex-shrink-0 border-b border-[#E8E4DB] px-4 py-4">
            <h2 className="text-sm font-semibold text-[#1A1208]">Active Reports</h2>
            <p className="text-xs text-[#7A6A58] mt-1">{reports.length} reports in Hyderabad</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                isSelected={selectedId === report.id}
                onClick={() => setSelectedId(report.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
