// Seed startowej hierarchii kontekstow Wyczesany HQ.
// Uruchom: npx prisma db seed

import { prisma } from "../lib/db";

async function main() {
  console.log("🌱 Seed: czyszcze stare dane...");
  // Kolejnosc usuwania wazna ze wzgledu na FK
  await prisma.subtask.deleteMany();
  await prisma.taskAttachment.deleteMany();
  await prisma.taskLink.deleteMany();
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
    data: { name: "Salony", color: "#5B3DF5", icon: "💈", order: 0, description: "Wszystkie salony fryzjerskie" },
  });
  const wfm = await prisma.context.create({
    data: { name: "WFM", color: "#5B3DF5", icon: "🏢", order: 0, parentId: salony.id },
  });
  const legnicka = await prisma.context.create({
    data: { name: "Legnicka", color: "#5B3DF5", icon: "📍", order: 0, parentId: wfm.id },
  });
  await prisma.context.create({
    data: { name: "Łódzka", color: "#5B3DF5", icon: "📍", order: 1, parentId: wfm.id },
  });
  await prisma.context.create({
    data: { name: "Zakładowa", color: "#5B3DF5", icon: "📍", order: 2, parentId: wfm.id },
  });
  await prisma.context.create({
    data: { name: "Luxfera", color: "#5B3DF5", icon: "✨", order: 1, parentId: salony.id },
  });
  await prisma.context.create({
    data: { name: "Głogów", color: "#5B3DF5", icon: "📍", order: 2, parentId: salony.id },
  });

  // === Not Bad Stuff (CZERWONY, nie zielony!) ===
  const nbs = await prisma.context.create({
    data: { name: "Not Bad Stuff", color: "#DC2626", icon: "🧴", order: 1, description: "Marka kosmetykow" },
  });
  await prisma.context.create({
    data: { name: "Produkcja", color: "#DC2626", icon: "🏭", order: 0, parentId: nbs.id },
  });
  await prisma.context.create({
    data: { name: "Sprzedaż", color: "#DC2626", icon: "🛒", order: 1, parentId: nbs.id },
  });

  // === Szkolenia (pomaranczowy) ===
  await prisma.context.create({
    data: { name: "Szkolenia", color: "#F97316", icon: "🎓", order: 2, description: "Szkolenia fryzjerskie i biznesowe" },
  });

  // === Marka Osobista (koralowy) ===
  const marka = await prisma.context.create({
    data: { name: "Marka Osobista", color: "#FF6B4A", icon: "🎤", order: 3, description: "Social media, live, content" },
  });
  await prisma.context.create({
    data: { name: "Instagram", color: "#FF6B4A", icon: "📸", order: 0, parentId: marka.id },
  });
  await prisma.context.create({
    data: { name: "Live", color: "#FF6B4A", icon: "🔴", order: 1, parentId: marka.id },
  });
  await prisma.context.create({
    data: { name: "Wyczesany Ali", color: "#FF6B4A", icon: "🤖", order: 2, parentId: marka.id },
  });
  await prisma.context.create({
    data: { name: "Naffy", color: "#FF6B4A", icon: "💅", order: 3, parentId: marka.id },
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
  // Task z notatkami, linkami i zalacznikami — dla demo panelu szczegolow
  const zatwierdz = await prisma.task.create({
    data: {
      title: "Zatwierdzić projekt oklejenia",
      done: false,
      priority: 3,
      deadline: new Date("2026-04-20"),
      order: 1,
      contextId: legnicka.id,
      projectId: remont.id,
      assigneeId: "MK",
      notes:
        "Grafik (Darek, 601-234-567) dostarczy 3 warianty do piątku. " +
        "Musimy sie zdecydowac czy idziemy w minimalizm czy w mocne logo. " +
        "Budzet materialu: okolo 1800 zl netto.",
    },
  });
  await prisma.taskLink.create({
    data: {
      taskId: zatwierdz.id,
      label: "Projekt oklejenia v3",
      url: "https://figma.com/file/projekt-oklejenia",
    },
  });
  await prisma.taskLink.create({
    data: {
      taskId: zatwierdz.id,
      label: "Materialy zakupowe",
      url: "https://dropbox.com/folder/materialy",
    },
  });
  await prisma.taskAttachment.create({
    data: {
      taskId: zatwierdz.id,
      kind: "image",
      name: "fotel_v1.jpg",
      url: "https://placehold.co/400x400/ddd6fe/4338ca?text=fotel_v1",
    },
  });
  await prisma.taskAttachment.create({
    data: {
      taskId: zatwierdz.id,
      kind: "image",
      name: "plan.png",
      url: "https://placehold.co/400x400/c4b5fd/4338ca?text=plan",
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
      assigneeId: "AW",
    },
  });

  console.log("🌱 Seed: luzne taski, pomysly, problemy...");

  // === Luzne taski w roznych miejscach (do pokazania agregacji „w gore") ===
  await prisma.task.create({
    data: {
      title: "Oddzwonic do firmy od klimatyzacji",
      priority: 3,
      deadline: new Date("2026-04-12"),
      contextId: legnicka.id,
      order: 0,
    },
  });
  await prisma.task.create({
    data: {
      title: "Umowic spotkanie z ksiegowa",
      priority: 2,
      contextId: salony.id,
      order: 1,
    },
  });
  await prisma.task.create({
    data: {
      title: "Zamowic nowe wizytowki dla Luxfery",
      priority: 1,
      contextId: (await prisma.context.findFirst({ where: { name: "Luxfera" } }))!
        .id,
      order: 0,
    },
  });
  await prisma.task.create({
    data: {
      title: "Uporzadkowac archiwum zdjec z Instagrama",
      priority: 0,
      contextId: marka.id,
      order: 0,
    },
  });
  // Jeden zakonczony task luzny — do sekcji „Historia"
  await prisma.task.create({
    data: {
      title: "Odebrac paczke z poczty",
      done: true,
      priority: 1,
      contextId: legnicka.id,
      order: 2,
    },
  });

  // === Drugi projekt — w Luxferze — zeby Salony pokazywaly 2 projekty ===
  await prisma.project.create({
    data: {
      name: "Letnia promocja",
      description: "Plakaty + social media + sms do stalych klientow",
      status: "todo",
      deadline: new Date("2026-05-15"),
      contextId: (await prisma.context.findFirst({ where: { name: "Luxfera" } }))!
        .id,
      order: 0,
    },
  });

  // === Subtaski do taska "Zatwierdzic projekt oklejenia" ===
  console.log("🌱 Seed: subtaski...");
  await prisma.subtask.create({
    data: { title: "Zebrac 3 warianty od grafika", done: true, order: 0, taskId: zatwierdz.id },
  });
  await prisma.subtask.create({
    data: { title: "Porownac koszty materialu", done: false, order: 1, taskId: zatwierdz.id },
  });
  await prisma.subtask.create({
    data: { title: "Wybrac finalny wariant z Mackiem", done: false, order: 2, taskId: zatwierdz.id },
  });

  // Subtaski do "Zamowic LED"
  const ledTask = await prisma.task.findFirst({ where: { title: { contains: "LED" } } });
  if (ledTask) {
    await prisma.subtask.create({
      data: { title: "Znalezc dostawce LED", done: true, order: 0, taskId: ledTask.id },
    });
    await prisma.subtask.create({
      data: { title: "Wybrac font i rozmiar", done: false, order: 1, taskId: ledTask.id },
    });
  }

  // === Pomysly (do kontekstow, nie projektow) ===
  await prisma.idea.create({
    data: {
      content: "Moze zrobic konkurs dla klientow — sesja zdjeciowa za najlepsza stylizacje?",
      description: "Klienci wrzucaja zdjecia na IG z hashtagiem, najlepsza stylizacja wygrywa darmowy zabieg. Dobre na engagement + UGC.",
      contextId: salony.id,
    },
  });
  await prisma.idea.create({
    data: {
      content: "Zmienic muzyke w Legnickiej na cos spokojniejszego po godzinie 17",
      contextId: legnicka.id,
    },
  });
  await prisma.idea.create({
    data: {
      content: "Live z backstage'u przed otwarciem nowej kolekcji Not Bad Stuff",
      description: "Pokazac proces produkcji, opakowania, testy — buduje autentycznosc marki.",
      contextId: nbs.id,
    },
  });
  await prisma.idea.create({
    data: {
      content: "Seria szorts'ow na TikToku — ciekawostki z pracy w salonie",
      contextId: marka.id,
    },
  });

  // === Problemy z priorytetami ===
  await prisma.problem.create({
    data: {
      content: "Klimatyzacja w Legnickiej hałasuje — reklamacje klientow",
      description: "Klienci skarza sie na szum, szczegolnie przy stanowisku 3. Serwisant byl, powiedzial ze wymiana sprężarki ~4000 zl.",
      priority: 3,
      contextId: legnicka.id,
    },
  });
  await prisma.problem.create({
    data: {
      content: "Brak kogos do prowadzenia Instagrama Naffy na stale",
      description: "Potrzebna osoba 2-3h/tydz. Budget do 800 zl/msc. Moze studentka?",
      priority: 2,
      contextId: marka.id,
    },
  });
  await prisma.problem.create({
    data: {
      content: "Spadek sprzedazy NBS w marcu — 15% mniej niz rok temu",
      priority: 2,
      contextId: nbs.id,
    },
  });
  await prisma.problem.create({
    data: {
      content: "Drzwi w Luxferze nie domykaja sie do konca",
      priority: 1,
      contextId: (await prisma.context.findFirst({ where: { name: "Luxfera" } }))!.id,
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
