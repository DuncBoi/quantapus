import { createClient } from '@/utils/supabase/server'
import type { User } from '@supabase/supabase-js'
import type { Problem, SubcategoryRaw, NodeRaw, RoadmapNode } from '@/types/data'

export async function fetchData(): Promise<{
  user: User | null
  problemsById: Map<number, Problem>
  roadmap: RoadmapNode[]
  completedSet: Set<number>
  categories: { id: string }[]
  problemCategories: { problem_id: number, category_id: string }[]
  streakInfo: { streak: number, last_completed_at: string | null } | null
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

  const { data: categoriesData, error: catErr } = await supabase
    .from('categories')
    .select('*');
  if (catErr) throw catErr;
  const categories = categoriesData as { id: string }[];

  // Fetch problem_categories join table
  const { data: probCatData, error: pcErr } = await supabase
    .from('problem_categories')
    .select('*');
  if (pcErr) throw pcErr;
  const problemCategories = probCatData as { problem_id: number, category_id: string }[];

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
        more_info,
        construction,
        problems ( id )
      ),
      children:roadmap_node_children!rodemap_node_children_parent_id_fkey ( child_id )
    `)

  if (nErr) throw nErr

  const rawNodes = (rawNodesData ?? []) as NodeRaw[]

  const roadmap: RoadmapNode[] = rawNodes.map(node => ({
    id: node.id,
    label: node.label,
    positionX: node.position_x,
    positionY: node.position_y,
    styling: node.styling,
    subcategories: node.roadmap_subcategories
      .slice()
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((sc: SubcategoryRaw) => ({
        id: sc.id,
        orderIndex: sc.order_index,
        more_info: sc.more_info,
        construction: sc.construction,
        problemIds: sc.problems
          .slice()
          .sort((a, b) => {
            const pa = problemsById.get(a.id)
            const pb = problemsById.get(b.id)
            return (pa?.order_index ?? 9999) - (pb?.order_index ?? 9999)
          })
          .map(p => p.id),
      })),
    children: (node.children ?? []).map(c => c.child_id),
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

  let streakInfo = null
if (uid) {
  const { data: streakData, error: streakErr } = await supabase
    .from('user_info')
    .select('streak, last_completed_at')
    .eq('id', uid)
    .single()
  if (streakErr) throw streakErr
  streakInfo = streakData
}


  return {
    user: user ?? null,
    problemsById,
    roadmap,
    completedSet,
    categories,
    problemCategories,
    streakInfo
  }
}
