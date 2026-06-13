import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  if (!q) return NextResponse.json([]);

  const users = await prisma.user.findMany({
    where: { username: { contains: q } },
    select: { id: true, username: true, avatar: true, name: true },
    take: 10,
  });
  return NextResponse.json(users);
}
