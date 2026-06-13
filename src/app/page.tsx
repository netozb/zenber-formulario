import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/PostCard";
import { BottomNav } from "@/components/BottomNav";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const posts = await prisma.post.findMany({
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      likes: { select: { userId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="pb-16 max-w-lg mx-auto">
      <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-40">
        <h1 className="text-2xl font-bold italic" style={{ fontFamily: "Georgia, serif" }}>
          Flash
        </h1>
      </header>
      <main>
        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Nenhuma foto ainda</p>
            <p className="text-sm mt-1">Seja o primeiro a publicar!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={{ ...post, createdAt: post.createdAt.toISOString() }}
            />
          ))
        )}
      </main>
      <BottomNav />
    </div>
  );
}
