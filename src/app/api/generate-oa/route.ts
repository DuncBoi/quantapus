import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { topic, numQuestions, difficulty } = await req.json();

  const prompt = `
Create a ${numQuestions}-question quantitative finance assessment on "${topic}".
Make it suitable for ${difficulty} level.
Format each question as:
Q: <question>
A: <answer>
Provide only the questions and their answers.
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert quant interviewer." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1200,
      temperature: 0.8,
    }),
  });

  // Log the raw OpenAI response for debugging
  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error:", errorText);
    return NextResponse.json({ result: `OpenAI API error: ${errorText}` }, { status: 500 });
  }

  const data = await response.json();
  console.log("RAW OPENAI COMPLETION:", JSON.stringify(data, null, 2));

  // Defensive: Check for choices
  const result = data.choices?.[0]?.message?.content;
  if (!result) {
    return NextResponse.json({ result: "No content returned from OpenAI." }, { status: 500 });
  }

  return NextResponse.json({ result });
}
