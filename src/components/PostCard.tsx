"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  imageUrl: string;
  caption?: string | null;
  createdAt: string;
  author: { id: string; username: string; avatar?: string | null };
  likes: { userId: string }[];
}

export function PostCard({ post }: { post: Post }) {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = (session?.user as any)?.id;

  const [likes, setLikes] = useState(post.likes);
  const isLiked = likes.some((l) => l.userId === userId);
  const [loading, setLoading] = useState(false);

  async function toggleLike() {
    if (!session) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    const data = await res.json();
    if (data.liked) {
      setLikes([...likes, { userId: userId! }]);
    } else {
      setLikes(likes.filter((l) => l.userId !== userId));
    }
    setLoading(false);
  }

  return (
    <div className="bg-white border-b border-gray-200 mb-0">
      <div className="flex items-center p-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0">
          {post.author.username[0].toUpperCase()}
        </div>
        <Link href={`/profile/${post.author.username}`} className="font-semibold text-sm">
          {post.author.username}
        </Link>
      </div>

      <div className="relative w-full aspect-square bg-gray-100">
        <img
          src={post.imageUrl}
          alt={post.caption || "Foto"}
          className="w-full h-full object-cover"
          onDoubleClick={toggleLike}
        />
      </div>

      <div className="p-3">
        <button
          onClick={toggleLike}
          disabled={loading}
          className={`transition-transform ${loading ? "opacity-50" : "active:scale-125"}`}
          aria-label={isLiked ? "Descurtir" : "Curtir"}
        >
          {isLiked ? (
            <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          )}
        </button>
        <p className="text-sm font-semibold mt-1">
          {likes.length} {likes.length === 1 ? "curtida" : "curtidas"}
        </p>
        {post.caption && (
          <p className="text-sm mt-1">
            <Link href={`/profile/${post.author.username}`} className="font-semibold mr-1">
              {post.author.username}
            </Link>
            {post.caption}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
          {new Date(post.createdAt).toLocaleDateString("pt-BR")}
        </p>
      </div>
    </div>
  );
}
