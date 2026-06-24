export function MapLegend() {
  const levels = [
    { color: '#5BBFBF', label: 'Low', description: 'Non-urgent' },
    { color: '#C9A84C', label: 'Medium', description: 'Standard' },
    { color: '#E8957A', label: 'High', description: 'Urgent' },
  ]

  return (
    <div className="absolute bottom-6 left-6 z-[1000] rounded-lg border border-[#E8E4DB] bg-white p-4 shadow-lg">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#1A1208]"
        style={{ fontFamily: 'JetBrains Mono' }}>
        Severity
      </h3>
      <div className="space-y-2">
        {levels.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-xs text-[#1A1208]">{l.label}</span>
            <span className="text-xs text-[#7A6A58]">— {l.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
