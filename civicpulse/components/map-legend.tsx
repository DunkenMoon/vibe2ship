const LEGEND_ITEMS = [
  { color: "#5BBFBF", label: "Low severity" },
  { color: "#C9A84C", label: "Medium severity" },
  { color: "#E8957A", label: "High severity" },
]

export function MapLegend() {
  return (
    <div className="rounded-lg border border-[#E6DDCF] bg-[rgba(250,247,242,0.95)] px-4 py-3 shadow-sm backdrop-blur-sm">
      <p
        className="mb-2 text-[10px] uppercase tracking-widest text-[#7A6A58]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Severity
      </p>
      <ul className="flex flex-col gap-1.5">
        {LEGEND_ITEMS.map(({ color, label }) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span
              className="text-xs text-[#1A1208]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
