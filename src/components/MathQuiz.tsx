'use client'
import { useState, useEffect, useRef } from 'react'
import { loadGeneratorsWithMeta, pickRandom } from '@/lib/generators'
import type { Equation } from '@/lib/generators/types'
import { Settings } from 'lucide-react'
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
    <div className="max-w-sm mx-auto p-6">
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 mb-6">
        {/* Score */}
        <div className="font-bold text-gray-900 dark:text-gray-100">
          Score: {score}
        </div>

        {/* Stopwatch */}
        <div className="font-mono text-lg text-gray-700 dark:text-gray-300">
          {minutes}:{seconds}
        </div>

        {/* Settings Icon */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Open settings"
            >
              <Settings className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[18rem] max-w-[40rem] w-fit"
          >
            <DropdownMenuLabel className="text-xs font-semibold tracking-wide">
              Number Generation
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {generatorIds.length === 0 && (
              <DropdownMenuItem disabled>
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
                        className="px-1.5 py-0.5 h-6 text-[11px] rounded border data-[state=on]:bg-blue-100 data-[state=on]:border-blue-500"
                        aria-label={`${digit}-digit`}
                      >
                        {digit}-digit
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
                <div className="ml-5 mt-0.5 mb-2 text-xs italic text-gray-500 leading-snug break-words w-full max-w-[14rem]">
                  {generatorMetas[id]?.description ?? ''}
                </div>
              </div>
            ))}

          </DropdownMenuContent>

        </DropdownMenu>
      </div>

      {/* Question */}
      <div className="text-3xl font-mono mb-6 text-center">
        {eq.question}
      </div>
      <input
        ref={ref}
        value={input}
        onChange={e => setInput(e.target.value.trim())}
        className={`
          border-4 focus:outline-none px-3 py-2 w-full text-center
          transition-colors duration-200
          ${status === 'correct' ? 'border-green-500'
            : status === 'wrong' ? 'border-red-500'
              : 'border-gray-300'}
        `}
        placeholder="Type your answer"
      />
    </div>
  )
}
