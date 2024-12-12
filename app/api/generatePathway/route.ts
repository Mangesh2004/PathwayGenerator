import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { chatSession } from "@/models/AiModel";

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const learningStyle = searchParams.get('learningStyle') || "Visual";

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
Generate a personalized learning pathway with specific resources based on the following quiz analysis and learning style:
Note I am rendering it on fronetend as well as making pdf of your response so dont dive me any unnessary symbols like ** or *. And on asked links include them in links format like [link](url).

Course: ${result.courseName}
Learning Style: ${learningStyle}
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

Please create a detailed learning pathway that provides resources specifically tailored to the user's learning style:

For each topic from incorrectly answered questions, provide:

1. VISUAL LEARNERS:
   - YouTube video tutorials with timestamps
   - Infographics and visual guides
   - Visual algorithm animations
   - Mind maps
   - Visual documentation
   - Include links for resourses if avilable

2. AUDITORY LEARNERS:
   - Podcast episodes
   - Audio lectures
   - Technical talks
   - Audiobook recommendations
   - Verbal explanations
   - Include links for resourses if avilable

3. KINESTHETIC LEARNERS:
   - Interactive coding problems (LeetCode/GeeksForGeeks)
   - Hands-on projects
   - Practice exercises
   - Debugging challenges
   - Implementation tasks
   - Include links for resourses if avilable

Format the response as:

LEARNING PATHWAY ANALYSIS
- Summary of quiz performance
- Key areas for improvement
- Learning style considerations

PERSONALIZED RESOURCES
1. [Topic 1]
   - Primary Resource (Based on learning style)
   - Secondary Resources
   - Practice Materials
   - Estimated completion time
   - Success metrics

2. [Topic 2]
   [Continue for each topic]

PRACTICE PLAN
- Recommended practice sequence
- Milestone checkpoints
- Self-assessment methods

Please ensure all resources are:
1. Relevant to the specific concepts missed in the quiz
2. Appropriate for the user's learning style
3. Ordered from fundamental to advanced concepts
4. Include estimated time commitments
5. Contain clear success criteria

For Visual Learners: Focus on video timestamps, diagrams, and visual explanations
For Auditory Learners: Focus on audio content and verbal explanations
For Kinesthetic Learners: Focus on interactive exercises and practical implementation
`;

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
