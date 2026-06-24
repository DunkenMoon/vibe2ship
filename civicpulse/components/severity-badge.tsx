interface SeverityBadgeProps {
  severity: 'low' | 'medium' | 'high'
  className?: string
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  const config = {
    low: { bg: '#5BBFBF', label: 'Low' },
    medium: { bg: '#C9A84C', label: 'Medium' },
    high: { bg: '#E8957A', label: 'High' },
  }[severity]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${className}`}
      style={{ backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  )
}
