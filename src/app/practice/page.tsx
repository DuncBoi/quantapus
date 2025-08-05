// app/practice/page.tsx

export default function PracticePage() {
    const features = [
      { label: "Mental Math" },
      { label: "Flashcards" },
      { label: "Online Assessment" },
      { label: "Live Interview" },
    ];
  
    return (
      <div className="my-20 w-full flex items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-5xl p-8">
          {features.map(({ label }) => (
            <div
              key={label}
              className="rounded-3xl bg-zinc-900 shadow-2xl flex items-center justify-center text-4xl font-bold text-white h-64 hover:scale-105 transition-transform duration-300 cursor-pointer select-none border border-zinc-800"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }
  