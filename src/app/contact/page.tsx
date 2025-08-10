export const metadata = {
  title: 'Contact',
}
export default function ContactPage() {
  return (
    <div className="max-w-[95%] mx-auto mt-25 mb-5 p-8 bg-[#1f1f24] text-[#e0e0e0] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.7)] leading-[1.75] contact-container">
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
      </div>
    </div>
  )
}
