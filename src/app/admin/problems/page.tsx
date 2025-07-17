'use client'
import { useState } from 'react'
import ProblemCard from '@/components/problemcomponents/ProblemCard'
import ProblemEditor from '@/components/admin/ProblemEditor'
import { useData } from '@/context/DataContext'

export default function AdminProblemPage() {
  const { problemsById } = useData()
  // SORT problems by id (number ascending)
  const allProblems = Array.from(problemsById.values()).sort((a, b) => a.id - b.id)

  const [modalOpen, setModalOpen] = useState(false)
  const [currentProblemId, setCurrentProblemId] = useState<number | undefined>(undefined)
  const [isNew, setIsNew] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')

  const handleEdit = (problemId: number) => {
    setCurrentProblemId(problemId)
    setIsNew(false)
    setModalOpen(true)
  }

  const handleCreate = () => {
    setCurrentProblemId(undefined)
    setIsNew(true)
    setModalOpen(true)
  }

  // Filter problems if searching
  const filteredProblems = allProblems.filter(p =>
    searchTerm === ''
      ? true
      : String(p.id).includes(searchTerm)
  )

  return (
    <main className="min-h-screen bg-[#222] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          className="bg-blue-600 text-white font-bold px-5 py-2 rounded mb-6 hover:bg-blue-700"
          onClick={handleCreate}
        >+ Create New Problem</button>
        <h1 className="text-3xl font-bold text-white mb-4">All Problems</h1>
        {/* Search Bar */}
        <div className="mb-6">
          <input
            className="w-full rounded border px-3 py-2 text-black text-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Search by Problem ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value.replace(/\D/g, ''))}
            type="text"
          />
        </div>
        <div className="space-y-4">
          {filteredProblems.map((problem) => (
            <div key={problem.id} className="relative flex items-center gap-3">
              <div className="flex-1"><ProblemCard problem={problem} /></div>
              <button
                className="bg-yellow-500 text-black px-3 py-1 rounded font-semibold mr-2"
                onClick={() => handleEdit(problem.id)}
              >Edit</button>
            </div>
          ))}
          {filteredProblems.length === 0 &&
            <div className="text-gray-300 text-lg mt-6 text-center">No problems found.</div>
          }
        </div>
      </div>

{modalOpen && (
  <ProblemEditor
    problemId={isNew ? undefined : currentProblemId}
    isNew={isNew}
    onClose={() => setModalOpen(false)}
  />
)}
    </main>
  )
}
