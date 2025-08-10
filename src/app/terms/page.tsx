import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service',
}

export default function TermsOfService() {
  return (
    <div className="max-w-[95%] mx-auto mt-25 mb-5 p-8 bg-[#1f1f24] text-[#e0e0e0] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.7)] leading-[1.75]">
      <h1 className="text-[2.5rem] mb-6 text-white border-b-2 border-[#333] pb-2 font-bold">
        Terms of Service
      </h1>

      <p className="mb-5">Effective date: August 10, 2025</p>

      <p className="mb-5">
        These Terms of Service (“Terms”) govern your use of{' '}
        <Link
          href="https://quantapus.com"
          target="_blank"
          rel="noreferrer"
          className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition"
        >
          https://quantapus.com
        </Link>{' '}
        (the “Service”), operated by Quantapus (“we,” “us,” “our”). By accessing or using the
        Service, you agree to these Terms and our{' '}
        <Link
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition"
        >
          Privacy Policy
        </Link>. If you do not agree, do not use the Service.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">1. What the Service Is</h2>
      <p className="mb-5">
        Quantapus is an educational platform with free resources to help users prepare for quantitative finance interviews.
        Materials include problem sets, explanations, and related content. An optional account lets you mark problems as
        completed and track progress.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">2. Eligibility</h2>
      <p className="mb-5">
        You must be at least 13 years old (or the minimum age in your jurisdiction) to use the Service. If you use the
        Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">3. Accounts & Security</h2>
      <p className="mb-5">
        Authentication is handled via Google Sign-In (OAuth) through Supabase. You are responsible for maintaining the
        confidentiality of your Google account and for all activities under it. If you believe your account has been
        compromised, contact us immediately and sign out of all sessions.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">4. Intellectual Property & License</h2>
      <p className="mb-5">
        All content on the Service—including problems, text, graphics, videos, and branding—is owned by Quantapus or its
        licensors and is protected by applicable laws. We grant you a limited, non-exclusive, non-transferable, revocable
        license to access and use the Service for your personal, non-commercial educational use. You may not copy,
        redistribute, or create derivative works from the content without our prior written permission.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">5. Acceptable Use</h2>
      <p className="mb-5">You agree not to:</p>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3">Violate any applicable laws or regulations.</li>
        <li className="mb-3">Attempt to gain unauthorized access to the Service, data, or underlying systems.</li>
        <li className="mb-3">Scrape, crawl, or spider the Service except as permitted by our robots.txt or with written consent.</li>
        <li className="mb-3">Interfere with or disrupt the integrity or performance of the Service (e.g., DDoS, exploitation attempts).</li>
        <li className="mb-3">Republish, resell, or commercially exploit content without permission.</li>
      </ul>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">6. Third-Party Services</h2>
      <p className="mb-5">
        The Service uses trusted providers: it is hosted on <b>Vercel</b>; authentication and database are provided by{' '}
        <b>Supabase</b>; and analytics/performance telemetry may be collected via <b>Google Analytics</b>,{' '}
        <b>Microsoft Clarity</b>, and <b>Vercel Analytics / Speed Insights</b>. Your use of the Service may therefore be
        subject to those providers’ terms and policies. See our{' '}
        <Link
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition"
        >
          Privacy Policy
        </Link>{' '}
        for details on what’s collected and why.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">7. Availability, Changes, and Beta Features</h2>
      <p className="mb-5">
        We continuously improve the Service and may add, modify, or remove features at any time without notice. We aim for
        high availability but do not guarantee uninterrupted or error-free operation. Beta or experimental features may be
        offered “as is” and can change or be discontinued at any time.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">8. No Professional or Investment Advice</h2>
      <p className="mb-5">
        The Service provides educational content only. Nothing on the Service constitutes financial, investment, or other
        professional advice. You are solely responsible for how you use the information provided.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">9. Warranty Disclaimer</h2>
      <p className="mb-5">
        THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING,
        WITHOUT LIMITATION, WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
        We do not warrant that the Service will be accurate, complete, reliable, current, secure, or uninterrupted.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">10. Limitation of Liability</h2>
      <p className="mb-5">
        TO THE FULLEST EXTENT PERMITTED BY LAW, QUANTAPUS AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS
        WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS
        OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF (OR INABILITY TO USE) THE SERVICE, EVEN IF
        ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. Our total liability for any claim will not exceed the amount you paid us
        (if any) in the 12 months preceding the event giving rise to the claim.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">11. Feedback</h2>
      <p className="mb-5">
        If you send ideas or suggestions, you grant us a worldwide, royalty-free, irrevocable, sublicensable license to use,
        modify, and incorporate them into the Service without restriction or compensation, and without any obligation of
        attribution or confidentiality.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">12. Termination</h2>
      <p className="mb-5">
        You may stop using the Service at any time. We may suspend or terminate access if you violate these Terms or misuse
        the Service. Upon termination, Sections intended to survive (e.g., IP ownership, disclaimers, limitations of
        liability) will continue to apply.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">13. Changes to These Terms</h2>
      <p className="mb-5">
        We may update these Terms as we ship new features or adopt new providers. We’ll update the “Effective date” at the
        top and, when changes are material, we’ll provide an in-app notice. Continued use after changes means you accept the
        updated Terms.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">14. Contact</h2>
      <p className="mb-5">Questions about these Terms?</p>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3">
          Email:{' '}
          <Link
            href="mailto:duncquantapus@gmail.com"
            target="_blank"
            rel="noreferrer"
            className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition"
          >
            duncquantapus@gmail.com
          </Link>
        </li>
        <li className="mb-3">
          Contact form:{' '}
          <Link
            href="https://quantapus.com/contact"
            target="_blank"
            rel="noreferrer"
            className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition"
          >
            https://quantapus.com/contact
          </Link>
        </li>
      </ul>

      <p className="text-sm text-[#b8c1cc]">
        This summary is for clarity and does not waive any rights not expressly stated here. This is not legal advice.
      </p>
    </div>
  )
}
