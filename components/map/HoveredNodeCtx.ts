import { createContext, useContext } from 'react';

interface HoveredNodeCtxValue {
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
}

export const HoveredNodeCtx = createContext<HoveredNodeCtxValue>({
  hoveredId: null,
  setHoveredId: () => {},
});

export const useHoveredNode = () => useContext(HoveredNodeCtx);
