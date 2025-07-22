'use client'
import Link from "next/link"

export default function PrivacyPolicy() {
  return (
    <div className="max-w-[95%] mx-auto my-30 p-8 bg-[#24252A] text-[#e0e0e0] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.7)] leading-[1.75]">
      <h1 className="text-[2.5rem] mb-6 text-white border-b-2 border-[#333] pb-2 font-bold">
        Privacy Policy
      </h1>
      <p className="mb-5">Effective date: April 18, 2025</p>
      <p className="mb-5">
        Quantapus (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website{' '}
        <a href="https://quantapus.com" className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition" target="_blank">https://quantapus.com</a>{' '}
        (the &quot;Service&quot;). This page explains how we handle personal data in compliance with the General Data Protection Regulation (GDPR).
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">1. What Data We Access and Store</h2>
      <p className="mb-5">When you use the Service, we access and process limited personal data:</p>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3"><b>Completed Problems</b> – Stored on our servers so that you can track your progress through our content.</li>
        <li className="mb-3"><b>Name and email address</b> – Accessed via Google Authentication during your session, but <b>not stored</b> by us.</li>
      </ul>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">2. Why We Access Your Data</h2>
      <p className="mb-5">The personal data accessed via Google Authentication is used only for:</p>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3">Displaying your course progress</li>
        <li className="mb-3">Identifying your account within the session</li>
      </ul>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">3. Legal Basis for Processing</h2>
      <p className="mb-5">We process your data based on your explicit consent, which you provide when signing up and logging in through Google Authentication. You can withdraw this consent at any time by logging out or deleting your account.</p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">4. Cookies and Analytics</h2>
      <p className="mb-5">We use cookies and third-party analytics tools to understand how users interact with the platform. These tools collect anonymized usage data:</p>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3"><a href="https://policies.google.com/privacy" target="_blank" className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition">Google Analytics</a></li>
        <li className="mb-3"><a href="https://clarity.microsoft.com/terms" target="_blank" className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition">Microsoft Clarity</a></li>
      </ul>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">5. Data Sharing</h2>
      <p className="mb-5">We do not share personal data with any third parties for marketing or profiling. The only data accessed is through secure third-party tools for analytics, as listed above.</p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">6. User Rights</h2>
      <p className="mb-5">Under GDPR, you have the right to:</p>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3">Access the data being processed</li>
        <li className="mb-3">Request deletion of your data</li>
        <li className="mb-3">Withdraw consent</li>
      </ul>
      <p className="mb-5">
        You can manage your account or delete your data by visiting <a href="https://quantapus.com/account" className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition" target="_blank">https://quantapus.com/account</a>.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">7. Security Measures</h2>
      <p className="mb-5">We protect user data using:</p>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3">HTTPS encryption</li>
        <li className="mb-3">Google Authentication</li>
        <li className="mb-3">Secure cloud infrastructure hosted on Amazon Web Services (AWS)</li>
        <li className="mb-3">Regular software updates and trusted third-party tools</li>
      </ul>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">8. International Data Transfers</h2>
      <p className="mb-5">Quantapus is based in the United States, and our website is operated from there. If you are accessing the Service from the European Economic Area (EEA), please be aware that your data may be transferred to and processed in the United States.</p>
      <p className="mb-5">
        We use trusted third-party services (such as Google, Microsoft, and Amazon Web Services) that comply with GDPR requirements for international data transfers, including the use of Standard Contractual Clauses (SCCs) approved by the European Commission.
      </p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">9. Changes to This Policy</h2>
      <p className="mb-5">We may update this Privacy Policy. If we do, a notification will be posted on our website. We encourage you to review this page periodically.</p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">10. Contact Us</h2>
      <p className="mb-5">If you have any questions or concerns about this Privacy Policy or wish to make a data request, please contact us at:</p>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3">Email: <a href="mailto:duncquantapus@gmail.com" className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition">duncquantapus@gmail.com</a></li>
        <li className="mb-3">Contact form: <a href="https://quantapus.com/contact" className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition" target="_blank">https://quantapus.com/contact</a></li>
      </ul>
    </div>
  )
}
