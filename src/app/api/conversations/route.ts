import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const convs = await prisma.conversation.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    include: {
      user1: { select: { id: true, username: true, avatar: true } },
      user2: { select: { id: true, username: true, avatar: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(convs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const { targetUserId } = await req.json();
  if (userId === targetUserId)
    return NextResponse.json({ error: "Não é possível enviar mensagem para si mesmo" }, { status: 400 });

  const [u1, u2] = [userId, targetUserId].sort();

  const conv = await prisma.conversation.upsert({
    where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
    update: {},
    create: { user1Id: u1, user2Id: u2 },
    include: {
      user1: { select: { id: true, username: true, avatar: true } },
      user2: { select: { id: true, username: true, avatar: true } },
    },
  });
  return NextResponse.json(conv);
}
