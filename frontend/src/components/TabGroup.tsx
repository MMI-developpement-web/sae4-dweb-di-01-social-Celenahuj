import type { ReactNode } from "react";

interface TabGroupProps {
  children: ReactNode; 
}

export default function TabGroup({ children }: TabGroupProps) {
  return (
    <div className="flex gap-8 border-b border-white/10 w-full">
      {children}
    </div>
  );
}