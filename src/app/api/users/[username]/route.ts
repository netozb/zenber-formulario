import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: { username: string } }
) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      posts: {
        include: { likes: { select: { userId: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { followers: true, following: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const { password, ...safe } = user;
  return NextResponse.json(safe);
}
