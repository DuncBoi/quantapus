'use client'

import Link from 'next/link'
import { Map, ListChecks } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return (
    <main className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-[#4848b5] via-[#48b5b5] to-[#e1fcff] items-center justify-center">
      <SectionLink
        title="Edit Roadmap"
        description="Create, update, and organize the roadmap nodes."
        href="/admin/roadmap"
        icon={<Map className="w-11 h-11 mb-3 text-[#4848b5] group-hover:text-[#48b5b5] transition-colors duration-300" />}
      />
      <SectionLink
        title="Edit Problems"
        description="Add and manage math problems and their solutions."
        href="/admin/problem"
        icon={<ListChecks className="w-11 h-11 mb-3 text-[#48b5b5] group-hover:text-[#4848b5] transition-colors duration-300" />}
      />
    </main>
  )
}

function SectionLink({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`
        flex-1 flex flex-col justify-center items-center
        min-h-[40vh] max-w-xl p-10
        bg-white/80 backdrop-blur-[2px]
        m-4 rounded-3xl shadow-xl
        hover:scale-[1.03] hover:shadow-2xl
        transition-all duration-300 group
        border border-transparent hover:border-[#48b5b5]
        outline-none focus-visible:ring-4 focus-visible:ring-[#48b5b5]
      `}
      tabIndex={0}
    >
      {icon}
      <h2 className="text-3xl font-bold mb-2 text-[#222]">{title}</h2>
      <p className="text-md text-[#444] opacity-80 text-center max-w-[22ch]">{description}</p>
    </Link>
  )
}
