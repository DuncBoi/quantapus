'use client'
import React, { useState, useMemo, useEffect } from 'react'
import { useData } from '@/context/DataContext'
import ProblemEditor from './ProblemEditor'
import ProblemCard from '../problemcomponents/ProblemCard'
import { Node } from 'reactflow'
import type { Subcategory } from '@/types/data'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface RoadmapNodeData {
  label: string
  subcategories: Subcategory[]
}

export default function AdminNodeModal({
  node,
  onClose,
}: {
  node: Node<RoadmapNodeData>
  onClose: () => void
}) {
  const { problemsById } = useData()
  // Copy subcats + their problems so we can rearrange without mutating original
  const [subcategories, setSubcategories] = useState<Subcategory[]>(
    node.data.subcategories.map(sc => ({ ...sc, problemIds: [...sc.problemIds] }))
  )
  const [editProblemId, setEditProblemId] = useState<number | null>(null)
  const [isEditingNew, setIsEditingNew] = useState(false)
  const [assigningSubcatId, setAssigningSubcatId] = useState<string | null>(null)
  const [showUnassignedModal, setShowUnassignedModal] = useState(false)

  // Find all problems not in *this* node (optionally not in any node, up to you!)
  const allProblems = Array.from(problemsById.values())
  const problemsInThisNode = subcategories.flatMap(sc => sc.problemIds)
  const unassignedProblems = useMemo(() =>
    allProblems.filter(p => !problemsInThisNode.includes(p.id))
  , [allProblems, problemsInThisNode])

  // --- DND-KIT sensors setup ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // --- Subcategory drag-n-drop logic
  const handleSubcatDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = subcategories.findIndex(sc => sc.id === active.id)
    const newIndex = subcategories.findIndex(sc => sc.id === over.id)
    setSubcategories(arrayMove(subcategories, oldIndex, newIndex))
  }

  // --- Problem drag-n-drop within subcategory
  const handleProblemDragEnd = (subIdx: number) => (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = subcategories[subIdx].problemIds.findIndex(pid => pid === active.id)
    const newIndex = subcategories[subIdx].problemIds.findIndex(pid => pid === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      const newSubcats = [...subcategories]
      newSubcats[subIdx] = {
        ...newSubcats[subIdx],
        problemIds: arrayMove(newSubcats[subIdx].problemIds, oldIndex, newIndex)
      }
      setSubcategories(newSubcats)
    }
  }

  // --- Remove problem from subcategory
  const removeProblemFromSubcat = (subIdx: number, pid: number) => {
    const newSubcats = [...subcategories]
    newSubcats[subIdx] = {
      ...newSubcats[subIdx],
      problemIds: newSubcats[subIdx].problemIds.filter(id => id !== pid)
    }
    setSubcategories(newSubcats)
  }

  // --- Assign problem to subcategory
  const assignProblemToSubcat = (subIdx: number, pid: number) => {
    if (subcategories[subIdx].problemIds.includes(pid)) return
    const newSubcats = [...subcategories]
    newSubcats[subIdx] = {
      ...newSubcats[subIdx],
      problemIds: [...newSubcats[subIdx].problemIds, pid]
    }
    setSubcategories(newSubcats)
  }

  // --- Save ordering & assignments to DB (replace this with your supabase call!)
  const handleSave = async () => {
    alert('TODO: Save the subcategory/problem order/assignment to DB')
    onClose()
  }

  useEffect(() => {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }, [])

  // --- Subcategory Sortable Item
  function SortableSubcategory({ sub, idx }: { sub: Subcategory, idx: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sub.id })
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 'auto',
      background: isDragging ? 'rgba(72,126,181,0.25)' : undefined,
    }
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-[rgba(0,0,0,0.3)] p-6 rounded-[8px] shadow-[0_4px_15px_rgba(0,0,0,0.3)] mb-6 relative subcategory-group"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center mb-2">
          <span className="text-2xl font-semibold text-[#edf0f1] border-l-4 border-[#61a9f1] pl-3">
            {sub.id}
          </span>
          <span className="ml-2 text-sm text-gray-300">(Drag to reorder)</span>
          {/* Add/Remove/Other controls here if wanted */}
        </div>
        {/* Problems sortable */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleProblemDragEnd(idx)}
        >
          <SortableContext
            items={sub.problemIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="mt-4 space-y-2 pl-4">
              {sub.problemIds.length > 0 ? sub.problemIds.map(pid => {
                const problem = problemsById.get(pid)
                if (!problem) return null
                return (
                  <SortableProblem
                    key={pid}
                    pid={pid}
                    problem={problem}
                    onEdit={() => { setEditProblemId(pid); setIsEditingNew(false) }}
                    onRemove={() => removeProblemFromSubcat(idx, pid)}
                  />
                )
              }) : (
                <p className="text-gray-500 italic">No problems in this subcategory.</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
        {/* Add problem button */}
        <button
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => { setAssigningSubcatId(sub.id); setShowUnassignedModal(true) }}
        >+ Add Existing Problem</button>
      </div>
    )
  }

  // --- Problem Sortable Item
  function SortableProblem({ pid, problem, onEdit, onRemove }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pid })
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 'auto',
      background: isDragging ? 'rgba(72,126,181,0.15)' : undefined,
    }
    return (
      <div ref={setNodeRef} style={style} className="flex items-center">
        <span {...attributes} {...listeners} className="cursor-move mr-2">⠿</span>
        <ProblemCard problem={problem} variant='roadmap' />
        <button
          className="ml-2 bg-yellow-500 text-black px-3 py-1 rounded font-semibold"
          onClick={onEdit}
        >Edit</button>
        <button
          className="ml-2 bg-red-500 text-white px-3 py-1 rounded font-semibold"
          onClick={onRemove}
        >−</button>
      </div>
    )
  }

  // --- Unassigned problem modal
  const handleAssign = (pid: number) => {
    if (!assigningSubcatId) return
    const subIdx = subcategories.findIndex(sc => sc.id === assigningSubcatId)
    if (subIdx !== -1) {
      assignProblemToSubcat(subIdx, pid)
    }
    setShowUnassignedModal(false)
  }

  return (
    <div
      className="fixed inset-0 flex justify-center items-end z-[1000] bg-black/70 pb-8 modal-overlay"
      onClick={onClose}
    >
      <div
        className="relative bg-[#24252A] p-8 rounded-lg w-[85vw] h-[90vh] overflow-y-auto modal-content animate-in"
        onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#f20404] text-white px-4 py-2 rounded modal-close cursor-pointer"
        >x</button>
        <h1 className="text-center text-[5rem] font-bold mb-3">
          {node.data.label}
        </h1>
        <div className="flex justify-end mb-6">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-5 py-2 rounded font-bold hover:bg-blue-700"
          >Save Order</button>
        </div>
        {/* DND context for subcats */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSubcatDragEnd}
        >
          <SortableContext
            items={subcategories.map(sc => sc.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6 mt-6">
              {subcategories.map((sub, idx) =>
                <SortableSubcategory sub={sub} idx={idx} key={sub.id} />
              )}
            </div>
          </SortableContext>
        </DndContext>

        {/* Modal to pick a problem to assign */}
        {showUnassignedModal && assigningSubcatId && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80">
            <div className="bg-white p-4 rounded-lg w-[90vw] max-w-xl relative text-black">
              <button
                className="absolute top-2 right-2 text-black font-bold text-2xl"
                onClick={() => setShowUnassignedModal(false)}
              >×</button>
              <h2 className="font-bold mb-2 text-2xl">Add a Problem</h2>
              <div className="max-h-[50vh] overflow-y-auto">
                {unassignedProblems.length === 0
                  ? <div className="text-gray-500 italic">No unassigned problems.</div>
                  : unassignedProblems.map(p =>
                    <div key={p.id} className="flex items-center justify-between border-b py-2">
                      <span className="font-mono">#{p.id}: {p.title}</span>
                      <button
                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                        onClick={() => handleAssign(p.id)}
                      >Add</button>
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        )}

        {/* ProblemEditor modal */}
        {(editProblemId !== null) && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60">
            <div className="bg-white p-4 rounded-lg w-[90vw] max-w-2xl relative">
              <button
                className="absolute top-2 right-2 text-black font-bold text-2xl"
                onClick={() => setEditProblemId(null)}
              >×</button>            
              <ProblemEditor
                problemId={editProblemId}
                isNew={isEditingNew}
                onClose={() => setEditProblemId(null)}
              />
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        .modal-content.animate-in { animation: zoomIn 0.25s ease-out forwards; }
        @keyframes zoomIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
