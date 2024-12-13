import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "UserId parameter is required" },
        { status: 400 }
      );
    }

    const pathway = await prisma.pathway.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!pathway) {
      return NextResponse.json({ success: false, status: "pending" });
    }

    return NextResponse.json({ success: true, status: "completed", pathway: pathway.pathway });
  } catch (error) {
    console.error("Error fetching pathway status:", error);
    return NextResponse.json({ success: false, status: "error", error: "Failed to fetch pathway status." });
  }
}
