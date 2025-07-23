'use client'
import { ReactNode } from "react";

export default function AnimatedOutlinedBlock({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        relative w-full max-w-xl p-8 rounded-3xl border-2 border-[#61a9f1]
        bg-[#1e293b]/90 text-center
        animate-border-glow
        shadow-2xl
      "
      style={{
        // fallback for browsers without the global css animation
        boxShadow: "0 0 12px 0 #61a9f199",
      }}
    >
      {children}
    </div>
  );
}
