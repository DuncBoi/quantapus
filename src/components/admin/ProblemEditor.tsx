'use client'

import { useEffect, useState } from 'react'
import { useAdminData } from '@/context/AdminDataContext'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import type { Problem } from '@/types/data'
import { createClient } from '@/utils/supabase/client'

const initialProblem: Problem = {
  id: 0,
  title: '',
  description: '',
  solution: '',
  explanation: '',
  yt_link: '',
  difficulty: 'Easy',
  subcategory_id: '',
  premium: false
}

export default function ProblemEditor({
  problemId,
  isNew,
  onClose,
}: {
  problemId?: number
  isNew: boolean
  onClose: () => void
}) {
  const {
    problemsById, setProblemsById,
    roadmap,
    categories,
    problemCategories, setProblemCategories,
    setIsDirty,
  } = useAdminData()

  const [editProblem, setEditProblem] = useState<Problem>(initialProblem)
  const [selectedNodeId, setSelectedNodeId] = useState<string>("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [problemIdInput, setProblemIdInput] = useState<number | "">(initialProblem.id)
  const [idError, setIdError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Load problem for edit, or blank for create
  useEffect(() => {
    if (isNew) {
      setProblemIdInput("")
      setIdError(null)
      setSelectedCategoryIds([])
      setEditProblem(initialProblem)
      setSelectedNodeId("")
    } else if (problemId !== undefined) {
      const problem = problemsById.get(problemId)
      if (problem) {
        setEditProblem({ ...problem, subcategory_id: problem.subcategory_id ?? null })
        setProblemIdInput(problem.id)
        setIdError(null)
        // Get node that owns this subcategory
        let nodeId = ""
        if (problem.subcategory_id) {
          const node = roadmap.find(n =>
            n.subcategories.some(sc => String(sc.id) === String(problem.subcategory_id))
          )
          nodeId = node?.id ?? ""
        }
        setSelectedNodeId(nodeId)
        // Get all categories assigned to this problem
        const catIds = problemCategories
          .filter(pc => pc.problem_id === problem.id)
          .map(pc => pc.category_id)
        setSelectedCategoryIds(catIds)
      }
    }
  }, [problemId, isNew, problemsById, roadmap, problemCategories])

  // Live validation for IDs (unique required)
  const validateId = (val: number | "") => {
    if (!val || isNaN(Number(val))) {
      setIdError("Enter a valid number")
    } else if (problemsById.has(val as number)) {
      setIdError("ID already taken")
    } else {
      setIdError(null)
    }
  }

  async function updateProblemToBackend() {
    setIsUpdating(true)
    setUpdateStatus("idle")
    const supabase = createClient()
    try {
      // 1. Upsert the problem itself
      const { error: problemError } = await supabase
        .from('problems')
        .upsert([editProblem])
      if (problemError) throw new Error(problemError.message)

      // 2. Update problem_categories for just this problem
      // a. Fetch existing
      const { data: existingPC, error: pcFetchError } = await supabase
        .from('problem_categories')
        .select('category_id')
        .eq('problem_id', editProblem.id)
      if (pcFetchError) throw new Error(pcFetchError.message)

      const existingCatIds = (existingPC ?? []).map(pc => pc.category_id)
      const toAdd = selectedCategoryIds.filter(cid => !existingCatIds.includes(cid))
      const toRemove = existingCatIds.filter(cid => !selectedCategoryIds.includes(cid))

      // b. Insert new categories
      if (toAdd.length) {
        const { error: pcAddError } = await supabase
          .from('problem_categories')
          .insert(toAdd.map(category_id => ({
            problem_id: editProblem.id,
            category_id
          })))
        if (pcAddError) throw new Error(pcAddError.message)
      }

      // c. Remove unchecked categories
      if (toRemove.length) {
        for (const category_id of toRemove) {
          const { error: pcRemoveError } = await supabase
            .from('problem_categories')
            .delete()
            .eq('problem_id', editProblem.id)
            .eq('category_id', category_id)
          if (pcRemoveError) throw new Error(pcRemoveError.message)
        }
      }

      setUpdateStatus("success")
    } catch {
      setUpdateStatus("error")
    }
    setIsUpdating(false)
  }


  // Save (to context only!)
  const handleSubmit = () => {
    setIsSaving(true)
    let upsertedId: number
    if (isNew) {
      upsertedId = Number(problemIdInput)
      if (idError || !upsertedId) {
        setIsSaving(false)
        return
      }
      const newProblem: Problem = {
        ...editProblem,
        id: upsertedId,
        subcategory_id:
          !editProblem.subcategory_id || editProblem.subcategory_id === ""
            ? null
            : editProblem.subcategory_id,
      }
      setProblemsById(prev => {
        const next = new Map(prev)
        next.set(upsertedId, newProblem)
        return next
      })
    } else {
      upsertedId = editProblem.id
      setProblemsById(prev => {
        const next = new Map(prev)
        next.set(upsertedId, {
          ...editProblem,
          subcategory_id:
            !editProblem.subcategory_id || editProblem.subcategory_id === ""
              ? null
              : editProblem.subcategory_id,
        })
        return next
      })
    }
    // Write categories to context (replace all for this problem)
    setProblemCategories(prev =>
      [
        ...prev.filter(pc => pc.problem_id !== upsertedId),
        ...selectedCategoryIds.map(category_id => ({
          problem_id: upsertedId,
          category_id,
        }))
      ]
    )
    setIsDirty(true)
    setIsSaving(false)
    onClose()
  }

  // "Delete" = remove from context only
  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this problem?')) return
    setProblemsById(prev => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
    setProblemCategories(prev =>
      prev.filter(pc => pc.problem_id !== id)
    )
    setIsDirty(true)
    onClose()
  }

  // Handle overlay click (closes if click outside modal)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-2001 bg-black/50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-lg w-[95vw] max-h-[90vh] overflow-y-auto relative flex flex-col p-8"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-lg font-bold z-10"
        >×</button>
        <form
          className="w-full bg-white rounded-xl flex flex-col md:flex-row gap-10"
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          {/* LEFT SIDE */}
          <div className="flex flex-col gap-8 flex-shrink-0 w-[420px] min-h-0 h-full">
            <div>
              <h2 className="text-2xl font-extrabold text-black mb-4 tracking-tight">
                {isNew ? 'Create New Problem' : `Edit Problem #${editProblem.id}`}
              </h2>
              <section>
                <h3 className="text-lg font-semibold text-black mb-4 border-b border-gray-200 pb-2">Basic Info</h3>
                <div className="flex flex-col gap-5">
                  {isNew && (
                    <div>
                      <label className="block font-semibold text-black mb-1">Problem ID</label>
                      <input
                        type="number"
                        min={1}
                        className={`
                          w-full rounded border px-3 py-2 text-black text-base bg-gray-50 focus:outline-none
                          ${idError ? "border-red-500 ring-2 ring-red-400" : "focus:ring-2 focus:ring-blue-300"}
                        `}
                        value={problemIdInput}
                        onChange={e => {
                          const val = e.target.value === "" ? "" : Number(e.target.value)
                          setProblemIdInput(val)
                          validateId(val)
                        }}
                        required
                      />
                      {idError && <div className="text-red-600 text-xs mt-1">{idError}</div>}
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-black mb-1">Title</label>
                    <input
                      className="w-full rounded border px-3 py-2 text-black text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={editProblem.title}
                      onChange={e => setEditProblem({ ...editProblem, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-black mb-1">Difficulty</label>
                    <select
                      className="w-full rounded border px-3 py-2 text-black text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={editProblem.difficulty ?? "Easy"}
                      onChange={e => setEditProblem({ ...editProblem, difficulty: e.target.value })}
                      required
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-2 font-semibold text-black mb-1">
                      <input
                        type="checkbox"
                        checked={!!editProblem.premium}
                        onChange={e =>
                          setEditProblem({ ...editProblem, premium: e.target.checked })
                        }
                        className="form-checkbox accent-blue-600 h-5 w-5"
                      />
                      Premium problem
                    </label>
                  </div>

                  <div>
                    <label className="block font-semibold text-black mb-1">Roadmap Node</label>
                    <select
                      className="w-full rounded border px-3 py-2 text-black text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={selectedNodeId}
                      onChange={e => {
                        setSelectedNodeId(e.target.value)
                        setEditProblem({ ...editProblem, subcategory_id: null })
                      }}
                    >
                      <option value="">Select a roadmap node</option>
                      {roadmap.map(node =>
                        <option key={node.id} value={node.id}>{node.id} - {node.label}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-black mb-1">Subcategory</label>
                    <select
                      className="w-full rounded border px-3 py-2 text-black text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={editProblem.subcategory_id ?? ""}
                      onChange={e => setEditProblem({ ...editProblem, subcategory_id: e.target.value ? e.target.value : null })}
                      required
                      disabled={!selectedNodeId}
                    >
                      <option value="">Select a subcategory</option>
                      {(roadmap.find(n => n.id === selectedNodeId)?.subcategories ?? []).map(sc =>
                        <option key={sc.id} value={sc.id}>{sc.id}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-black mb-1">Solution</label>
                    <input
                      className="w-full rounded border px-3 py-2 text-black text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={editProblem.solution}
                      onChange={e => setEditProblem({ ...editProblem, solution: e.target.value })}
                      placeholder="Solution (one-liner)"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-black mb-1">YouTube Link</label>
                    <input
                      className="w-full rounded border px-3 py-2 text-black text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={editProblem.yt_link || 'https://www.youtube.com/embed/'}
                      onChange={e => setEditProblem({ ...editProblem, yt_link: e.target.value })}
                    />
                  </div>
                  {/* Category Multi-select */}
                  <div>
                    <label className="block font-semibold text-black mb-1">Categories</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="w-full rounded border px-3 py-2 text-black text-base bg-gray-50 text-left"
                        >
                          {selectedCategoryIds.length === 0
                            ? "Select categories"
                            : categories.filter(c => selectedCategoryIds.includes(c.id)).map(c => c.id).join(', ')}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full max-h-56 overflow-y-auto z-[2100]">
                        {categories.map(cat => (
                          <DropdownMenuCheckboxItem
                            key={cat.id}
                            checked={selectedCategoryIds.includes(cat.id)}
                            onCheckedChange={(checked) => {
                              setSelectedCategoryIds((prev) =>
                                checked
                                  ? [...prev, cat.id]
                                  : prev.filter(id => id !== cat.id)
                              );
                            }}
                          >
                            {cat.id}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </section>
            </div>
            {/* ACTION BUTTONS */}
            <div className="flex gap-3 justify-end pt-6 mt-auto border-t border-gray-200">
              {!isNew && (
                <button
                  type="button"
                  className="bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                  onClick={() => handleDelete(editProblem.id)}
                >Delete</button>
              )}
              <button
                type="button"
                className="bg-gray-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
                onClick={onClose}
              >Cancel</button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                disabled={isSaving}
              >{isSaving ? 'Saving...' : (isNew ? 'Create' : 'Save')}</button>
              <button
                type="button"
                className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                onClick={updateProblemToBackend}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update'}
                
              </button>
            </div>
            {updateStatus === "success" && (
  <div className="text-green-700 mt-2 font-bold">Update successful!</div>
)}
{updateStatus === "error" && (
  <div className="text-red-600 mt-2 font-bold">Update failed. Try again.</div>
)}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col flex-1 gap-10 min-h-0 h-full">
            <div className="flex-1 flex flex-col justify-between min-h-0">
              <label className="block font-semibold text-black mb-2 text-lg">Description</label>
              <textarea
                className="w-full flex-1 rounded border px-3 py-2 text-black text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-vertical"
                value={editProblem.description}
                onChange={e => setEditProblem({ ...editProblem, description: e.target.value })}
                style={{ minHeight: "40vh", maxHeight: "80vh" }}
              />
            </div>
            <div className="flex-1 flex flex-col justify-between min-h-0">
              <label className="block font-semibold text-black mb-2 text-lg">Explanation</label>
              <textarea
                className="w-full flex-1 rounded border px-3 py-2 text-black text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-vertical"
                value={editProblem.explanation}
                onChange={e => setEditProblem({ ...editProblem, explanation: e.target.value })}
                style={{ minHeight: "50vh", maxHeight: "100vh" }}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
