"use client";

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import transactions from "@/lib/data";

// Ensure SSR is strictly disabled for the map component
const MapView = dynamic(() => import("@/components/map-view"), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[500px] bg-neutral-900 animate-pulse rounded-xl flex items-center justify-center">
      <span className="text-neutral-500 font-medium">Loading Security Map...</span>
    </div>
  )
});

export default function MapPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  // Unwrap the searchParams promise safely for Client Components
  const params = React.use(searchParams);
  const id = params?.id;
  
  const tx = transactions.find((t) => t.id === id);
  const initialCenter = tx 
    ? [tx.coordinates.lat, tx.coordinates.lng] as [number, number] 
    : undefined;

  return (
    <div className="h-[calc(100vh-120px)] w-full p-4">
      <Suspense fallback={<div className="h-full w-full bg-neutral-900 animate-pulse" />}>
        <MapView data={transactions} initialCenter={initialCenter} selectedId={id} />
      </Suspense>
    </div>
  );
}