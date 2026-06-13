import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { username, email, password } = await req.json();
  if (!username || !email || !password)
    return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing)
    return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, email, password: hashed },
  });
  return NextResponse.json({ id: user.id, username: user.username });
}
