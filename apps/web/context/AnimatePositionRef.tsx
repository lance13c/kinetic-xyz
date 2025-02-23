// WatchlistPositionContext.tsx
import React, { createContext, useContext, useState } from 'react';

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface BoundingBox extends Rect {
  x: number;
  y: number;
}

export interface AnimatePositionContextType {
  position: BoundingBox | null;
  setPosition: (position: BoundingBox | null) => void;
}

// Create context with an undefined default value for safety
const AnimatePositionContext = createContext<AnimatePositionContextType | undefined>(undefined);

// Custom hook for consuming the context
export const useAnimatePosition = (): AnimatePositionContextType => {
  const context = useContext(AnimatePositionContext);
  if (!context) {
    throw new Error('useAnimatePosition must be used within a AnimatePositionProvider');
  }
  return context;
};

// Provider component to wrap the part of your app that needs the position state
export const AnimatePositionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [position, setPosition] = useState<BoundingBox | null>({
    x: 1000,
    y: 0,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  return (
    <AnimatePositionContext.Provider value={{ position, setPosition }}>
      {children}
    </AnimatePositionContext.Provider>
  );
};
