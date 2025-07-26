import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { fetchData } from '@/utils/fetchData'
import AdminSaveButton from '@/components/admin/AdminSaveButton'
import AdminClientLayout from './AdminClientLayout'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: userInfo, error } = await supabase
    .from('user_info')
    .select('power')
    .eq('id', user.id)
    .single()

  if (error || !userInfo || userInfo.power !== 'admin') {
    redirect('/')
  }

  const {
    problemsById,
    roadmap,
    categories,
    problemCategories
  } = await fetchData()

  return (
    <AdminClientLayout
      initialProblems={problemsById}
      initialRoadmap={roadmap}
      initialCategories={categories}
      initialProblemCategories={problemCategories}
    >
    <div className="min-h-screen bg-[#181a1b] pt-20">
      {/* --- Admin Nav Bar --- */}
      <nav className="bg-[#242b32] px-8 py-3 flex items-center border-b border-[#222] shadow-sm z-30">
        <span className="font-bold text-white text-xl tracking-wider mr-8">Admin Panel</span>
        <Link
          href="/admin/roadmap"
          className="text-gray-100 hover:text-blue-400 font-semibold mr-6 transition"
        >
          Roadmap Editor
        </Link>
        <Link
          href="/admin/problems"
          className="text-gray-100 hover:text-blue-400 font-semibold transition"
        >
          Problem Editor
        </Link>
        <AdminSaveButton/>
      </nav>
      {/* --- Page Content --- */}
      <main className="py-2 px-4">{children}</main>
    </div>
    </AdminClientLayout>
  )
}
