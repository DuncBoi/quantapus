'use client'
import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import ProgressBar from '../problemcomponents/ProgressBar'

export default function RoadmapNode({
  data,
  id,
}: NodeProps<RoadmapNodeData>) {
  return (
    <div
      className="
        w-[121px] h-[40px] overflow-visible
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
        {id}
        {data.onDelete && (
          <button
            className="absolute top-[-12px] right-[-12px] bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-base hover:bg-red-700 shadow-md"
            onClick={e => {
              e.stopPropagation()
              data.onDelete?.()
            }}
            title="Delete Node"
            tabIndex={-1}
          >×</button>
        )}
      </div>

      {/* simple progress bar under the label */}
      <div className="absolute left-[8px] bottom-[3px] right-[8px] h-[7px] z-20">
        <ProgressBar nodeId={id} slim />
      </div>
      <Handle type="source" position={Position.Bottom} className="react-flow__handle-bottom" />
    </div>
  )
}
