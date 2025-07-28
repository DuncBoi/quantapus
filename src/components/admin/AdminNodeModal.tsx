'use client'
import React, { useState, useMemo, useEffect } from 'react'
import { useAdminData } from '@/context/AdminDataContext'
import ProblemEditor from './ProblemEditor'
import ProblemCard from '../problemcomponents/ProblemCard'
import { Node } from 'reactflow'
import type { Subcategory, Problem} from '@/types/data'
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
interface SortableProblemProps {
  pid: number
  problem: Problem
  onEdit: () => void
  onRemove: () => void
}


export default function AdminNodeModal({
  node,
  onClose,
}: {
  node: Node<RoadmapNodeData>
  onClose: () => void
}) {
  // Get context and always find the *live* roadmapNode (with any changes you made in other modals!)
  const { problemsById, roadmap, setProblemsById, setRoadmap, setIsDirty } = useAdminData()
  const roadmapNode = roadmap.find(n => n.id.toString() === node.id.toString())
  const initialSubcategories = roadmapNode
    ? roadmapNode.subcategories
    : node.data.subcategories

  // --- In-modal subcategories (kept in sync with context unless dirty) ---
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories.map(sc => ({
    ...sc,
    problemIds: [...sc.problemIds],
  })))
  useEffect(() => {
    // Only update modal state if modal is opened for another node or context node changes externally
    setSubcategories(initialSubcategories.map(sc => ({ ...sc, problemIds: [...sc.problemIds] })))
    // eslint-disable-next-line
  }, [roadmapNode?.id])

  // Standard modal state
  const [editProblemId, setEditProblemId] = useState<number | null>(null)
  const [isEditingNew, setIsEditingNew] = useState(false)
  const [assigningSubcatId, setAssigningSubcatId] = useState<string | null>(null)
  const [showUnassignedModal, setShowUnassignedModal] = useState(false)
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})
  const [editingSubcatId, setEditingSubcatId] = useState<string | null>(null)
  const [editSubcatValue, setEditSubcatValue] = useState<string>('')
  const [problemSearch, setProblemSearch] = useState('')

  // --- Find all problem IDs that are in any subcategory in any roadmap node (global ban list) ---
  const allUsedProblemIds = useMemo(() =>
    new Set(roadmap.flatMap(n => n.subcategories.flatMap(sc => sc.problemIds))),
    [roadmap]
  )
  // --- Show only problems not in ANY subcategory, anywhere ---
  const allProblems = Array.from(problemsById.values())
  const unassignedProblems = useMemo(
    () =>
      allProblems.filter(
        p =>
          !allUsedProblemIds.has(p.id) &&
          (!problemSearch || `${p.id}`.includes(problemSearch.trim()))
      ),
    [allProblems, allUsedProblemIds, problemSearch]
  )

  // --- Drag-n-drop logic ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )
  const handleSubcatDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = subcategories.findIndex(sc => sc.id === active.id)
    const newIndex = subcategories.findIndex(sc => sc.id === over.id)
    setSubcategories(arrayMove(subcategories, oldIndex, newIndex))
  }
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

  // --- Subcat CRUD ---
  const handleAddSubcat = () => {
    let name = prompt("Enter subcategory name:")
    if (!name) return
    name = name.trim()
    if (subcategories.some(sc => sc.id === name)) {
      alert('Subcategory with that name already exists!')
      return
    }
    setSubcategories([
      ...subcategories,
      {
        id: name,
        orderIndex: subcategories.length,
        problemIds: [],
      }
    ])
    setOpenMap(m => ({ ...m, [name]: true }))
    setIsDirty(true)
  }
  const handleRemoveSubcat = (id: string) => {
    setSubcategories(subcategories.filter(sc => sc.id !== id))
    setOpenMap(m => {
      const x = { ...m }
      delete x[id]
      return x
    })
    setIsDirty(true)
  }
  // --- Edit subcat names (inline) ---
  const handleStartEditSubcat = (id: string, currentValue: string) => {
    setEditingSubcatId(id)
    setEditSubcatValue(currentValue)
  }
  const handleChangeSubcatName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditSubcatValue(e.target.value)
  }
  const handleSaveEditSubcat = (oldId: string) => {
    const newId = editSubcatValue
    if (!newId) return
    if (subcategories.some(sc => sc.id === newId && sc.id !== oldId)) {
      alert('Subcategory with that name already exists!')
      return
    }
    setSubcategories(subcategories.map(sc =>
      sc.id === oldId
        ? { ...sc, id: newId }
        : sc
    ))
    setOpenMap(map => {
      const next = { ...map }
      next[newId] = next[oldId]
      delete next[oldId]
      return next
    })
    setEditingSubcatId(null)
    setEditSubcatValue('')
    setIsDirty(true)
  }

  // --- Problem assign/remove ---
  const removeProblemFromSubcat = (subIdx: number, pid: number) => {
    const newSubcats = [...subcategories]
    newSubcats[subIdx] = {
      ...newSubcats[subIdx],
      problemIds: newSubcats[subIdx].problemIds.filter(id => id !== pid)
    }
    setSubcategories(newSubcats)
    setIsDirty(true)
  }
  const assignProblemToSubcat = (subIdx: number, pid: number) => {
    if (subcategories[subIdx].problemIds.includes(pid)) return
    const newSubcats = [...subcategories]
    newSubcats[subIdx] = {
      ...newSubcats[subIdx],
      problemIds: [...newSubcats[subIdx].problemIds, pid]
    }
    setSubcategories(newSubcats)
    setIsDirty(true)
  }

  // --- Save Order (write only to context, not DB!) ---
  const handleSave = () => {
    setRoadmap(prev =>
      prev.map(rn =>
        rn.id.toString() === node.id.toString()
          ? {
              ...rn,
              subcategories: subcategories.map((sc, idx) => ({
                ...sc,
                problemIds: [...sc.problemIds],
                orderIndex: idx,
              })),
            }
          : rn
      )
    )
    setProblemsById(prev => {
      const next = new Map(prev)
      roadmapNode?.subcategories.forEach(sc => {
        sc.problemIds.forEach(pid => {
          const p = next.get(pid)
          if (p) next.set(pid, { ...p, subcategory_id: null })
        })
      })
      subcategories.forEach((sc) => {
        sc.problemIds.forEach((pid, orderIdx) => {
          const p = next.get(pid)
          if (p) next.set(pid, { ...p, subcategory_id: sc.id, order_index: orderIdx })
        })
      })
      return next
    })
    setIsDirty(true)
    onClose()
  }

  // --- Collapsible helpers ---
  const toggle = (id: string) =>
    setOpenMap(m => ({ ...m, [id]: !m[id] }))

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // --- Subcategory Sortable Item ---
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
          {editingSubcatId === sub.id ? (
            <>
              <input
                type="text"
                className="text-2xl font-semibold text-[#edf0f1] bg-[#20232a] border-b-2 border-blue-400 px-2 w-40"
                value={editSubcatValue}
                autoFocus
                onChange={handleChangeSubcatName}
                onBlur={() => handleSaveEditSubcat(sub.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveEditSubcat(sub.id)
                  if (e.key === 'Escape') setEditingSubcatId(null)
                }}
              />
            </>
          ) : (
            <>
              <button
                onClick={() => toggle(sub.id)}
                className="flex items-center cursor-pointer text-2xl font-semibold text-[#edf0f1] border-l-4 border-[#61a9f1] pl-3 subcategory-header select-none w-full"
                type="button"
              >
                {sub.id}
                <span className="ml-3 subcategory-check" />
                <span className={`ml-auto transition-transform ${openMap[sub.id] ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              <button
                onClick={() => handleStartEditSubcat(sub.id, sub.id)}
                className="ml-4 bg-yellow-400 text-black px-2 py-1 rounded font-semibold text-xs"
                style={{marginLeft: 8}}
              >Edit</button>
              <button
                onClick={() => handleRemoveSubcat(sub.id)}
                className="ml-2 bg-red-500 text-white px-2 py-1 rounded font-semibold text-xs"
              >Delete</button>
            </>
          )}
          <span className="ml-2 text-sm text-gray-300">(Drag to reorder)</span>
        </div>
        {openMap[sub.id] && (
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
        )}
        {openMap[sub.id] && (
          <button
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => { setAssigningSubcatId(sub.id); setShowUnassignedModal(true) }}
          >+ Add Existing Problem</button>
        )}
      </div>
    )
  }

  // --- Problem Sortable Item
  function SortableProblem({ pid, problem, onEdit, onRemove }: SortableProblemProps) {
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
    setProblemSearch('')
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
          {roadmapNode?.label || node.data.label}
        </h1>
        <div className="flex justify-between mb-6">
          <button
            onClick={handleAddSubcat}
            className="bg-green-700 text-white px-5 py-2 rounded font-bold hover:bg-green-800"
          >+ Add Subcategory</button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-5 py-2 rounded font-bold hover:bg-blue-700"
          >Save Order</button>
        </div>
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
        {showUnassignedModal && assigningSubcatId && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80">
            <div className="bg-white p-4 rounded-lg w-[90vw] max-w-xl relative text-black">
              <button
                className="absolute top-2 right-2 text-black font-bold text-2xl"
                onClick={() => { setShowUnassignedModal(false); setProblemSearch('') }}
              >×</button>
              <h2 className="font-bold mb-2 text-2xl">Add a Problem</h2>
              <input
                type="text"
                className="mb-3 px-2 py-1 border rounded w-full"
                placeholder="Search by ID..."
                value={problemSearch}
                onChange={e => setProblemSearch(e.target.value)}
                autoFocus
              />
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
      </div>
      <style jsx global>{`
        .modal-content.animate-in { animation: zoomIn 0.25s ease-out forwards; }
        @keyframes zoomIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      {/* ProblemEditor modal */}
        {(editProblemId !== null) && (
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
        )}
    </div>
    
  )
}
