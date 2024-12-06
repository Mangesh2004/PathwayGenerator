import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { chatSession } from "@/models/AiModel";

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'UserId parameter is required' },
                { status: 400 }
            );
        }

        // Fetch the user's latest result with questions
        const result = await prisma.result.findFirst({
            where: { userId },
            include: { questions: true },
            orderBy: { createdAt: "desc" },
        });

        if (!result) {
            return NextResponse.json({ success: false, error: "No results found." });
        }

        // AI prompt for pathway generation
        const prompt = `
      Based on the following quiz results and questions, generate a personalized learning pathway for this user.
      Course Name: ${result.courseName}
      Score: ${result.score}/10
      Level: ${result.level}
      Questions: ${JSON.stringify(result.questions)}

       Based on their performance, they have shown weaknesses in the following areas: <List of Weaknesses> and need improvement in: <Improvement Areas>. Please generate a highly personalized learning pathway to help them strengthen their knowledge.

Provide the pathway in the following structure:

Overview: Briefly summarize the user's weaknesses and learning goals.
Steps: Provide a stepwise learning plan that includes:
Resources to learn from (like books, videos, or practice platforms).
Specific topics to focus on at each step.
Approximate time commitment for each step.
Final Evaluation: Suggest a method to assess their progress after completing the pathway."
    `;

        const response = await chatSession.sendMessage(prompt);
        const pathway = await response.response.text();

        return NextResponse.json({ success: true, pathway });
    } catch (error) {
        console.error("Error generating pathway:", error);
        return NextResponse.json({ success: false, error: "Failed to generate pathway." });
    }
}
