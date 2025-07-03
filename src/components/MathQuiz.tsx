'use client'
import { useState, useEffect, useRef } from 'react'
import { loadGeneratorsWithMeta, pickRandom } from '@/lib/generators'
import type { Equation } from '@/lib/generators/types'
import { Settings } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"; 
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface MathQuizProps {
  generatorIds: string[]
  digitChoices: Record<string, number[]>
}

export default function MathQuiz({ generatorIds, digitChoices }: MathQuizProps) {
  // State for per-generator: enabled & allowed digits
  const [generatorOptions, setGeneratorOptions] = useState<Record<string, { enabled: boolean; digits: number[] }>>({})
  // Generator metas: id, title, description, generate()
  const [generatorMetas, setGeneratorMetas] = useState<Record<string, { title: string; description: string }>>({})
  // Actual generators (functions)
  const [gens, setGens] = useState<Array<() => Equation>>([])
  const [eq, setEq] = useState<Equation | null>(null)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [score, setScore] = useState(0)
  const ref = useRef<HTMLInputElement>(null)
  const [elapsed, setElapsed] = useState(0)

  // (NEW) Initialize generatorOptions after digitChoices are loaded
  useEffect(() => {
    setGeneratorOptions(
      Object.fromEntries(
        generatorIds.map(id => [
          id,
          { enabled: true, digits: digitChoices[id]?.length ? [digitChoices[id][0]] : [2] }
        ])
      )
    )
  }, [generatorIds, digitChoices])

  // Load generator metadata on mount or when generatorIds changes
  useEffect(() => {
    // Fetch all metas, with default digits just for meta load
    const defaultDigitOptions: Record<string, number[]> = Object.fromEntries(generatorIds.map(id => [id, [2]]))
    loadGeneratorsWithMeta(generatorIds, defaultDigitOptions).then(metas => {
      setGeneratorMetas(
        Object.fromEntries(metas.map(m => [m.id, { title: m.title, description: m.description }]))
      )
    })
  }, [generatorIds])

  // Load selected generators/functions when options change
  useEffect(() => {
    const enabledIds = generatorIds.filter(id => generatorOptions[id]?.enabled)
    if (enabledIds.length === 0) {
      setGens([])
      setEq(null)
      return
    }
    // Prepare per-generator digit array mapping
    const digitOptions: Record<string, number[]> = {}
    enabledIds.forEach(id => {
      digitOptions[id] = generatorOptions[id]?.digits ?? (
        digitChoices[id]?.length ? [digitChoices[id][0]] : [2]
      )
    })
    loadGeneratorsWithMeta(enabledIds, digitOptions).then((metas) => {
      setGens(metas.map(m => m.generate))
      const first = pickRandom(metas.map(m => m.generate))
      setEq(first)
      ref.current?.focus()
    })
  }, [generatorIds, generatorOptions, digitChoices])

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(e => e + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const minutes = Math.floor(elapsed / 60)
  const seconds = (elapsed % 60).toString().padStart(2, '0')

  // Auto-check / advance
  useEffect(() => {
    if (!eq || status !== 'idle') return
    const ans = eq.answer.toString()
    if (input === ans) {
      setStatus('correct'); setScore(s => s + 1)
      setTimeout(() => {
        const next = pickRandom(gens)
        setEq(next); setInput(''); setStatus('idle')
        ref.current?.focus()
      }, 300)
    } else if (input.length >= ans.length) {
      setStatus('wrong'); setScore(s => s - 1)
      setTimeout(() => {
        setInput(''); setStatus('idle'); ref.current?.focus()
      }, 300)
    }
  }, [input, status, eq, gens])

  if (
    !eq
  ) {
    return <div className="p-8 text-center">Loading…</div>
  }

  // Toggle generator enabled
  const toggleGenerator = (id: string) => {
    setGeneratorOptions(opts => ({
      ...opts,
      [id]: {
        ...opts[id],
        enabled: !opts[id].enabled
      }
    }))
  }
  return (
<div className="flex flex-col w-full items-center">
    <div className="flex flex-col w-[95vw] max-w-xl p-6 rounded-3xl shadow-2xl bg-zinc-900 border border-zinc-800">
        {/* Topbar */}
        <div className="flex items-center justify-between bg-zinc-800 rounded-full px-5 py-2 mb-7 shadow-inner relative">
          {/* Score with animated "+1" or "-1" */}
          <div className="font-bold text-zinc-100 tracking-tight relative flex items-center min-w-[70px] justify-center">
            <span>Score: {score}</span>
            <AnimatePresence>
              {status === "correct" && (
                <motion.span
                  key="plus"
                  initial={{ y: 10, opacity: 0, scale: 0.9 }}
                  animate={{ y: -18, opacity: 1, scale: 1.2 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className="absolute left-1/2 -translate-x-1/2 text-green-400 font-bold text-lg drop-shadow"
                >
                  +1
                </motion.span>
              )}
              {status === "wrong" && (
                <motion.span
                  key="minus"
                  initial={{ y: 10, opacity: 0, scale: 0.9 }}
                  animate={{ y: -18, opacity: 1, scale: 1.2 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className="absolute left-1/2 -translate-x-1/2 text-red-400 font-bold text-lg drop-shadow"
                >
                  -1
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          {/* Stopwatch */}
          <div className="font-mono text-lg text-zinc-400">
            {minutes}:{seconds}
          </div>
          {/* Settings Icon */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-zinc-700 focus:outline-none transition"
                aria-label="Open settings"
              >
                <Settings className="w-6 h-6 text-zinc-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[18rem] max-w-[40rem] w-fit bg-zinc-900 border-zinc-700 text-zinc-100 shadow-lg rounded-xl"
            >
              <DropdownMenuLabel className="text-xs font-semibold tracking-wide text-zinc-400">
                Number Generation
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-700" />
              {generatorIds.length === 0 && (
                <DropdownMenuItem disabled className="text-zinc-500">
                  Nothing selected
                </DropdownMenuItem>
              )}
              {generatorIds.map(id => (
                <div key={id} className="px-2 pt-1">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={generatorOptions[id]?.enabled}
                      onChange={() => toggleGenerator(id)}
                      className="mr-2 h-3 w-3 accent-blue-500"
                      onClick={e => e.stopPropagation()}
                    />
                    <span className="text-sm font-normal">{generatorMetas[id]?.title ?? id}</span>
                    <div className="flex-1" />
                    <ToggleGroup
                      type="multiple"
                      value={generatorOptions[id]?.digits.map(String) ?? []}
                      onValueChange={vals => {
                        const digits = vals.map(Number)
                        setGeneratorOptions(opts => ({
                          ...opts,
                          [id]: { ...opts[id], digits: digits.length ? digits : [digitChoices[id]?.[0] ?? 2] }
                        }))
                      }}
                      className="flex gap-1 ml-4"
                    >
                      {(digitChoices[id] ?? [2, 3]).map(digit => (
                        <ToggleGroupItem
                          key={digit}
                          value={String(digit)}
                          className="px-2 py-1 h-7 text-xs rounded-full border bg-zinc-800 border-zinc-700 text-zinc-300
                            data-[state=on]:bg-blue-500 data-[state=on]:text-white data-[state=on]:border-blue-500 transition"
                          aria-label={`${digit}-digit`}
                        >
                          {digit}-digit
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                  <div className="ml-5 mt-1 mb-2 text-xs italic text-zinc-500 leading-snug break-words w-full max-w-[14rem]">
                    {generatorMetas[id]?.description ?? ''}
                  </div>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
  
        {/* Question Box Card with only outer border glow on status */}
        <motion.div
          key={status}
          initial={false}
          animate={{
            boxShadow:
              status === "correct"
                ? "0 0 12px 4px #22c55e88"
                : status === "wrong"
                ? "0 0 12px 4px #ef444488"
                : "0 1px 12px 0 #00000044",
            borderColor:
              status === "correct"
                ? "#22c55e"
                : status === "wrong"
                ? "#ef4444"
                : "#27272a",
          }}
          transition={{ type: "spring", stiffness: 210, damping: 26 }}
          className="rounded-2xl border bg-zinc-950/85 px-6 py-8 mb-2 flex flex-col items-center w-full"
        >
          <div className="text-4xl font-mono font-bold mb-7 text-center text-white tracking-tight">
            {eq.question}
          </div>
          <input
            ref={ref}
            value={input}
            onChange={e => setInput(e.target.value.trim())}
            className={`
              font-mono text-3xl text-center w-full max-w-xs px-6 py-3 rounded-full
              bg-zinc-900 text-white border-none outline-none
              focus:ring-2 focus:ring-blue-500
              transition-all duration-200
            `}
            placeholder="input"
            autoFocus
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </motion.div>
      </div>
    </div>
  );
}
