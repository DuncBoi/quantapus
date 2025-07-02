import MathQuiz from "@/components/MathQuiz"

export default function MMPage() {
  // pick whichever generators you want on /mm:
  const generatorIds = ['add2', 'add3', 'mult2']

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Mixed Number Quiz</h1>
      <MathQuiz />
    </div>
  )
}
