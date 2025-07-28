import Link from 'next/link'
import type { Problem } from '@/types/data'
import Checkmark from './Checkmark'
import DifficultyBadge from './DifficultyBadge'

export default function ProblemCard({
    problem,
    variant = 'filter',
    query = '',
}: {
    problem: Problem
    variant?: 'roadmap' | 'filter'
    query?: string
}) {
    const href =
      variant === 'roadmap'
        ? `/problem/${problem.id}?list=roadmap`
        : (
            query
              ? `/problem/${problem.id}${query.startsWith('?') ? query : '?' + query}`
              : `/problem/${problem.id}`
          )

    return (
        <Link
            href={href}
            className="
                flex justify-between items-center p-[15px] my-1 mx-auto w-full
                bg-[#2c2d33] border-2 border-black rounded-lg
                transition-all duration-300 ease-in-out cursor-pointer
                hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)]
            "
        >
            <div className="flex items-center gap-[15px] min-w-0">
                <Checkmark problemId={problem.id} size={28} />
                <span
                    className="
                        inline-flex items-center justify-center
                        text-white text-fluid-small font-medium
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
                <span
                    className="text-white text-fluid-small font-extrabold max-w-[50vw] truncate min-w-0"
                    title={problem.title}
                >
                    {problem.title}
                </span>
            </div>
            <DifficultyBadge difficulty={problem.difficulty} />
        </Link>
    )
}
