import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _: Request,
  { params }: { params: { username: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const followerId = (session.user as any).id;
  const target = await prisma.user.findUnique({
    where: { username: params.username },
  });
  if (!target)
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId: target.id },
    },
  });

  if (existing) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: { followerId, followingId: target.id },
      },
    });
    return NextResponse.json({ following: false });
  } else {
    await prisma.follow.create({ data: { followerId, followingId: target.id } });
    return NextResponse.json({ following: true });
  }
}
