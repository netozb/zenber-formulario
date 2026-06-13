"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BottomNav } from "@/components/BottomNav";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setError("Cole uma URL de imagem");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, caption }),
    });
    if (res.ok) {
      router.push("/");
    } else {
      const d = await res.json();
      setError(d.error || "Erro ao publicar");
    }
    setLoading(false);
  }

  return (
    <div className="pb-16 max-w-lg mx-auto">
      <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-40">
        <h1 className="text-lg font-semibold">Nova Publicação</h1>
      </header>
      <main className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {imageUrl && (
            <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt="preview"
                className="w-full h-full object-cover"
                onError={() => setError("URL de imagem inválida")}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL da Imagem *
            </label>
            <input
              type="url"
              placeholder="https://exemplo.com/foto.jpg"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setError("");
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Legenda
            </label>
            <textarea
              placeholder="Escreva uma legenda..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white rounded py-2.5 text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}
