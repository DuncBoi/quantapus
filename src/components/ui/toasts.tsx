import { toast } from "sonner"
import { Check, AlertTriangle } from "lucide-react"
import React from "react"

// Good toast (green, checkmark)
export function goodToast(message: string) {
  toast.custom(() => (
    <div className="pointer-events-auto flex items-center gap-2 w-full max-w-sm
                    bg-green-500 text-white rounded-2xl px-5 py-4 shadow-[0_0_22px_rgba(0,255,120,0.35)]">
      <Check className="w-5 h-5" strokeWidth={3} />
      <span className="text-base font-semibold">{message}</span>
    </div>
  ), { duration: 3000, position: 'bottom-right' })
}

// Bad toast (red, alert)
export function badToast(message: string) {
  toast.custom(() => (
    <div className="pointer-events-auto flex items-center gap-2 w-full max-w-sm
                    bg-red-500 text-white rounded-2xl px-5 py-4 shadow-[0_0_22px_rgba(255,0,0,0.25)]">
      <AlertTriangle className="w-5 h-5" strokeWidth={3} />
      <span className="text-base font-semibold">{message}</span>
    </div>
  ), { duration: 3000, position: 'bottom-right' })
}
