export interface Problem {
  id: number
  title: string
  description: string
  solution?: string
  explanation?: string
  yt_link?: string
  difficulty?: string
  category?: string
  order_index?: number
  subcategory_id?: string
}

export interface SubcategoryRaw {
  id: number
  roadmap_node_id: number
  order_index: number
  problems: { id: number }[]
}

export interface NodeRaw {
  id: string
  label: string
  position_x: number
  position_y: number
  styling: string
  roadmap_subcategories: SubcategoryRaw[]
  children?: { child_id: string }[]
}

export interface Subcategory {
  id: number
  orderIndex: number
  problemIds: number[]
}

export interface RoadmapNode {
  id: string
  label: string
  positionX: number
  positionY: number
  styling: string
  subcategories: Subcategory[]
  children: string[]
}

