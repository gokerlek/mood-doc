"use client";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useKbStore } from "@/stores/kbStore";
import { MapCanvas } from "@/components/map/MapCanvas";

// ── Page wrapper ──────────────────────────────────────────────────────────────

export default function MapPage() {
  const data = useKbStore.useData();
  if (!data) return null;

  if (data.pages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">No pages to map yet.</p>
          <p className="text-xs text-muted-foreground">
            Add pages first, then come back to map their relationships.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-3 border-b border-border bg-card flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-base font-bold text-foreground">Page Map</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.pages.length} pages · drag nodes to reposition · draw edges to connect
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Double-click an edge to remove it</p>
      </div>

      <ReactFlowProvider>
        <MapCanvas />
      </ReactFlowProvider>
    </div>
  );
}
