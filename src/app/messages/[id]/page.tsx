import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { MessageThread } from "./MessageThread";
import Link from "next/link";

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const userId = (session.user as any).id;

  const conv = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      user1: { select: { id: true, username: true } },
      user2: { select: { id: true, username: true } },
      messages: {
        include: { sender: { select: { id: true, username: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conv || (conv.user1Id !== userId && conv.user2Id !== userId)) {
    notFound();
  }

  const other = conv.user1Id === userId ? conv.user2 : conv.user1;

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      <header className="flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <Link href="/messages" className="text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {other.username[0].toUpperCase()}
        </div>
        <Link href={`/profile/${other.username}`} className="font-semibold text-sm">
          {other.username}
        </Link>
      </header>

      <MessageThread
        conversationId={conv.id}
        currentUserId={userId}
        initialMessages={conv.messages.map((m) => ({
          id: m.id,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
          senderId: m.senderId,
          sender: m.sender,
        }))}
      />
    </div>
  );
}
