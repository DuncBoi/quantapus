"use client";
import { useState } from "react";

type QA = { question: string; answer: string };

export default function OnlineAssessment() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [qaList, setQaList] = useState<QA[]>([]);
  const [rawResult, setRawResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper: Parse GPT output into [{question, answer}, ...]
  function parseQuestionsAndAnswers(text: string): QA[] {
    const qaPairs: QA[] = [];
    const regex = /Q:\s*([\s\S]*?)\s*A:\s*([\s\S]*?)(?=\nQ:|\n*$)/g;
    let match;
    while ((match = regex.exec(text))) {
      qaPairs.push({ question: match[1].trim(), answer: match[2].trim() });
    }
    return qaPairs;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQaList([]);
    setRawResult("");
    const res = await fetch("/api/generate-oa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, numQuestions, difficulty }),
    });
    const data = await res.json();
    const result = data.result || "";
    setRawResult(result);
    // Try to parse Q/As, else fallback to showing the whole result
    const parsed = parseQuestionsAndAnswers(result);
    setQaList(parsed);
    setLoading(false);
  };

  return (
    <div className="my-20 max-w-xl mx-auto p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 rounded bg-zinc-800 text-white"
          placeholder="Enter topic (e.g. options pricing)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
        <input
          className="w-full p-2 rounded bg-zinc-800 text-white"
          type="number"
          min={1}
          max={20}
          placeholder="Number of questions"
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          required
        />
        <select
          className="w-full p-2 rounded bg-zinc-800 text-white"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <button
          className="w-full p-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
          type="submit"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Assessment"}
        </button>
      </form>

      {/* Display as structured list if parse successful, else fallback to raw output */}
      {rawResult && (
  <pre className="bg-zinc-900 text-zinc-100 p-4 mt-6 rounded-lg whitespace-pre-wrap">
    {rawResult}
  </pre>
)}
    </div>
  );
}
