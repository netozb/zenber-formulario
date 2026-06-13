import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { ProfileActions } from "./ProfileActions";
import Link from "next/link";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

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

  if (!user) notFound();

  const currentUserId = (session.user as any).id;
  const isOwn = user.id === currentUserId;

  const isFollowing =
    !isOwn &&
    (await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: user.id,
        },
      },
    })) !== null;

  return (
    <div className="pb-16 max-w-lg mx-auto">
      <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-40 flex items-center gap-3">
        <Link href="/" className="text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="font-semibold">{user.username}</h1>
      </header>

      <main>
        <div className="p-4">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex gap-6 text-center flex-1">
              <div>
                <div className="font-bold text-lg">{user.posts.length}</div>
                <div className="text-xs text-gray-500">publicações</div>
              </div>
              <div>
                <div className="font-bold text-lg">{user._count.followers}</div>
                <div className="text-xs text-gray-500">seguidores</div>
              </div>
              <div>
                <div className="font-bold text-lg">{user._count.following}</div>
                <div className="text-xs text-gray-500">seguindo</div>
              </div>
            </div>
          </div>

          {user.name && <p className="font-semibold text-sm">{user.name}</p>}
          {user.bio && <p className="text-sm text-gray-700 mt-1">{user.bio}</p>}

          <ProfileActions
            username={user.username}
            userId={user.id}
            isOwn={isOwn}
            initialFollowing={isFollowing}
          />
        </div>

        <div className="grid grid-cols-3 gap-0.5">
          {user.posts.map((post) => (
            <div
              key={post.id}
              className="aspect-square bg-gray-100 overflow-hidden"
            >
              <img
                src={post.imageUrl}
                alt={post.caption || ""}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {user.posts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
            <p className="text-sm font-medium">Sem publicações ainda</p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
