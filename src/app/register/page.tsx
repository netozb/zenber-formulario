"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao cadastrar");
    } else {
      router.push("/login");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 p-8 mb-3">
          <h1
            className="text-4xl font-bold text-center mb-3 italic"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Flash
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6 font-semibold">
            Cadastre-se para ver fotos dos seus amigos.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Nome de usuário"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              required
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white rounded py-2 text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
        </div>
        <div className="bg-white border border-gray-200 p-4 text-center text-sm">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-blue-500 font-semibold">
            Entre
          </Link>
        </div>
      </div>
    </div>
  );
}
