"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";

interface User {
  id: string;
  username: string;
  avatar?: string | null;
  name?: string | null;
}

export default function ExplorePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  async function startDM(userId: string) {
    if (!session) {
      router.push("/login");
      return;
    }
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });
    const conv = await res.json();
    router.push(`/messages/${conv.id}`);
  }

  return (
    <div className="pb-16 max-w-lg mx-auto">
      <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-40">
        <input
          type="text"
          placeholder="Buscar usuários..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none"
          autoFocus
        />
      </header>
      <main className="divide-y divide-gray-100">
        {loading && (
          <p className="text-center text-gray-400 text-sm py-8">Buscando...</p>
        )}
        {results.map((user) => (
          <div key={user.id} className="flex items-center justify-between px-4 py-3">
            <Link href={`/profile/${user.username}`} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">{user.username}</p>
                {user.name && <p className="text-gray-500 text-xs">{user.name}</p>}
              </div>
            </Link>
            {session && (session.user as any)?.name !== user.username && (
              <button
                onClick={() => startDM(user.id)}
                className="text-xs text-blue-500 border border-blue-400 rounded-lg px-3 py-1.5 font-medium"
              >
                Mensagem
              </button>
            )}
          </div>
        ))}
        {!loading && query && results.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">
            Nenhum usuário encontrado
          </p>
        )}
        {!query && (
          <p className="text-center text-gray-400 text-sm py-12">
            Digite para buscar usuários
          </p>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
