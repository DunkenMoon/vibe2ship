'use client'

import { useEffect, useRef } from 'react'
import type { CivicReport } from '@/lib/seed-reports'

interface CivicMapProps {
  reports: CivicReport[]
  selectedId: string | null
  onMarkerClick: (id: string) => void
}

const severityColor: Record<string, string> = {
  low: '#5BBFBF',
  medium: '#C9A84C',
  high: '#E8957A',
}

export function CivicMap({ reports, selectedId, onMarkerClick }: CivicMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<Record<string, import('leaflet').CircleMarker>>({})

  useEffect(() => {
    if (mapRef.current) return
    if (!containerRef.current) return

    import('leaflet').then((L) => {
      if (mapRef.current) return
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      const map = L.map(containerRef.current!).setView([17.4474, 78.3762], 12)
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current = {}
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    import('leaflet').then((L) => {
      Object.values(markersRef.current).forEach((m) => m.remove())
      markersRef.current = {}

      reports.forEach((r) => {
        const marker = L.circleMarker([r.lat, r.lon], {
          radius: 10,
          fillColor: severityColor[r.severity],
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div style="font-family:'DM Sans',sans-serif;min-width:180px;padding:2px 0">
              <div style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#7A6A58;margin-bottom:4px">${r.category.replace(/_/g,' ')}</div>
              <div style="font-size:13px;font-weight:600;color:#1A1208;margin-bottom:6px">${r.department}</div>
              <div style="font-size:12px;color:#7A6A58;line-height:1.5;margin-bottom:8px">${r.description}</div>
              <div style="display:flex;gap:8px;align-items:center">
                <span style="font-size:10px;font-family:'JetBrains Mono',monospace;background:#FAF7F2;border:1px solid #E8E4DB;border-radius:4px;padding:2px 6px;color:#1A1208">severity ${r.severity}/5</span>
                <span style="font-size:10px;font-family:'JetBrains Mono',monospace;color:#7A6A58">${(r.status ?? '').replace(/_/g,' ')}</span>
              </div>
            </div>
          `, { maxWidth: 240, className: 'civic-popup' })
        marker.on('click', () => onMarkerClick(r.id))
        markersRef.current[r.id] = marker
      })
    })
  }, [reports, onMarkerClick])

  useEffect(() => {
    if (!selectedId || !mapRef.current) return

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const isSelected = id === selectedId
      marker.setStyle({
        radius: isSelected ? 14 : 10,
        weight: isSelected ? 3 : 2,
        color: isSelected ? '#1A1208' : '#fff',
      } as Parameters<typeof marker.setStyle>[0])
      marker.setRadius(isSelected ? 14 : 10)

      if (isSelected) {
        const r = reports.find((rep) => rep.id === id)
        if (r && mapRef.current) {
          mapRef.current.setView([r.lat, r.lon], mapRef.current.getZoom(), {
            animate: true,
            duration: 0.3,
            easeLinearity: 0.5,
          })
          marker.openPopup()
        }
      }
    })
  }, [selectedId, reports])

  return <div ref={containerRef} className="h-full w-full" />
}
