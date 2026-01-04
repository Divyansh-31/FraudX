import dynamic from 'next/dynamic';
import transactions from "@/lib/data";

// Use dynamic import to disable Server-Side Rendering for the map
const MapView = dynamic(() => import("@/components/map-view"), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[500px] bg-neutral-900 animate-pulse rounded-xl flex items-center justify-center">
      <span className="text-neutral-500 font-medium">Loading Security Map...</span>
    </div>
  )
});

export default function MapPage({ searchParams }: { searchParams?: { id?: string } }) {
  const id = searchParams?.id;
  const tx = transactions.find((t) => t.id === id);
  
  // Cast to the expected [number, number] tuple for Leaflet
  const initialCenter = tx 
    ? [tx.coordinates.lat, tx.coordinates.lng] as [number, number] 
    : undefined;

  return (
    <div className="h-[calc(100vh-120px)] w-full p-4">
       <MapView data={transactions} initialCenter={initialCenter} selectedId={id} />
    </div>
  );
}