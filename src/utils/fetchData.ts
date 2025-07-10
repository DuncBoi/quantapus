import { createClient } from '@/utils/supabase/server'
import type { User } from '@supabase/supabase-js'
import type { Problem, SubcategoryRaw, NodeRaw, RoadmapNode } from '@/types/data'

export async function fetchData(): Promise<{
    user: User | null
    problemsById: Map<number, Problem>
    roadmap: RoadmapNode[]
    completedSet: Set<number>
}> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    const uid = user?.id

    const { data: problemsData, error } = await supabase
        .from('problems')
        .select('*')

    if (error) throw error

    const problems = (problemsData ?? []) as Problem[]

    const problemsById = new Map<number, Problem>()
    problems!.forEach(p => problemsById.set(p.id, p))

    const { data: rawNodesData, error: nErr } = await supabase
        .from('roadmap_nodes')
        .select(`
      id,
      label,
      position_x,
      position_y,
      styling,
      roadmap_subcategories (
        id,
        roadmap_node_id,
        order_index,
        problems ( id )
      )
    `)

    if (nErr) throw nErr

    const rawNodes = (rawNodesData ?? []) as NodeRaw[]

    const roadmap: RoadmapNode[] = rawNodes.map(node => ({
        id: node.id,
        label: node.label,
        positionX: node.position_x,
        positionY: node.position_y,
        styling: node.styling,
        subcategories: node.roadmap_subcategories.map(
            (sc: SubcategoryRaw) => ({
                id: sc.id,
                orderIndex: sc.order_index,
                problemIds: sc.problems.map(p => p.id),
            })
        ),
    }))

    let completedSet = new Set<number>()
    if (uid) {
      const { data: compRaw, error: cErr } = await supabase
        .from('completed_problems')
        .select('problem_id')
        .eq('user_id', uid)
      if (cErr) throw cErr
      const comp = (compRaw as { problem_id: number }[]) || []
      completedSet = new Set(comp.map((r) => r.problem_id))
    }
  
    return {
        user: user ?? null,
        problemsById,
        roadmap,
        completedSet
    }
}
