import { NextResponse } from 'next/server';
import prisma from "@/app/libs/prismadb";

interface QuizResult {
  score: number;
  level: string;
}

interface QuizUser {
  id: string;
}

interface RequestBody {
  user: QuizUser;
  result: QuizResult;
}

export async function POST(request: Request) {
  try {
    const { user, result }: RequestBody = await request.json();

    // Validate input
    if (!user?.id || result?.score === undefined || !result?.level) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const savedResult = await prisma.result.create({
      data: {
        userId: user.id,
        score: result.score,
        level: result.level,
      },
    });

    return NextResponse.json(savedResult, { status: 201 });

  } catch (error) {
    console.error('Failed to save result:', error);
    return NextResponse.json(
      { error: 'Failed to save result' },
      { status: 500 }
    );
  }
}