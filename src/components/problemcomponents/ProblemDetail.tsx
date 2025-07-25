'use client'

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react'
import 'katex/dist/katex.min.css'
// @ts-expect-error katex insertion
import renderMathInElement from 'katex/dist/contrib/auto-render.mjs'
import { useData } from '@/context/DataContext'
import Checkmark from './Checkmark'
import DifficultyBadge from './DifficultyBadge'
import { useCategories, useProblemCategories } from '@/context/DataContext'
import CategoryPill from './CategoryPill'

const delimiters = [
  { left: '$$', right: '$$', display: true },
  { left: '$',  right: '$',  display: false },
  { left: '\\[', right: '\\]', display: true },
  { left: '\\(', right: '\\)', display: false },
]

function injectAndRender(el: HTMLDivElement | null, html: string | undefined) {
  if (!el) return
  el.innerHTML = html ?? ''
  renderMathInElement(el, { delimiters })
}

interface ProblemDetailProps {
  problemId: string
}

export default function ProblemDetail({ problemId }: ProblemDetailProps) {
  const { problemsById } = useData()
  const problem = problemsById.get(Number(problemId))
  const categories = useCategories()
  const problemCategories = useProblemCategories()
  const problemCategoryIds = problemCategories
  .filter(pc => pc.problem_id === problem?.id)
  .map(pc => pc.category_id)

  const problemCategoryNames = categories
  .filter(cat => problemCategoryIds.includes(cat.id))
  .map(cat => cat.id) // Or cat.name

  const descRef = useRef<HTMLDivElement>(null)
  const solRef  = useRef<HTMLDivElement>(null)
  const expRef  = useRef<HTMLDivElement>(null)

  const [showSolution, setShowSolution] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // reset solution toggle when problem changes
  useEffect(() => setShowSolution(false), [problemId])
  useEffect(() => setIsMounted(true), [])

  useLayoutEffect(() => {
    if (!problem) return
    injectAndRender(descRef.current, problem.description)
  }, [problem])

  useLayoutEffect(() => {
    if (!problem || !showSolution) return
    injectAndRender(solRef.current, problem.solution)
    injectAndRender(expRef.current, problem.explanation)
  }, [problem, showSolution])

  if (!problem) return <p className="text-white p-4">Problem not found.</p>

  return (
    <div
      id="problem-details"
      className="max-w-[95%] mx-auto my-[10px] p-[30px] bg-[#2c2d33] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.3)] border-2 border-black"
    >
      {/* Title and checkmark */}
      <div className="flex justify-between items-center mb-[10px] title-container">
        <h1 id="problem-title" className="flex flex-wrap items-center text-fluid-large mb-[15px]">
          <span className="ml-[5px] mr-[15px]">
            <Checkmark problemId={problem.id} size={40} />
          </span>
          <span className="qp mr-[8px] font-extrabold">QP</span>
          <span
            className="
              inline-flex items-center justify-center
              text-white 
              pt-[6px] pr-[4px] pb-[4px] pl-[6px]
              border-[5px] border-[rgba(72,126,181,0.5)]
              rounded-[10px]
              transition duration-200 ease-in-out
              hover:bg-[rgba(72,126,181,0.25)]
              hover:border-[rgba(72,126,181,1)]
              hover:shadow-[0_0_12px_rgba(72,126,181,0.6)_inset,0_0_20px_rgba(72,126,181,0.4)_inset]
              hover:scale-105
            "
          >
            #{problem.id}
          </span>
          <span className="title-colon ml-[4px] mr-[4px]">:</span>
          <span className="ml-2 font-extrabold">{problem.title || 'Untitled'}</span>
        </h1>
      </div>

      {/* Difficulty & Category */}
     <div className="mb-[20px] meta-info flex items-center flex-wrap gap-3">
  <DifficultyBadge difficulty={problem.difficulty} />
  {problemCategoryNames.length > 0 && (
  <div className="flex gap-2 flex-wrap ml-2">
    {problemCategoryNames.map(cat => (
      <CategoryPill key={cat} category={cat} />
    ))}
  </div>
)}
</div>

      {/* DESCRIPTION */}
      <div
        ref={descRef}
        id="description"
        className="mb-[30px] text-fluid-small overflow-x-auto description"
      />

      {/* Show/Hide Solution Button */}
      <button
        id="solution-button"
        onClick={() => setShowSolution(s => !s)}
        className="block w-full text-center bg-[#487eb5] p-[15px] text-fluid-small font-bold text-white rounded-[50px] my-[20px] transition-all duration-300 ease-in-out solution-button hover:bg-[#487eb5]/80 cursor-pointer"
      >
        {showSolution ? 'Hide Solution' : 'Show Solution'}
      </button>

      {/* SOLUTION & EXPLANATION */}
      <div
        id="solution"
        style={{ display: showSolution ? 'block' : 'none' }}
        className="solution space-y-6 text-3xl"
      >
        {problem.solution && (
          <div
            ref={solRef}
            id="solution-code"
            className="text-[2rem] font-bold text-white mb-4 shadow-[0_4px_15px_rgba(0,0,0,0.5)] p-[20px] overflow-x-auto rounded-[12px] bg-[linear-gradient(135deg,rgba(30,30,30,0.95),rgba(50,50,60,0.9))] border-[3px] border-[rgba(255,255,255,0.05)]"
          />
        )}

        {showSolution && isMounted && problem.yt_link && problem.yt_link.trim() !== '' && (
          <div id="youtube-link" className="youtube-container mb-4">
            <iframe
              className="w-full h-[500px] rounded-lg shadow-lg"
              src={`${problem.yt_link}?enablejsapi=1&origin=${window.location.origin}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div
          ref={expRef}
          id="explanation"
          className="bg-black/20 p-[15px] rounded-[5px] shadow-[0_4px_8px_rgba(0,0,0,0.8)] w-full text-[1.7rem] mt-[2rem] overflow-x-auto overflow-y-hidden"
        />
      </div>
    </div>
  )
}
