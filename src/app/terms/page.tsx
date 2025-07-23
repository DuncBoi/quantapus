'use client'

export default function TermsOfService() {
  return (
    <div className="max-w-[95%] mx-auto my-30 p-8 bg-[#24252A] text-[#e0e0e0] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.7)] leading-[1.75]">
      <h1 className="text-[2.5rem] mb-6 text-white border-b-2 border-[#333] pb-2 font-bold">
        Terms of Service
      </h1>
      <p className="mb-5">Effective date: April 18, 2025</p>
      <p className="mb-5">
        These Terms of Service (&quot;Terms&quot;) govern your use of our website at{' '}
        <a href="https://quantapus.com" className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition" target="_blank">https://quantapus.com</a>{' '}
        (the &quot;Service&quot;), operated by Quantapus (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
      </p>
      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">1. Acceptance of Terms</h2>
      <p className="mb-5">By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Service.</p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">2. Use of the Service</h2>
      <p className="mb-5">Quantapus is an educational platform that provides free resources to help users prepare for quantitative finance interviews. All course materials, videos, and educational content are publicly accessible. Users have the option to mark problems as &quot;completed&quot; to track their progress. To enable this feature, you may sign in using Google Authentication.</p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">3. User Accounts</h2>
      <p className="mb-5">You are responsible for maintaining the confidentiality of your Google account. We do not store your personal data or passwords — authentication is handled securely via Google.</p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">4. Intellectual Property</h2>
      <p className="mb-5">All content on Quantapus, including videos, text, graphics, and branding, is the intellectual property of Quantapus and may not be copied, redistributed, or reused without our written permission.</p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">5. Prohibited Use</h2>
      <p className="mb-5">When using the Service, you agree not to:</p>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3">Violate any laws or regulations</li>
        <li className="mb-3">Attempt to gain unauthorized access to the Service or its systems</li>
        <li className="mb-3">Distribute or misuse the content for commercial purposes without permission</li>
      </ul>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">6. No Warranties</h2>
      <p className="mb-5">The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We do not guarantee that the content is error-free, accurate, or always available. We may update or change content at any time.</p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">7. Limitation of Liability</h2>
      <p className="mb-5">To the fullest extent permitted by law, Quantapus will not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the Service or reliance on its content.</p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">8. Changes to the Terms</h2>
      <p className="mb-5">We may update these Terms from time to time. If we make changes, we will post a notice on our website. Your continued use of the Service means you accept the revised Terms.</p>

      <h2 className="text-[1.75rem] my-8 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">9. Contact</h2>
      <p className="mb-5">If you have any questions about these Terms, please contact us:</p>
      <ul className="list-[square] pl-6 mb-6">
        <li className="mb-3">Email: <a href="mailto:duncquantapus@gmail.com" className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition">duncquantapus@gmail.com</a></li>
        <li className="mb-3">Contact Form: <a href="https://quantapus.com/contact" className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition" target="_blank">https://quantapus.com/contact</a></li>
      </ul>
    </div>
  )
}
