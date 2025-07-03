import { createClient } from '@/utils/supabase/server'
import type { Node } from 'reactflow'
import RoadmapFlow from '@/components/RoadmapFlow'

export default async function RoadmapPage() {

  const supabase = await createClient()

  const { data: rows, error } = await supabase
    .from('roadmap_nodes')
    .select('id, label, position_x, position_y')

  if (error) {
    throw new Error('Failed to load roadmap nodes: ' + error.message)
  }

  const initialNodes: Node<{ label: string }>[]
    = (rows ?? []).map(r => ({
      id: r.id,
      type: 'roadmapNode',
      position: { x: r.position_x, y: r.position_y },
      data: { label: r.label },
    }))

  return (
    <div className="w-full h-screen">
      <RoadmapFlow initialNodes={initialNodes} />
    </div>
  )
}
