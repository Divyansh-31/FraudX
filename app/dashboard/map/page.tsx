"use client"

import * as React from "react"
import MapClient from "@/components/map-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import transactions, { type Transaction } from "@/lib/data"

function detectCity(lat: number, lng: number) {
  // Simple demo detector: Pune coordinates ~ (18.5204, 73.8567)
  if (lat >= 18 && lat <= 19 && lng >= 73 && lng <= 74) return "Pune"
  return "Unknown"
}

export default function MapView({ data, initialCenter, selectedId }: { data?: Transaction[]; initialCenter?: [number, number]; selectedId?: string }) {
  const tx = data ?? transactions
  const filtered = selectedId ? tx.filter((t) => t.id === selectedId) : tx
  const [deviceId, setDeviceId] = React.useState("")
  const [gps, setGps] = React.useState<{ lat: number; lng: number } | null>(null)
  const [gpsCity, setGpsCity] = React.useState<string | null>(null)
  const [ipCity, setIpCity] = React.useState("")
  const [consoleMsg, setConsoleMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (gps) setGpsCity(detectCity(gps.lat, gps.lng))
  }, [gps])

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setConsoleMsg("Geolocation not supported in this browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setGps({ lat, lng })
        setConsoleMsg("Location detected")
      },
      (err) => setConsoleMsg(`Error getting location: ${err.message}`)
    )
  }

  function sendPing() {
    // Simulate ping: validate device id
    if (!deviceId) {
      setConsoleMsg("Please enter Device ID before sending ping")
      return
    }
    // Simulate success
    setConsoleMsg(`Ping sent successfully for ${deviceId} (GPS: ${gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : 'N/A'}, IP City: ${ipCity || 'N/A'})`)
  }

  return (
    <div className="relative min-h-screen bg-neutral-950 text-slate-50">
      <div className="absolute left-4 bottom-4 z-[1000] w-64 rounded-lg bg-neutral-900/90 p-3 shadow-lg pointer-events-auto">
        <div className="mb-2">
          <label className="block text-xs text-slate-400 mb-1">Device ID</label>
          <Input
            placeholder="Enter Device ID"
            value={deviceId}
            className="h-7 text-xs"
            onChange={(e) => setDeviceId((e.target as HTMLInputElement).value)}
          />
        </div>

        <div className="mb-2">
          <div className="text-xs text-slate-400 mb-1">GPS Location</div>
          <div className="text-xs text-slate-50 mb-1">
            {gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : "Lat— , Lon—"}
          </div>
          <div className="text-xs text-slate-400 mb-1">{gpsCity ? `City: ${gpsCity}` : "City: —"}</div>
          <Button size="sm" className="h-6 px-2 text-xs w-full" variant="ghost" onClick={useCurrentLocation}>
            📍 Use Current Location
          </Button>
        </div>

        <div className="mb-2">
          <label className="block text-xs text-slate-400 mb-1">IP City (for spoof test)</label>
          <Input placeholder="Enter IP City" className="h-7 text-xs" value={ipCity} onChange={(e) => setIpCity((e.target as HTMLInputElement).value)} />
        </div>

        <div className="flex items-center gap-1 mb-2">
          <Button className="h-6 px-2 text-xs flex-1" onClick={sendPing}>Send Ping</Button>
          <Button variant="secondary" size="sm" className="h-6 px-2 text-xs" onClick={() => setConsoleMsg(null)}>
            Clear
          </Button>
        </div>

        <div className="h-16 overflow-auto rounded bg-neutral-800/60 p-2">
          <div className="text-xs text-slate-400 mb-1">Console</div>
          <div className="text-xs text-slate-50">{consoleMsg ?? "No messages"}</div>
        </div>
      </div>

      <MapClient data={filtered} initialCenter={initialCenter} />
    </div>
  )
}