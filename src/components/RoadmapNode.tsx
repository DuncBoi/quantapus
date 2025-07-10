// src/components/CustomNode.tsx
'use client'
import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import ProgressBar from './ProgressBar'

export default function RoadmapNode({
  data,
  id,
}: NodeProps<RoadmapNodeData>) {
  return (
    <div onClick={e => {
      e.stopPropagation();
      data.onClick?.(id)
    }}
      className="
        w-[120px] h-[40px] overflow-visible
        bg-[#1e3353] text-white
        border-2 border-[#61a9f1] rounded-lg
        flex flex-col items-center justify-start
        relative
        pt-2 pb-3 px-2.5
        text-center font-bold text-xs cursor-pointer
      "
    >
      <Handle type="target" position={Position.Top} className="react-flow__handle-top" />

      {/* your node label */}
      <div className="flex-1 flex items-center justify-center">
        {data.label}
      </div>

      {/* simple progress bar under the label */}
      <div className="absolute left-[8px] bottom-[3px] right-[8px] h-[7px] z-20">
        <ProgressBar nodeId={id} slim />
      </div>
      <Handle type="source" position={Position.Bottom} className="react-flow__handle-bottom" />


    </div>
  )
}
