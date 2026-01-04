import MapView from "@/components/map-view"
import transactions from "@/lib/data"

export default function MapPage({ searchParams }: { searchParams?: { id?: string } }) {
  const id = searchParams?.id
  const tx = transactions.find((t) => t.id === id)
  const initialCenter = tx ? [tx.coordinates.lat, tx.coordinates.lng] as [number, number] : undefined

  return <MapView data={transactions} initialCenter={initialCenter} selectedId={id} />
}
