import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  userAnswer: string; // Added user answer field
}

interface QuizData {
  userId: string;
  courseName: string;
  score: number;
  level: string;
  questions: QuizQuestion[]; // Changed from quiz to questions for consistency
}

export async function POST(request: NextRequest) {
  try {
    const data: QuizData = await request.json();
    const { userId, courseName, score, level, questions } = data;
    
    // Type-safe creation of result and nested questions
    const result = await prisma.result.create({
      data: {
        userId,
        courseName,
        score,
        level,
        questions: {
          create: questions.map((question) => ({
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            difficulty: question.difficulty,
            userAnswer: question.userAnswer, // Save user's answer
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({
      success: true,
      result
    }, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
  } catch (error) {
    console.error("Error saving results:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to save results."
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}