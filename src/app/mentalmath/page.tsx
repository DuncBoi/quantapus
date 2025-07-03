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
    <div className="w-[95vw] mx-auto py-8">
    {/* Outer Card */}
    <div className="bg-zinc-900/90 rounded-3xl shadow-2xl border border-zinc-800 p-8 flex flex-col md:flex-row gap-8 items-start">
  
      {/* Left: Title and Description */}
      <div className="flex-1 min-w-[200px]">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-blue-400 to-green-400 text-transparent bg-clip-text mb-1">
          {title}
        </h1>
        <p className="mb-4 text-lg text-zinc-400 max-w-2xl">{description}</p>
      </div>
  
      {/* Right: MathQuiz, top-aligned */}
      <div className="flex-1 flex justify-end items-start w-full">
        <MathQuiz generatorIds={generator_ids} digitChoices={digit_choices ?? {}} />
      </div>
    </div>
  </div>
  )
}
