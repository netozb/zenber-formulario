import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Criando usuários de teste...");

  const password = await bcrypt.hash("senha123", 12);

  const alice = await prisma.user.upsert({
    where: { email: "alice@zenber.com" },
    update: {},
    create: {
      username: "alice",
      email: "alice@zenber.com",
      password,
      name: "Alice Silva",
      bio: "Fotógrafa apaixonada 📷",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@zenber.com" },
    update: {},
    create: {
      username: "bob",
      email: "bob@zenber.com",
      password,
      name: "Bob Costa",
      bio: "Viajante do mundo 🌍",
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@zenber.com" },
    update: {},
    create: {
      username: "carol",
      email: "carol@zenber.com",
      password,
      name: "Carol Lima",
      bio: "Arte e natureza 🌿",
    },
  });

  console.log("Criando fotos...");

  const images = [
    { url: "https://picsum.photos/seed/zenber1/600/600", caption: "Dia lindo hoje ☀️", author: alice },
    { url: "https://picsum.photos/seed/zenber2/600/600", caption: "Minha cidade favorita 🏙️", author: bob },
    { url: "https://picsum.photos/seed/zenber3/600/600", caption: "Natureza incrível 🌿", author: carol },
    { url: "https://picsum.photos/seed/zenber4/600/600", caption: "Hora do café ☕", author: alice },
    { url: "https://picsum.photos/seed/zenber5/600/600", caption: "Por do sol perfeito 🌅", author: bob },
    { url: "https://picsum.photos/seed/zenber6/600/600", caption: "Flores do jardim 🌸", author: carol },
  ];

  const posts = [];
  for (const img of images) {
    const post = await prisma.post.create({
      data: { imageUrl: img.url, caption: img.caption, authorId: img.author.id },
    });
    posts.push(post);
  }

  console.log("Adicionando curtidas...");

  for (const [userId, postId] of [
    [bob.id, posts[0].id],
    [carol.id, posts[0].id],
    [alice.id, posts[1].id],
    [carol.id, posts[1].id],
    [alice.id, posts[2].id],
    [bob.id, posts[3].id],
    [carol.id, posts[4].id],
    [alice.id, posts[5].id],
  ]) {
    await prisma.like.upsert({
      where: { userId_postId: { userId, postId } },
      update: {},
      create: { userId, postId },
    });
  }

  console.log("Criando follows...");

  for (const [followerId, followingId] of [
    [alice.id, bob.id],
    [alice.id, carol.id],
    [bob.id, alice.id],
    [carol.id, alice.id],
  ]) {
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      update: {},
      create: { followerId, followingId },
    });
  }

  console.log("\n✅ Pronto! Contas de teste:");
  console.log("  alice@zenber.com  /  senha123");
  console.log("  bob@zenber.com    /  senha123");
  console.log("  carol@zenber.com  /  senha123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
