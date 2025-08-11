import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPolicy() {
  return (
    <div className="max-w-[95%] mx-auto mt-25 mb-5 p-8 bg-[var(--bg)] text-[#e0e0e0] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.7)] leading-[1.75]">
      <h1 className="text-[2.5rem] mb-6 text-white border-b-2 border-[#333] pb-2 font-bold">
        Privacy Policy
      </h1>
      <p className="mb-5">Effective date: August 10, 2025</p>

      <p className="mb-5">
        Quantapus (“we”, “us”, “our”) operates{' '}
        <Link href="https://quantapus.com" target="_blank" rel="noreferrer"
          className="text-[var(--qp1)] border-b border-dashed border-[var(--qp1)] hover:text-[#90c7ff] hover:border-b-solid transition">
          https://quantapus.com
        </Link>. This Privacy Policy explains what we collect, why we collect it, how it’s used, and the choices you have. We build on modern, privacy-respecting services: the app is hosted on <b>Vercel</b> and data is stored in <b>Supabase</b>. Authentication is via <b>Google Sign-In (OAuth)</b>. We also use <b>Google Analytics</b>, <b>Microsoft Clarity</b>, and <b>Vercel Analytics / Speed Insights</b> to understand product usage and performance.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[var(--qp1)] pl-3 font-bold">1. Data We Collect</h2>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3">
          <b>Account & Auth</b> — When you sign in with Google, we receive your basic profile info (name and email). We use this to identify your account. We do not sell or rent this data.
        </li>
        <li className="mb-3">
          <b>Progress Data</b> — We store problem completion state and simple progress metrics (e.g., streak counts) tied to your account so you can track your learning over time.
        </li>
        <li className="mb-3">
          <b>Usage & Performance</b> — Analytics tools (Google Analytics, Microsoft Clarity, Vercel Analytics, Vercel Speed Insights) collect pseudonymous data such as page views, navigation events, device/browser info, approximate location derived from IP, referrers, Web Vitals (LCP, FID/INP, CLS, etc.), and session replays/heatmaps (for Clarity). These help us debug UX and improve reliability.
        </li>
        <li className="mb-3">
          <b>Technical Logs</b> — Our hosts and edge network may keep transient logs (e.g., IP address, user-agent, request URLs) for security and debugging. We do not attempt to associate these logs to your learning data except to mitigate abuse or troubleshoot issues.
        </li>
      </ul>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[var(--qp1)] pl-3 font-bold">2. How We Use Data</h2>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3">Authenticate you and keep your session active (Google OAuth via Supabase Auth).</li>
        <li className="mb-3">Persist your completed problems, streaks, and related learning state in Supabase.</li>
        <li className="mb-3">Measure product usage and performance (Google Analytics, Vercel Analytics, Vercel Speed Insights).</li>
        <li className="mb-3">Improve UX via anonymized session analysis (Microsoft Clarity) and Web Vitals diagnostics (Speed Insights).</li>
        <li className="mb-3">Maintain security, prevent abuse, and debug issues.</li>
      </ul>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[var(--qp1)] pl-3 font-bold">3. Legal Bases</h2>
      <p className="mb-5">
        We rely on: (a) <b>consent</b> for analytics/telemetry and sign-in; (b) <b>contract/legitimate interests</b> to provide the Service (store progress, maintain security, fix bugs). You can withdraw consent for analytics by using content blockers or disabling cookies; you can withdraw sign-in consent by logging out or deleting your account.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[var(--qp1)] pl-3 font-bold">4. Cookies & Analytics</h2>
      <p className="mb-5">We use cookies and similar tech for authentication and analytics:</p>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3">
          <b>Google Analytics</b> — usage metrics and events.{' '}
          <Link href="https://policies.google.com/privacy" target="_blank" rel="noreferrer"
            className="text-[var(--qp1)] border-b border-dashed border-[var(--qp1)] hover:text-[#90c7ff] hover:border-b-solid transition">Privacy</Link>
        </li>
        <li className="mb-3">
          <b>Microsoft Clarity</b> — anonymized session replays/heatmaps to improve UX.{' '}
          <Link href="https://clarity.microsoft.com/terms" target="_blank" rel="noreferrer"
            className="text-[var(--qp1)] border-b border-dashed border-[var(--qp1)] hover:text-[#90c7ff] hover:border-b-solid transition">Terms</Link>
        </li>
        <li className="mb-3">
          <b>Vercel Analytics & Speed Insights</b> — Web Vitals, performance timings, and aggregated traffic metrics collected on our Vercel deployment.{' '}
          <Link href="https://vercel.com/docs/analytics" target="_blank" rel="noreferrer"
            className="text-[var(--qp1)] border-b border-dashed border-[var(--qp1)] hover:text-[#90c7ff] hover:border-b-solid transition">Learn more</Link>
        </li>
      </ul>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[var(--qp1)] pl-3 font-bold">5. Where Your Data Lives</h2>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3"><b>Hosting</b> — The app runs on <b>Vercel</b>.</li>
        <li className="mb-3"><b>Database & Auth</b> — <b>Supabase</b> stores your progress (e.g., completed problems, streaks) and manages Google OAuth.</li>
        <li className="mb-3"><b>Analytics</b> — Google Analytics, Microsoft Clarity, and Vercel Analytics/Speed Insights collect pseudonymous usage/performance data.</li>
      </ul>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[var(--qp1)] pl-3 font-bold">6. Data Sharing</h2>
      <p className="mb-5">
        We do not sell your personal data. We share data only with the processors listed above to run the Service (hosting, database, auth, analytics). Access is role-restricted and logged where supported.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[var(--qp1)] pl-3 font-bold">7. Retention</h2>
      <p className="mb-5">
        Account and progress data remain until you delete your account or request deletion. Technical logs and analytics are retained according to each provider’s policies. If you want us to remove your account and associated records, see “Your Rights” below.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[var(--qp1)] pl-3 font-bold">8. International Transfers</h2>
      <p className="mb-5">
        Our providers may process data in multiple regions (including the U.S.). Where applicable, transfers rely on safeguards like Standard Contractual Clauses or equivalent mechanisms maintained by our providers.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[var(--qp1)] pl-3 font-bold">9. Security</h2>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3">Transport security (HTTPS) and modern TLS.</li>
        <li className="mb-3">Provider-level controls from Vercel and Supabase (isolation, access controls, managed patches).</li>
        <li className="mb-3">Least-privilege access to data and operational logs for maintenance and support.</li>
      </ul>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[var(--qp1)] pl-3 font-bold">10. Your Rights</h2>
      <p className="mb-5">
        Depending on your location, you may have rights to access, correct, export, object to, limit, or delete your data. You can manage most settings in your account page or contact us for specific requests. Deleting your account removes your progress data from Supabase.
      </p>
      <p className="mb-5">
        Manage your account at{' '}
        <Link href="https://quantapus.com/account" target="_blank" rel="noreferrer"
          className="text-[var(--qp1)] border-b border-dashed border-[var(--qp1)] hover:text-[#90c7ff] hover:border-b-solid transition">
          https://quantapus.com/account
        </Link>.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[var(--qp1)] pl-3 font-bold">11. Open Source & Transparency</h2>
      <p className="mb-5">
        Quantapus is open source. You can review our code and file issues here:{' '}
        <Link href="https://github.com/DuncBoi/quantapus" target="_blank" rel="noreferrer"
          className="text-[var(--qp1)] border-b border-dashed border-[var(--qp1)] hover:text-[#90c7ff] hover:border-b-solid transition">
          GitHub Repository
        </Link>.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[var(--qp1)] pl-3 font-bold">12. Changes to This Policy</h2>
      <p className="mb-5">
        We may update this policy as we ship new features or adopt new providers. We’ll update the “Effective date” at the top and, when changes are material, we’ll provide an in-app notice.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[var(--qp1)] pl-3 font-bold">13. Contact</h2>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3">
          Email:{' '}
          <Link href="mailto:duncquantapus@gmail.com" target="_blank" rel="noreferrer"
            className="text-[var(--qp1)] border-b border-dashed border-[var(--qp1)] hover:text-[#90c7ff] hover:border-b-solid transition">
            duncquantapus@gmail.com
          </Link>
        </li>
        <li className="mb-3">
          Contact form:{' '}
          <Link href="https://quantapus.com/contact" target="_blank" rel="noreferrer"
            className="text-[var(--qp1)] border-b border-dashed border-[var(--qp1)] hover:text-[#90c7ff] hover:border-b-solid transition">
            https://quantapus.com/contact
          </Link>
        </li>
      </ul>

      <p className="text-sm text-[#b8c1cc]">
        This page is for transparency; it is not legal advice. If you have questions about how your data is handled, please reach out.
      </p>
    </div>
  )
}
