import MathQuiz from '@/components/problems/MathQuiz'
import { createClient } from '@/utils/supabase/server'

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function MMPage({ searchParams }: PageProps) {
  // Robust extraction of id param (support both string and array)
  const raw = searchParams?.id
  const id = Array.isArray(raw) ? raw[0] : raw ?? '1'

  const supabase = await createClient()
  const { data: lesson, error } = await supabase
    .from('mental_math')
    .select('title, description, video, generator_ids, digit_choices')
    .eq('id', id)
    .single()

  if (error || !lesson) {
    return <div className="p-8 text-red-500">Lesson not found</div>
  }

  const { title, description, video, generator_ids, digit_choices } = lesson

  return (
    <div className="w-[95vw] mx-auto py-8">
      <div className="bg-zinc-900/90 rounded-3xl shadow-2xl border border-zinc-800 p-8 flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-blue-400 to-green-400 text-transparent bg-clip-text mb-1">
            {title}
          </h1>
          <p className="mb-4 text-lg text-zinc-400 max-w-2xl">{description}</p>
        </div>
        <div className="flex-1 flex justify-end items-start w-full">
          <MathQuiz generatorIds={generator_ids} digitChoices={digit_choices ?? {}} />
        </div>
      </div>
    </div>
  )
}
