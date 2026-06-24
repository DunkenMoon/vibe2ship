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
    if (!containerRef.current) return
    if (mapRef.current) return

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

      reports.forEach((r) => {
        const marker = L.circleMarker([r.lat, r.lon], {
          radius: 10,
          fillColor: severityColor[r.severity],
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup(`<b>${r.department}</b><br/>${r.description}`)

        marker.on('click', () => onMarkerClick(r.id))
        markersRef.current[r.id] = marker
      })
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current = {}
    }
  }, [])

  useEffect(() => {
    import('leaflet').then(() => {
      Object.entries(markersRef.current).forEach(([id, marker]) => {
        const isSelected = id === selectedId
        marker.setStyle({
          radius: isSelected ? 14 : 10,
          weight: isSelected ? 3 : 2,
          color: isSelected ? '#1A1208' : '#fff',
        } as Parameters<typeof marker.setStyle>[0])
        if (isSelected) {
          marker.openPopup()
          const r = reports.find((rep) => rep.id === id)
          if (r && mapRef.current) mapRef.current.panTo([r.lat, r.lon])
        }
      })
    })
  }, [selectedId, reports])

  return <div ref={containerRef} className="h-full w-full" />
}
