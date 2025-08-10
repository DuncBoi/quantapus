import Link from 'next/link'
import type { Problem } from '@/types/data'
import Checkmark from './Checkmark'
import DifficultyBadge from './DifficultyBadge'

function isNoFilters(query: string) {
  if (!query) return true;
  const params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);
  const diff = params.get('difficulty');
  const cat = params.get('category');
  return (
    (!diff || diff === 'All') &&
    (!cat || cat === 'All') &&
    params.keys.length <= 2
  );
}

export default function ProblemCard({
  problem,
  variant = 'filter',
  query = '',
}: {
  problem: Problem
  variant?: 'roadmap' | 'filter'
  query?: string
}) {
  const noFilters = variant !== 'roadmap' && isNoFilters(query);
  const href =
    variant === 'roadmap'
      ? `/problem/${problem.id}?list=roadmap`
      : noFilters
        ? `/problem/${problem.id}`
        : `/problem/${problem.id}${query.startsWith('?') ? query : '?' + query}`;

  return (
    <div
      className="
        relative group/pill
        flex items-center gap-[5px] sm:gap-[15px] justify-between p-[15px] my-1 mx-auto w-full
        bg-[#2c2d33] border-2 border-black rounded-lg
        transition-all duration-400 ease-in-out
        hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)]
      "
    >
      {/* Full-card clickable overlay (handles nav + prefetch) */}
      <Link
        href={href}
        prefetch
        aria-label={`Open problem ${problem.id}: ${problem.title}`}
        className="absolute inset-0 z-10 rounded-lg"
      >
        <span className="sr-only">{problem.title}</span>
      </Link>

      {/* Checkmark sits ABOVE overlay; clicking it won't navigate */}
      <div className="relative z-20 flex-shrink-0">
        <Checkmark problemId={problem.id} size={28} />
      </div>

      {/* Middle content (visuals unchanged; overlay captures clicks) */}
      <div className="flex items-center min-w-0 flex-1">
        <span
          className="
            hidden sm:inline-flex items-center justify-center
            text-white text-fluid-small font-medium
            pt-[6px] pr-[4px] pb-[4px] pl-[6px]
            border-[5px] border-[rgba(72,126,181,0.5)]
            rounded-[10px]
            transition duration-400 ease-in-out
            group-hover/pill:bg-[rgba(72,126,181,0.25)]
            group-hover/pill:border-[rgba(72,126,181,1)]
            group-hover/pill:shadow-[0_0_12px_rgba(72,126,181,0.6)_inset,0_0_20px_rgba(72,126,181,0.4)_inset]
            group-hover/pill:scale-105
          "
        >
          #{problem.id}
        </span>
        <span
          className="text-white text-fluid-small font-extrabold max-w-[50vw] truncate min-w-0 ml-[5px] sm:ml-[15px]"
          title={problem.title}
        >
          {problem.title}
        </span>
      </div>

      <div className="relative z-10">
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>
    </div>
  )
}
