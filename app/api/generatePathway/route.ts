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

        const incorrectQuestions = result.questions.filter(q => 
            q.userAnswer !== q.correctAnswer
        ).map(q => ({
            question: q.question,
            userAnswer: q.userAnswer,
            correctAnswer: q.correctAnswer,
            difficulty: q.difficulty
        }));

        
        // Group questions by difficulty
        const difficultyBreakdown = result.questions.reduce((acc: any, q) => {
            const diff = q.difficulty.toLowerCase();
            acc[diff] = (acc[diff] || 0) + 1;
            return acc;
        }, {});

        // Generate detailed prompt
        const prompt = `
Generate a personalized learning pathway based on the following detailed quiz analysis:

Course: ${result.courseName}
Overall Performance:
- Score: ${result.score}/10
- Level: ${result.level}
- Questions answered incorrectly: ${incorrectQuestions.length}

Difficulty Distribution:
${Object.entries(difficultyBreakdown)
    .map(([diff, count]) => `- ${diff}: ${count} questions`)
    .join('\n')}

Specific Areas Needing Improvement:
${incorrectQuestions.map((q, i) => `
${i + 1}. Question: ${q.question}
   - User's Answer: ${q.userAnswer}
   - Correct Answer: ${q.correctAnswer}
   - Difficulty: ${q.difficulty}
`).join('\n')}

Please create a detailed learning pathway that:
1. Addresses each concept from the incorrectly answered questions
2. Provides specific resources and exercises for each topic
3. Structures the learning journey from fundamental to advanced concepts
4. Includes estimated time commitments for each learning step

Format the response as:

- Analysis of quiz performance
- Brief summary of main areas needing improvement
- Learning goals based on quiz performance

DETAILED LEARNING PLAN
1. [Topic from missed question]
   - Learning resources (videos, articles, practice problems)
   - Key concepts to master
   - Estimated time commitment
   - Practice exercises

2. [Next topic]
   [Continue for each major concept]

PROGRESS TRACKING
- Specific milestones to check understanding
- Suggested practice exercises
- Methods to verify improvement

Please ensure the pathway is practical and focuses specifically on the concepts the user struggled with in the quiz.`;


        const response = await chatSession.sendMessage(prompt);
        const pathway = await response.response.text();

        return NextResponse.json({ success: true, pathway, analysis: {
            incorrectQuestions,
            difficultyBreakdown
        } });
    } catch (error) {
        console.error("Error generating pathway:", error);
        return NextResponse.json({ success: false, error: "Failed to generate pathway." });
    }
}
