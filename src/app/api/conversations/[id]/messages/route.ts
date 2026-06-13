import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    include: { sender: { select: { id: true, username: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const userId = (session.user as any).id;
  const { content } = await req.json();
  if (!content?.trim())
    return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });

  const conv = await prisma.conversation.findUnique({ where: { id: params.id } });
  if (!conv) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const receiverId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;

  const message = await prisma.message.create({
    data: { content, senderId: userId, receiverId, conversationId: params.id },
    include: { sender: { select: { id: true, username: true, avatar: true } } },
  });

  await prisma.conversation.update({
    where: { id: params.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(message);
}
