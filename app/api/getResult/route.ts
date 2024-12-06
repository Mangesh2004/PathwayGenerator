import prisma from "@/app/libs/prismadb";
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // In Next.js 13+, we need to use URL to get search params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId parameter is required' },
        { status: 400 }
      );
    }

    const results = await prisma.result.findMany({
      where: {
        userId: userId
      },
    });

    if (!results) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ results });
    
  } catch (err) {
    console.error('Error fetching results:', err);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}