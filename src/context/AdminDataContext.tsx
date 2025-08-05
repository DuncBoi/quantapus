'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Problem, RoadmapNode } from '@/types/data'

// ---- Types ----
type Category = { id: string }
type ProblemCategory = { problem_id: number, category_id: string }

type AdminDataContextType = {
    // Current in-memory state
    problemsById: Map<number, Problem>
    roadmap: RoadmapNode[]
    categories: Category[]
    problemCategories: ProblemCategory[]
    // Setters
    setProblemsById: React.Dispatch<React.SetStateAction<Map<number, Problem>>>
    setRoadmap: React.Dispatch<React.SetStateAction<RoadmapNode[]>>
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>
    setProblemCategories: React.Dispatch<React.SetStateAction<ProblemCategory[]>>
    // Save
    saveAll: () => Promise<void>
    isDirty: boolean
    setIsDirty: (dirty: boolean) => void
    reload?: () => void // optional
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined)

/** Use this in any admin page or modal/component */
export function useAdminData() {
    const ctx = useContext(AdminDataContext)
    if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider')
    return ctx
}

export function AdminDataProvider({
    children,
    initialProblems,
    initialRoadmap,
    initialCategories,
    initialProblemCategories,
}: {
    children: React.ReactNode
    initialProblems: Map<number, Problem>
    initialRoadmap: RoadmapNode[]
    initialCategories: Category[]
    initialProblemCategories: ProblemCategory[]
}) {
    // "Originals" - what the server gave us at first/last save
    const [originalProblemsById, setOriginalProblemsById] = useState(initialProblems)
    const [originalCategories, setOriginalCategories] = useState(initialCategories)
    const [originalProblemCategories, setOriginalProblemCategories] = useState(initialProblemCategories)
    const [originalRoadmap, setOriginalRoadmap] = useState(initialRoadmap)

    // Editable state
    const [problemsById, setProblemsById] = useState(initialProblems)
    const [roadmap, setRoadmap] = useState(initialRoadmap)
    const [categories, setCategories] = useState(initialCategories)
    const [problemCategories, setProblemCategories] = useState(initialProblemCategories)
    const [isDirty, setIsDirty] = useState(false)

    // ---- The Save-All Function ----
    const saveAll = useCallback(async () => {
        const supabase = createClient()
        try {
            const origSubcats = originalRoadmap.flatMap(n => n.subcategories.map(sc => ({
                ...sc,
                roadmap_node_id: n.id
            })))
            const currSubcats = roadmap.flatMap(n => n.subcategories.map(sc => ({
                ...sc,
                roadmap_node_id: n.id
            })))
            const subcatKey = (sc: { id: string; roadmap_node_id: string }) => `${sc.id}|${sc.roadmap_node_id}`
            const origSubcatMap = new Map(origSubcats.map(sc => [subcatKey(sc), sc]))
            const changedSubcats = currSubcats.filter(sc => {
                const orig = origSubcatMap.get(subcatKey(sc))
                if (!orig) return true
                return (
                    orig.orderIndex !== sc.orderIndex ||
                    orig.more_info !== sc.more_info ||
                    orig.construction !== sc.construction
                )
            }).map(sc => ({
                id: sc.id,
                roadmap_node_id: sc.roadmap_node_id,
                order_index: sc.orderIndex,
                more_info: sc.more_info,
                construction: sc.construction
            }))
            if (changedSubcats.length) {
                const { error } = await supabase.from('roadmap_subcategories').upsert(changedSubcats)
                if (error) throw new Error(`Subcategories: ${error.message}`)
            }

            // --- Roadmap Subcategories: DELETE REMOVED SUBCATS ---
            const origSubcatIds = new Set(origSubcats.map(sc => sc.id))
            const currSubcatIds = new Set(currSubcats.map(sc => sc.id))
            const toDeleteSubcatIds = [...origSubcatIds].filter(id => !currSubcatIds.has(id))

            if (toDeleteSubcatIds.length) {
                const { error } = await supabase
                    .from('roadmap_subcategories')
                    .delete()
                    .in('id', toDeleteSubcatIds)
                if (error) throw new Error(`Subcategory delete: ${error.message}`)
            }

            // --- Problems (upsert only changed or new) ---
            const changedProblems: Problem[] = []
            for (const problem of problemsById.values()) {
                const orig = originalProblemsById.get(problem.id)
                if (!orig || JSON.stringify(orig) !== JSON.stringify(problem)) {
                    changedProblems.push(problem)
                }
            }
            if (changedProblems.length) {
                const { error } = await supabase.from('problems').upsert(changedProblems)
                if (error) throw new Error(`Problems: ${error.message}`)
            }

            // --- Categories (insert only new) ---
            const origCatIds = new Set(originalCategories.map(c => c.id))
            const newCats = categories.filter(cat => !origCatIds.has(cat.id))
            if (newCats.length) {
                const { error } = await supabase.from('categories').insert(newCats)
                if (error) throw new Error(`Categories: ${error.message}`)
            }

            // --- Roadmap Nodes (upsert only changed) ---
            const changedNodes = roadmap.filter(node => {
                const orig = originalRoadmap.find(n => n.id === node.id)
                if (!orig) return true
                return (
                    orig.label !== node.label ||
                    orig.positionX !== node.positionX ||
                    orig.positionY !== node.positionY ||
                    orig.styling !== node.styling
                )
            }).map(n => ({
                id: n.id,
                label: n.label,
                position_x: n.positionX,
                position_y: n.positionY,
                styling: n.styling,
            }))
            if (changedNodes.length) {
                const { error } = await supabase.from('roadmap_nodes').upsert(changedNodes)
                if (error) throw new Error(`Nodes: ${error.message}`)
            }


            const origIds = new Set(originalRoadmap.map(n => n.id))
            const currIds = new Set(roadmap.map(n => n.id))
            const toDelete = [...origIds].filter(id => !currIds.has(id))

            if (toDelete.length) {
                const { error } = await supabase
                    .from('roadmap_nodes')
                    .delete()
                    .in('id', toDelete)
                if (error) throw new Error(`Nodes: ${error.message}`)
            }

            // --- Roadmap Node Children (edges) ---
            // We'll always update if there are any changes, but only if changed
            const origEdges = originalRoadmap.flatMap(node =>
                node.children.map(child_id => ({
                    parent_id: node.id,
                    child_id,
                }))
            )
            const currEdges = roadmap.flatMap(node =>
                node.children.map(child_id => ({
                    parent_id: node.id,
                    child_id,
                }))
            )
            const edgeKey = (e: { parent_id: string; child_id: string }) => `${e.parent_id}|${e.child_id}`
            const origEdgeSet = new Set(origEdges.map(edgeKey))
            const currEdgeSet = new Set(currEdges.map(edgeKey))

            const toInsertEdges = currEdges.filter(e => !origEdgeSet.has(edgeKey(e)))
            const toDeleteEdges = origEdges.filter(e => !currEdgeSet.has(edgeKey(e)))

            if (toInsertEdges.length) {
                const { error } = await supabase.from('roadmap_node_children').insert(toInsertEdges)
                if (error) throw new Error(`Node children insert: ${error.message}`)
            }
            for (const edge of toDeleteEdges) {
                await supabase.from('roadmap_node_children')
                    .delete()
                    .eq('parent_id', edge.parent_id)
                    .eq('child_id', edge.child_id)
            }

            // --- Problem Categories (diff and only insert/delete links) ---
            const pcKey = (pc: { problem_id: number; category_id: string }) => `${pc.problem_id}|${pc.category_id}`
            const origPCSet = new Set(originalProblemCategories.map(pcKey))
            const currPCSet = new Set(problemCategories.map(pcKey))

            const toInsertPC = problemCategories.filter(pc => !origPCSet.has(pcKey(pc)))
            const toDeletePC = originalProblemCategories.filter(pc => !currPCSet.has(pcKey(pc)))

            if (toInsertPC.length) {
                const { error } = await supabase.from('problem_categories').insert(toInsertPC)
                if (error) throw new Error(`Problem categories insert: ${error.message}`)
            }
            for (const pc of toDeletePC) {
                await supabase.from('problem_categories')
                    .delete()
                    .eq('problem_id', pc.problem_id)
                    .eq('category_id', pc.category_id)
            }

            // ** After successful save, update "originals" **
            setOriginalProblemsById(new Map(problemsById))
            setOriginalCategories([...categories])
            setOriginalProblemCategories([...problemCategories])
            setOriginalRoadmap([...roadmap])
            setIsDirty(false)
            alert('✅ All changes saved successfully!')
            window.location.reload()
        } catch (err) {
            alert(`❌ Save failed: ${(err as Error).message}`)
        }
    }, [
        problemsById, roadmap, categories, problemCategories,
        originalProblemsById, originalCategories, originalProblemCategories, originalRoadmap,
    ])

    // ---- Context value ----
    return (
        <AdminDataContext.Provider value={{
            problemsById, setProblemsById,
            roadmap, setRoadmap,
            categories, setCategories,
            problemCategories, setProblemCategories,
            saveAll,
            isDirty, setIsDirty
        }}>
            {children}
        </AdminDataContext.Provider>
    )
}
