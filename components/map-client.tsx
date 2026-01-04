"use client"

import * as React from "react"
import L from "leaflet"
import { type Transaction } from "@/lib/data"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

export default function MapClient({ data, initialCenter }: { data: Transaction[]; initialCenter?: [number, number] }) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const mapRef = React.useRef<L.Map | null>(null)
  const markersLayerRef = React.useRef<L.LayerGroup | null>(null)

  React.useEffect(() => {
    // Configure default marker icons so they render correctly in Next.js
    try {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: (markerIcon2x as any).src ?? markerIcon2x,
        iconUrl: (markerIcon as any).src ?? markerIcon,
        shadowUrl: (markerShadow as any).src ?? markerShadow,
      })
    } catch (e) {
      // ignore if mergeOptions not available
    }

    if (!ref.current) return

    if (!mapRef.current) {
      const map = L.map(ref.current, {
        center: [20, 0],
        zoom: 2,
        worldCopyJump: false,
        // constrain panning to world bounds
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1,
      })
      mapRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        noWrap: false,
      }).addTo(map)

      markersLayerRef.current = L.layerGroup().addTo(map)
    }

    const map = mapRef.current!
    const markersLayer = markersLayerRef.current!
    try { console.log("MapClient effect running", { initialCenter, dataLength: data.length }) } catch (e) {}

    // Clear previous markers
    markersLayer.clearLayers()

    // If an initialCenter is provided, show only that location and disable other markers/polylines
    if (initialCenter) {
      try {
        console.log("MapClient: initialCenter branch", initialCenter)
        const selMarker = L.marker(initialCenter as [number, number])
        selMarker.bindPopup("Selected location").openPopup()
        markersLayer.addLayer(selMarker)
        map.setView(initialCenter, 13)
      } catch (e) {
        // ignore
      }
      return
    }

    const markers: L.Marker[] = []
    data.forEach((t) => {
      const m = L.marker([t.coordinates.lat, t.coordinates.lng])
      m.bindPopup(`<strong>${t.productName}</strong><br/>${t.customerName}<br/>Risk: ${t.riskScore}`)
      markersLayer.addLayer(m)
      markers.push(m)
    })

    // Draw dashed polyline connecting high-risk transactions (riskScore > 80)
    const high = data.filter((d) => d.riskScore > 80)
    if (high.length >= 2) {
      const latlngs = high.map((h) => [h.coordinates.lat, h.coordinates.lng] as [number, number])
      L.polyline(latlngs, { color: "#ef4444", dashArray: "6 6" }).addTo(markersLayer)
    }

    if (markers.length) {
      const group = L.featureGroup(markers)
      map.fitBounds(group.getBounds().pad(0.2))
    }
    return () => {
      // do not remove the map here; keep persistent across updates
    }
  }, [data, initialCenter])

  

  React.useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return <div ref={ref} className="h-screen w-full" />
}
