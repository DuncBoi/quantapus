'use client'
import { useState, useEffect, useRef } from 'react'
import { loadGenerators, pickRandom } from '@/lib/generators'
import type { Equation } from '@/lib/generators/types'

interface MathQuizProps {
  generatorIds: string[]
}

export default function MathQuiz({ generatorIds }: MathQuizProps) {
  const [gens, setGens] = useState<Array<() => Equation>>([])
  const [eq,   setEq]   = useState<Equation|null>(null)
  const [input,  setInput]  = useState('')
  const [status, setStatus] = useState<'idle'|'correct'|'wrong'>('idle')
  const [score,  setScore]  = useState(0)
  const ref = useRef<HTMLInputElement>(null)

  // load only the requested modules on mount
  useEffect(() => {
    loadGenerators(generatorIds).then((loaded) => {
      setGens(loaded)
      const first = pickRandom(loaded)
      setEq(first)
      ref.current?.focus()
    })
  }, [generatorIds])

  // auto-check / advance
  useEffect(() => {
    if (!eq || status !== 'idle') return
    const ans = eq.answer.toString()
    if (input === ans) {
      setStatus('correct'); setScore(s=>s+1)
      setTimeout(() => {
        const next = pickRandom(gens)
        setEq(next); setInput(''); setStatus('idle')
        ref.current?.focus()
      }, 300)
    } else if (input.length >= ans.length) {
      setStatus('wrong'); setScore(s=>s-1)
      setTimeout(() => {
        setInput(''); setStatus('idle'); ref.current?.focus()
      }, 300)
    }
  }, [input, status, eq, gens])

  if (!eq) return <div className="p-8 text-center">Loading…</div>

  return (
    <div className="max-w-sm mx-auto p-6">
      <div className="text-lg font-bold mb-4">Score: {score}</div>
      <div className="text-3xl font-mono mb-6 text-center">
        {eq.question}
      </div>
      <input
        ref={ref}
        value={input}
        onChange={e=>setInput(e.target.value.trim())}
        className={`
          border-4 focus:outline-none px-3 py-2 w-full text-center
          transition-colors duration-200
          ${status==='correct'?'border-green-500'
            :status==='wrong'?'border-red-500'
            :'border-gray-300'}
        `}
        placeholder="Type your answer"
      />
    </div>
  )
}
