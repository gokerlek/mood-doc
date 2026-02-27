'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { MapCanvas } from '@/components/map/MapCanvas';

export default function MapPage() {
  return (
    <div className="flex-1 flex overflow-hidden" style={{ height: '100%' }}>
      <ReactFlowProvider>
        <MapCanvas />
      </ReactFlowProvider>
    </div>
  );
}
