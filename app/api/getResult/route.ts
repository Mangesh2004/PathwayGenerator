import prisma from "@/app/libs/prismadb";
import { NextApiRequest, NextApiResponse } from 'next';

export async function GET(request: Request, res: NextApiResponse) {
 

  const { userId } = await request.json();

  try {
    const results = await prisma.result.findMany({
      where: { userId: userId as string },
    });

    return res.status(200).json({ results });
  } catch (err) {
    console.error('Error fetching results:', err);
    return res.status(500).json({ error: 'Failed to fetch results' });
  }
}
