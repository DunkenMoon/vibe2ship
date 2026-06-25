'use client'

import { useEffect, useRef, useCallback } from 'react'
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
  const styleInjectedRef = useRef(false)
  const onMarkerClickRef = useRef(onMarkerClick)

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick
  }, [onMarkerClick])

  useEffect(() => {
    if (!containerRef.current) return

    import('leaflet').then((L) => {
      if (mapRef.current) return

      const map = L.map(containerRef.current!).setView([17.4474, 78.3762], 12)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Signal that map is ready for markers
      setTimeout(() => {
        containerRef.current?.dispatchEvent(new CustomEvent('mapready'))
      }, 0)

      if (!styleInjectedRef.current) {
        styleInjectedRef.current = true
        const style = document.createElement('style')
        style.textContent = `
          .leaflet-popup-content-wrapper {
            background: #ffffff !important;
            border: 1px solid #E8E4DB !important;
            border-radius: 10px !important;
            box-shadow: 0 4px 24px rgba(26,18,8,0.10) !important;
            padding: 14px 16px !important;
          }
          .leaflet-popup-tip { background: #ffffff !important; }
          .leaflet-popup-content { margin: 0 !important; }
          .leaflet-popup-close-button {
            color: #7A6A58 !important;
            font-size: 16px !important;
            top: 8px !important;
            right: 10px !important;
          }
        `
        document.head.appendChild(style)
      }
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current = {}
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) {
      // Map not ready — wait for mapready event then build
      const container = containerRef.current
      const onReady = () => buildMarkers()
      container?.addEventListener('mapready', onReady, { once: true })
      return () => container?.removeEventListener('mapready', onReady)
    }

    buildMarkers()

    function buildMarkers() {
      import('leaflet').then((L) => {
        if (!mapRef.current) return

        Object.values(markersRef.current).forEach((m) => m.remove())
        markersRef.current = {}

        reports.forEach((r) => {
          const isSelected = r.id === selectedId
          const marker = L.circleMarker([r.lat, r.lon], {
            radius: isSelected ? 14 : 10,
            fillColor: severityColor[r.severity],
            color: isSelected ? '#1A1208' : '#fff',
            weight: isSelected ? 3 : 2,
            opacity: 1,
            fillOpacity: 0.9,
          })
            .addTo(mapRef.current!)
            .bindPopup(`
              <div style="font-family:'DM Sans',sans-serif;min-width:190px;padding:4px 2px">
                <div style="font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#7A6A58;margin-bottom:6px;font-family:'JetBrains Mono',monospace">${r.category.replace(/_/g, ' ')}</div>
                <div style="font-size:14px;font-weight:600;color:#1A1208;margin-bottom:6px;line-height:1.3">${r.department}</div>
                <div style="font-size:12px;color:#7A6A58;line-height:1.6;margin-bottom:10px;border-top:1px solid #E8E4DB;padding-top:8px">${r.description}</div>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                  <span style="font-size:10px;font-family:'JetBrains Mono',monospace;background:#FAF7F2;border:1px solid #E8E4DB;border-radius:4px;padding:2px 7px;color:#1A1208;font-weight:500">severity ${r.severity}/5</span>
                  <span style="font-size:10px;font-family:'JetBrains Mono',monospace;background:#FAF7F2;border:1px solid #E8E4DB;border-radius:4px;padding:2px 7px;color:#7A6A58">${(r.status ?? 'reported').replace(/_/g, ' ')}</span>
                </div>
              </div>
            `, { maxWidth: 260 })

          marker.on('click', () => onMarkerClickRef.current(r.id))
          markersRef.current[r.id] = marker
        })

        if (selectedId && markersRef.current[selectedId]) {
          const r = reports.find((rep) => rep.id === selectedId)
          if (r && mapRef.current) {
            mapRef.current.setView([r.lat, r.lon], mapRef.current.getZoom(), {
              animate: true,
              duration: 0.3,
              easeLinearity: 0.5,
            })
            setTimeout(() => markersRef.current[selectedId]?.openPopup(), 150)
          }
        }
      })
    }
  }, [reports, selectedId])

  return <div ref={containerRef} className="h-full w-full" />
}
