import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="nf-anim w-full min-h-[80vh] flex items-center justify-center">
      <div
        className="
          bg-[rgba(0,0,0,0.6)]
          px-12 py-8 md:px-12 md:py-8
          rounded-[16px]
          shadow-[0_8px_32px_rgba(0,0,0,0.7)]
          text-center max-w-[90%]
        "
      >
        <h1
          className="
            text-white m-0
            text-[6rem] leading-none
            drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]
          "
        >
          404
        </h1>
        <p className="text-[#ccc] mt-4 text-[1.125rem]">Page Not Found</p>
        <p className="text-[#ccc] mt-1 text-[1.125rem] italic">
          Sorry, we cannot find what you’re looking for.
        </p>

        <Link
          href="/"
          className="
            mt-6 inline-block
            px-8 py-3 text-white text-[1rem] font-medium
            rounded-[8px]
            bg-[linear-gradient(90deg,#61a9f1,#497db6)]
            shadow-[0_4px_12px_rgba(0,0,0,0.3)]
            transition-transform duration-200
            hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4)]
            active:translate-y-0 active:shadow-[0_3px_8px_rgba(0,0,0,0.2)]
          "
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
