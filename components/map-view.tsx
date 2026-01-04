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
    <div className="relative min-h-screen bg-neutral-950 text-slate-100">
      <div className="absolute left-4 top-4 z-[1000] w-80 rounded-lg bg-neutral-900/90 p-4 shadow-lg pointer-events-auto">
        <div className="mb-3">
          <label className="block text-sm text-slate-300">Device ID</label>
          <Input
            placeholder="Enter Device ID"
            value={deviceId}
            onChange={(e) => setDeviceId((e.target as HTMLInputElement).value)}
          />
        </div>

        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-300">GPS Location</div>
              <div className="text-sm font-medium">
                {gps ? `Lat: ${gps.lat.toFixed(4)}, Lon: ${gps.lng.toFixed(4)}` : "Lat: — , Lon: —"}
              </div>
              <div className="text-sm text-slate-400">{gpsCity ? `Detected City: ${gpsCity}` : "Detected City: —"}</div>
            </div>
            <div className="ml-2">
              <Button size="sm" variant="ghost" onClick={useCurrentLocation}>
                📍 Use My Current Location
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-sm text-slate-300">IP City (for spoof test)</label>
          <Input placeholder="Enter IP City" value={ipCity} onChange={(e) => setIpCity((e.target as HTMLInputElement).value)} />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={sendPing}>Send Location Ping</Button>
          <Button variant="outline" size="sm" onClick={() => setConsoleMsg(null)}>
            Clear
          </Button>
        </div>

        <div className="mt-3 h-20 overflow-auto rounded bg-neutral-800/60 p-2 text-xs">
          <div className="text-slate-300">Console</div>
          <div className="text-slate-100 mt-1">{consoleMsg ?? "No messages"}</div>
        </div>
      </div>

      <MapClient data={filtered} initialCenter={initialCenter} />
    </div>
  )
}
