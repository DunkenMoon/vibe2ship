"use client"
import { Navbar } from "@/components/navbar"
import { MapLegend } from "@/components/map-legend"
import { ReportCard } from "@/components/report-card"
import { ReportsSidebar } from "@/components/reports-sidebar"

// Placeholder — Unit 2 will replace this import
const SEED_REPORTS: never[] = []

export default function MapPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />

      {/* Page header */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <h1
          className="font-display text-4xl font-light tracking-tight text-[#1A1208]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Community Reports
        </h1>
        <p
          className="mt-2 text-sm text-[#7A6A58]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Live civic issues reported by residents — powered by AI triage.
        </p>
      </section>

      {/* Map + Sidebar layout */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="flex flex-col gap-6 lg:flex-row">

          {/* Map container — Unit 2 replaces this div with <MapView> */}
          <div className="relative flex-1">
            <div
              id="map-container"
              className="h-[480px] w-full rounded-xl border border-[#E6DDCF] bg-[#F2EDE4] flex items-center justify-center"
            >
              <p
                className="text-sm text-[#7A6A58]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                MAP LOADS HERE — UNIT 2
              </p>
            </div>

            {/* Floating legend — bottom-left over map */}
            <div className="absolute bottom-4 left-4 z-10">
              <MapLegend />
            </div>
          </div>

          {/* Sidebar */}
          <ReportsSidebar reports={SEED_REPORTS} />
        </div>
      </section>
    </main>
  )
}
