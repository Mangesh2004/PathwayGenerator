import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const learningStyle = searchParams.get('learningStyle') || "Visual";

    if (!userId) {
      return NextResponse.json({ error: 'UserId required' }, { status: 400 });
    }

    const result = await prisma.result.findFirst({
      where: { userId },
      include: { questions: true },
      orderBy: { createdAt: "desc" },
    });

    if (!result) return NextResponse.json({ error: "No results found" }, { status: 404 });

    const incorrectQuestions = result.questions.filter(q => 
      q.userAnswer !== q.correctAnswer
    ).map(q => ({
      question: q.question,
      userAnswer: q.userAnswer,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty
    }));

    const difficultyBreakdown = result.questions.reduce((acc: Record<string, number>, q) => {
      const diff = q.difficulty.toLowerCase();
      acc[diff] = (acc[diff] || 0) + 1;
      return acc;
    }, {});

    const prompt = `
Generate a technical learning pathway analysis using this quiz data. Follow these rules:
- Plain text only, no markdown
- Structured in sections with line breaks
- Focus on actionable steps
- Include time estimates and success criteria

Course: ${result.courseName}

Quiz Results:
- Score: ${result.score}/10 (${result.level})
- Incorrect: ${incorrectQuestions.length}/${result.questions.length}
- Difficulties: ${Object.entries(difficultyBreakdown).map(([d,c]) => `${d}: ${c}`).join(', ')}


Specific Areas Needing Improvement:
${incorrectQuestions.map((q, i) => `
${i + 1}. Question: ${q.question}
   - User's Answer: ${q.userAnswer}
   - Correct Answer: ${q.correctAnswer}
   - Difficulty: ${q.difficulty}
`).join('\n')}

You have to provide the detailed test analysis on the Quiz results highlighting the incorrect answers and the correct answers and also the weaknesses of the user. The analysis should be structured in the following format:
- Current skills the user has
- Errors: Address mistakes
- Weaknesses: Areas to improve

You have to provide the detailed learning pathway for the user to improve his skills. The learning pathway should be structured in the following format:

Pathway Format:
1. Current trends in the tech market
2. Skills to learn
and go in details for each skill to learn


`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp-01-21' });
    const response = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of response.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(text));
          }
        } catch (error) {
          console.error('Stream error:', error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error("Error generating pathway:", error);
    return NextResponse.json({ error: "Failed to generate pathway" }, { status: 500 });
  }
}