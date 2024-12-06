import { NextResponse } from 'next/server';
import prisma from "@/app/libs/prismadb";

interface UserRequest {
  id: string;
  primaryEmailAddress?: {
    emailAddress: string;
  };
  fullName?: string;
}

export async function POST(request: Request) {
  try {
    const user: UserRequest = await request.json();

    // Validate required fields
    if (!user.id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || "",
      },
    });

    return NextResponse.json(newUser, { status: 201 });

  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}