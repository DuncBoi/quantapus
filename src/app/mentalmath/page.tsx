import MathQuiz from '@/components/MathQuiz'
import { createClient } from '@/utils/supabase/server'  // your SSR helper

// Make it fully static once built
export default async function MMPage({ searchParams }: { searchParams: { id?: string } }) {
  const sp = await searchParams
  const id = sp.id ?? '1'

  const supabase = await createClient()
  const { data: lesson, error } = await supabase
    .from('mental_math')
    .select('title, description, video, generator_ids, digit_choices')
    .eq('id', id)
    .single()

  if (error || !lesson) {
    return <div className="p-8 text-red-500">Lesson not found</div>
  }

  // 3) Destructure the fields
  const { title, description, video, generator_ids , digit_choices} = lesson

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="mb-6 text-gray-700">{description}</p>

      {/* Quiz: pass your DB-driven IDs here */}
      <MathQuiz
  generatorIds={generator_ids}
  digitChoices={digit_choices ?? {}}
/>
    </div>
  )
}
