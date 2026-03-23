import type { ReactNode } from "react";


interface TabGroupProps {
  children: ReactNode; 
}

export default function TabGroup({ children }: TabGroupProps) {
  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-0">
      <div className="flex gap-8 border-b border-white/10 w-full mb-4 sm:mb-6 overflow-x-auto">
        {children}
      </div>
    </div>
  );
}