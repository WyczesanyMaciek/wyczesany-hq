// Seed startowej hierarchii kontekstow Wyczesany HQ.
// Uruchom: npx prisma db seed

import { prisma } from "../lib/db";

async function main() {
  console.log("🌱 Seed: czyszcze stare dane...");
  // Kolejnosc usuwania wazna ze wzgledu na FK
  await prisma.task.deleteMany();
  await prisma.note.deleteMany();
  await prisma.link.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.project.deleteMany();
  await prisma.context.deleteMany();

  console.log("🌱 Seed: tworze konteksty...");

  // === Salony (fioletowy) ===
  const salony = await prisma.context.create({
    data: { name: "Salony", color: "#5B3DF5", order: 0 },
  });
  const wfm = await prisma.context.create({
    data: { name: "WFM", color: "#5B3DF5", order: 0, parentId: salony.id },
  });
  const legnicka = await prisma.context.create({
    data: { name: "Legnicka", color: "#5B3DF5", order: 0, parentId: wfm.id },
  });
  await prisma.context.create({
    data: { name: "Łódzka", color: "#5B3DF5", order: 1, parentId: wfm.id },
  });
  await prisma.context.create({
    data: { name: "Zakładowa", color: "#5B3DF5", order: 2, parentId: wfm.id },
  });
  await prisma.context.create({
    data: { name: "Luxfera", color: "#5B3DF5", order: 1, parentId: salony.id },
  });
  await prisma.context.create({
    data: { name: "Głogów", color: "#5B3DF5", order: 2, parentId: salony.id },
  });

  // === Not Bad Stuff (CZERWONY, nie zielony!) ===
  const nbs = await prisma.context.create({
    data: { name: "Not Bad Stuff", color: "#DC2626", order: 1 },
  });
  await prisma.context.create({
    data: { name: "Produkcja", color: "#DC2626", order: 0, parentId: nbs.id },
  });
  await prisma.context.create({
    data: { name: "Sprzedaż", color: "#DC2626", order: 1, parentId: nbs.id },
  });

  // === Szkolenia (pomaranczowy) ===
  await prisma.context.create({
    data: { name: "Szkolenia", color: "#F97316", order: 2 },
  });

  // === Marka Osobista (koralowy) ===
  const marka = await prisma.context.create({
    data: { name: "Marka Osobista", color: "#FF6B4A", order: 3 },
  });
  await prisma.context.create({
    data: { name: "Instagram", color: "#FF6B4A", order: 0, parentId: marka.id },
  });
  await prisma.context.create({
    data: { name: "Live", color: "#FF6B4A", order: 1, parentId: marka.id },
  });
  await prisma.context.create({
    data: { name: "Wyczesany Ali", color: "#FF6B4A", order: 2, parentId: marka.id },
  });
  await prisma.context.create({
    data: { name: "Naffy", color: "#FF6B4A", order: 3, parentId: marka.id },
  });

  console.log("🌱 Seed: tworze testowy projekt w Legnickiej...");

  // === Testowy projekt: Remont witryny (w Legnickiej) ===
  const remont = await prisma.project.create({
    data: {
      name: "Remont witryny",
      description: "Wymiana szyby + nowe oklejenie + LED w nazwie salonu",
      status: "in_progress",
      contextId: legnicka.id,
      order: 0,
    },
  });

  // 3 taski testowe
  await prisma.task.create({
    data: {
      title: "Wybrać firme do wymiany szyby",
      done: true,
      priority: 2,
      order: 0,
      contextId: legnicka.id,
      projectId: remont.id,
    },
  });
  await prisma.task.create({
    data: {
      title: "Zatwierdzić projekt oklejenia",
      done: false,
      priority: 3,
      deadline: new Date("2026-04-20"),
      order: 1,
      contextId: legnicka.id,
      projectId: remont.id,
    },
  });
  await prisma.task.create({
    data: {
      title: "Zamówić LED z nazwą salonu",
      done: false,
      priority: 2,
      order: 2,
      contextId: legnicka.id,
      projectId: remont.id,
    },
  });

  console.log("✅ Seed zakonczony.");
}

main()
  .catch((e) => {
    console.error("❌ Seed blad:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
