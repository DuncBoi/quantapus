'use client'

export default function ContactPage() {
  return (
    <div className="max-w-[95%] mx-auto my-30 p-8 bg-[#24252A] text-[#e0e0e0] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.7)] leading-[1.75] contact-container">
      <h1 className="text-[2.5rem] mb-6 text-white border-b-2 border-[#333] pb-2 font-bold">
        Contact Us
      </h1>
      <div className="flex flex-wrap gap-8 contact-grid">
        <div className="flex-1 min-w-[220px] mb-6 contact-item">
          <h2 className="text-xl mb-2 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">Email</h2>
          <p className="mb-2">
            <a href="mailto:duncquantapus@gmail.com" className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition">duncquantapus@gmail.com</a>
          </p>
        </div>
        <div className="flex-1 min-w-[220px] mb-6 contact-item">
          <h2 className="text-xl mb-2 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">Phone</h2>
          <p className="mb-2">+1 (415) 465-3910</p>
        </div>
        {/* Uncomment to add more contact items
        <div className="flex-1 min-w-[220px] mb-6 contact-item">
          <h2 className="text-xl mb-2 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">Mailing Address</h2>
          <p className="mb-2">
            Quantapus, Inc.<br />
            123 Learning Lane<br />
            Knowledge City, KC 12345<br />
            United States
          </p>
        </div>
        <div className="flex-1 min-w-[220px] mb-6 contact-item">
          <h2 className="text-xl mb-2 text-white border-l-4 border-[#61a9f1] pl-3 font-bold">Follow Us</h2>
          <ul className="list-[square] pl-4 mb-2">
            <li className="mb-1">
              <a href="https://twitter.com/quantapus" target="_blank" className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition">Twitter</a>
            </li>
            <li className="mb-1">
              <a href="https://github.com/quantapus" target="_blank" className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition">GitHub</a>
            </li>
            <li className="mb-1">
              <a href="https://linkedin.com/company/quantapus" target="_blank" className="text-[#61a9f1] border-b border-dashed border-[#61a9f1] hover:text-[#90c7ff] hover:border-b-solid transition">LinkedIn</a>
            </li>
          </ul>
        </div>
        */}
      </div>
    </div>
  )
}
