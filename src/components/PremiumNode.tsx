'use client'
import { NodeProps } from 'reactflow'

export default function PremiumNode({ data }: NodeProps<RoadmapNodeData>) {
  return (
    <div className="rounded-2xl border-4 border-yellow-500 bg-yellow-50 p-5 shadow-2xl text-yellow-900 font-extrabold text-lg animate-bounce ring-2 ring-yellow-400">
      <span role="img" aria-label="brain" className="mr-2">🧠</span>
      {data.label}
    </div>
  )
}

