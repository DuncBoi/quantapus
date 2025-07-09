'use client'

import React, { useEffect, useRef, useState } from 'react'
import 'katex/dist/katex.min.css'
// @ts-ignore
import renderMathInElement from 'katex/dist/contrib/auto-render.mjs'
import { useRouter } from 'next/navigation'
import { useData } from '@/context/DataContext'
import Checkmark from './Checkmark'

const delimiters = [
  { left: '$$', right: '$$', display: true },
  { left: '$',  right: '$',  display: false },
  { left: '\[', right: '\]', display: true },
  { left: '\(', right: '\)', display: false },
]

interface ProblemDetailProps {
  problemId: string
}

export default function ProblemDetail({ problemId }: ProblemDetailProps) {
  const router = useRouter()
  const { problemsById } = useData()
  const problem = problemsById.get(Number(problemId))
  const containerRef = useRef<HTMLDivElement>(null)
  const [showSolution, setShowSolution] = useState(false)

  // Reset solution visibility on problem change
  useEffect(() => {
    setShowSolution(false)
  }, [problemId])

  // Early return if missing
  if (!problem) {
    return <p className="text-white p-4">Problem not found.</p>
  }

  // KaTeX render
  useEffect(() => {
    if (containerRef.current) {
      renderMathInElement(containerRef.current, { delimiters })
    }
  }, [problem.description, problem.solution, problem.explanation, showSolution])

  return (
    <div
      ref={containerRef}
      id="problem-details"
      className="max-w-[95%] mx-auto my-[30px] p-[30px] bg-[#2c2d33] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.3)] border-2 border-black"
    >
      {/* Title and checkmark */}
      <div className="flex justify-between items-center mb-[10px] title-container">
        <h1
          id="problem-title"
          className="flex items-center text-[3rem] mb-[15px]"
        >
          <span className="ml-[5px] mr-[15px]">
            <Checkmark problemId={problem.id} />
          </span>
          <span className="qp mr-[8px]">QP</span>
          <span className="problem-id text-[3rem]">#{problem.id}</span>
          <span className="title-colon ml-[4px] mr-[4px]">:</span>
          <span className="ml-2 font-extrabold">{problem.title || 'Untitled'}</span>
        </h1>
      </div>

      {/* Difficulty & Category */}
      <div className="mb-[20px] meta-info">
        <span
          id="difficulty"
          className="inline-block px-[14px] py-[6px] rounded-[12px] font-semibold text-[1.2rem] difficulty bg-gray-200"
        >
          {problem.difficulty || 'Unknown'}
        </span>
        <span id="category-container" className="inline ml-[12px]">
          {problem.category
            ?.split(',')
            .map((c, i, arr) => (
              <React.Fragment key={i}>
                <button
                  onClick={() =>
                    router.push(
                      `/problems?category=${encodeURIComponent(
                        c.trim()
                      )}`
                    )
                  }
                  className="inline-block italic font-semibold mr-1 text-[1.2rem] clickable-tag transition-colors duration-200 hover:underline hover:scale-105"
                >
                  {c.trim()}
                </button>
                {i < arr.length - 1 && ','}
              </React.Fragment>
            ))}
        </span>
      </div>

      {/* Description */}
      <div
        id="description"
        className="mb-[30px] text-[1.5rem] overflow-x-auto description"
      >
        <p>{problem.description || 'No description available.'}</p>
      </div>

      {/* Show/Hide Solution Button */}
      <button
        id="solution-button"
        onClick={() => setShowSolution((s) => !s)}
        className="block w-full text-center bg-[#487eb5] p-[15px] text-[20px] font-bold text-white rounded-[50px] my-[20px] transition-all duration-300 ease-in-out solution-button hover:bg-[#487eb5]/80"
      >
        {showSolution ? 'Hide Solution' : 'Show Solution'}
      </button>

      {/* Solution & Explanation */}
      <div
        id="solution"
        className={`${
          showSolution ? 'mb-0' : 'hidden'
        } solution space-y-6 text-3xl`}
      >
        {problem.solution && (
          <p
            id="solution-code"
            className="text-[2rem] font-bold text-white mb-4 shadow-[0_4px_15px_rgba(0,0,0,0.5)] p-[20px] overflow-x-auto rounded-[12px] bg-[linear-gradient(135deg,rgba(30,30,30,0.95),rgba(50,50,60,0.9))] border-[3px] border-[rgba(255,255,255,0.05)]"
          >
            {problem.solution}
          </p>
        )}

        {problem.yt_link && (
          <div id="youtube-link" className="youtube-container mb-4">
            <iframe
              className="w-full h-[315px] rounded-lg shadow-lg"
              src={`${problem.yt_link}?enablejsapi=1&origin=${window.location.origin}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <p
          id="explanation"
          className="bg-black/20 p-[15px] rounded-[5px] shadow-[0_4px_8px_rgba(0,0,0,0.8)] w-full text-[1.7rem] mt-[2rem] overflow-x-auto overflow-y-hidden"
        >
          {problem.explanation || 'No explanation available.'}
        </p>
      </div>
    </div>
  )
}
