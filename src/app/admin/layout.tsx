import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

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

  return <>{children}</>
}
