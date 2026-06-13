"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface Props {
  username: string;
  userId: string;
  isOwn: boolean;
  initialFollowing: boolean;
}

export function ProfileActions({ username, userId, isOwn, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggleFollow() {
    setLoading(true);
    const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
    const data = await res.json();
    setFollowing(data.following);
    setLoading(false);
    router.refresh();
  }

  async function startDM() {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });
    const conv = await res.json();
    router.push(`/messages/${conv.id}`);
  }

  if (isOwn) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full mt-3 border border-gray-300 rounded-lg py-1.5 text-sm font-semibold hover:bg-gray-50"
      >
        Sair
      </button>
    );
  }

  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={toggleFollow}
        disabled={loading}
        className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition-colors ${
          following
            ? "border border-gray-300 text-black hover:bg-gray-50"
            : "bg-blue-500 text-white hover:bg-blue-600"
        } disabled:opacity-50`}
      >
        {following ? "Seguindo" : "Seguir"}
      </button>
      <button
        onClick={startDM}
        className="flex-1 border border-gray-300 rounded-lg py-1.5 text-sm font-semibold hover:bg-gray-50"
      >
        Mensagem
      </button>
    </div>
  );
}
