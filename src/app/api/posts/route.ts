import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.post.findMany({
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      likes: { select: { userId: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { imageUrl, caption } = await req.json();
  if (!imageUrl)
    return NextResponse.json({ error: "Imagem obrigatória" }, { status: 400 });

  const userId = (session.user as any).id;
  const post = await prisma.post.create({
    data: { imageUrl, caption, authorId: userId },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      likes: { select: { userId: true } },
    },
  });
  return NextResponse.json(post);
}
