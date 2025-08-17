import Link from 'next/link'
import Footer from '@/components/nav/Footer'
import VantaBackground from '@/components/client/VantaBackground'

export const metadata = {
  title: 'Quantapus',
}

export default function Home() {
  return (
    <>
      <VantaBackground />

      {/* BOX */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div
          className="
            pointer-events-auto
            max-w-xl w-[92vw] px-12 py-9
            rounded-3xl
            shadow-2xl
            bg-[#24252a]/90
            border border-[var(--qp1)]/60
            flex flex-col items-center
            text-center
          "
          style={{
            boxShadow: '0 0 28px 0 #var(--qp1)80',
            borderWidth: '2px',
            borderStyle: 'solid',
          }}
        >
          <h1 className="font-extrabold text-white text-fluid-xl select-none text-center">
            Quantapus
          </h1>

          <p className="mt-2 text-fluid-small font-semibold text-white/80 drop-shadow-xl text-center leading-tight">
            The complete{' '}
            <Link
              href="/roadmap"
              className="
                inline-flex items-baseline gap-1 font-bold
                underline decoration-transparent underline-offset-4
                hover:decoration-current hover:text-white transition-colors
              "
              prefetch
            >
              <span className="bg-gradient-to-r from-[#48e0ff] to-[#36ffc1] bg-clip-text text-transparent animate-gradient">
                Roadmap
              </span>
            </Link>{' '}
            to the
            <span className="font-extrabold text-white/90"> <br></br><em>Quantitative Finance Interview</em></span>
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-9 pt-[92vh]">
        <Footer />
      </div>
    </>
  )
}
