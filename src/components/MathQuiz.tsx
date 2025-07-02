// app/mm/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { generateRandom }            from '@/app/lib/generate'

export default function MMPage() {
  const generatorIds = ['add2','add3','mult2']
  const [eq,   setEq]    = useState<{question:string;answer:number} | null>(null)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle'|'correct'|'wrong'>('idle')
  const [score,  setScore]  = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // **only** run on the client, after mount
  useEffect(() => {
    setEq(generateRandom(generatorIds))
    inputRef.current?.focus()
  }, [])

  // auto-check
  useEffect(() => {
    if (!eq || status !== 'idle') return
    const ans = eq.answer.toString()
    if (input === ans) {
      setStatus('correct'); setScore(s=>s+1)
      setTimeout(() => {
        setEq(generateRandom(generatorIds))
        setInput(''); setStatus('idle')
        inputRef.current?.focus()
      }, 300)
    }
    else if (eq && input.length >= ans.length) {
      setStatus('wrong'); setScore(s=>s-1)
      setTimeout(() => {
        setInput(''); setStatus('idle')
        inputRef.current?.focus()
      }, 300)
    }
  }, [input, status, eq])

  if (!eq) return <div className="p-8 text-center">Loading…</div>

  return (
    <div className="max-w-sm mx-auto p-6">
      <div className="text-lg font-bold mb-4">Score: {score}</div>
      <div className="text-3xl font-mono mb-6 text-center">{eq.question}</div>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={e=>setInput(e.target.value.trim())}
        className={`
          border-4 focus:outline-none px-3 py-2
          w-full text-center text-xl font-mono
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
