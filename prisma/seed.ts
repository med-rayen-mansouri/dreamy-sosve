import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });
if (process.env.NODE_ENV === "production")
  throw new Error("Development seed is disabled in production.");
const db = new PrismaClient();
const password = process.env.DEMO_PASSWORD || "PetitsMondes2026!";
const days = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
};
const birth = (offset: number, year: number) => {
  const date = days(offset);
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCFullYear(year);
  return date;
};
async function main() {
  const passwordHash = await hash(password, 12);
  const accounts = [
    {
      id: "demo-admin",
      name: "Amira Ben Salem",
      email: "admin@demo.petitsmondes.local",
      role: "ADMIN" as const,
    },
    {
      id: "demo-mother-a",
      name: "Mouna Trabelsi",
      email: "mouna@demo.petitsmondes.local",
      role: "MOTHER" as const,
    },
    {
      id: "demo-mother-b",
      name: "Salma Mansouri",
      email: "salma@demo.petitsmondes.local",
      role: "MOTHER" as const,
    },
  ];
  for (const account of accounts)
    await db.user.upsert({
      where: { id: account.id },
      create: { ...account, passwordHash },
      update: {
        name: account.name,
        email: account.email,
        role: account.role,
        passwordHash,
        active: true,
      },
    });
  const names = [
    "Yasmine",
    "Adam",
    "Inès",
    "Youssef",
    "Maya",
    "Rayan",
    "Lina",
    "Sami",
    "Nour",
    "Ali",
  ];
  const avatars = ["🎨", "🚀", "🌸", "⚽", "🦋", "🎵", "📚", "🌟", "🐱", "🎮"];
  for (let i = 0; i < names.length; i++) {
    const motherId = i < 6 ? "demo-mother-a" : "demo-mother-b";
    const birthDate = birth(
      i === 0 ? 20 : i === 6 ? 50 : 80 + i * 13,
      2015 + (i % 5),
    );
    await db.child.upsert({
      where: { id: `demo-child-${i}` },
      create: {
        id: `demo-child-${i}`,
        motherId,
        firstName: names[i],
        birthDate,
        avatar: avatars[i],
        description: `${names[i]} aime partager de bons moments avec les autres.`,
        interests:
          i === 0
            ? ["dessin", "animaux"]
            : i === 6
              ? ["musique", "lecture"]
              : ["jeux créatifs", "nature"],
        favoriteActivities:
          i === 0 ? ["peinture", "coloriage"] : ["atelier créatif"],
        birthdayThemes: i === 0 ? ["animaux", "art"] : ["couleurs"],
        giftWishes: i === 0 ? ["crayons de couleur"] : ["livres"],
        comfortPreferences:
          i === 0 ? ["petits groupes", "espace calme"] : ["pauses régulières"],
        approvedPlanningSummary:
          i === 0
            ? "Aime le dessin et les animaux. Préfère un petit groupe et un coin calme."
            : "Apprécie les activités créatives et les pauses régulières.",
      },
      update: { birthDate },
    });
  }
  await db.childNote.upsert({
    where: { id: "demo-note-1" },
    create: {
      id: "demo-note-1",
      childId: "demo-child-0",
      motherId: "demo-mother-a",
      content:
        "Yasmine aime dessiner les animaux. Elle préfère les petites fêtes calmes et voudrait des crayons de couleur.",
      inputMethod: "TEXT",
    },
    update: {},
  });
  await db.childNote.upsert({
    where: { id: "demo-note-2" },
    create: {
      id: "demo-note-2",
      childId: "demo-child-6",
      motherId: "demo-mother-b",
      content:
        "Lina aime écouter de la musique et lire après les activités de groupe.",
      inputMethod: "TEXT",
    },
    update: {},
  });
  const eventData = [
    {
      id: "demo-birthday-1",
      type: "BIRTHDAY" as const,
      title: "Anniversaire créatif de Yasmine",
      date: days(20),
      location: "Maison SOS · Salle des ateliers",
      birthdayChildId: "demo-child-0",
      participants: [0, 1, 2],
      status: "AWAITING_APPROVAL" as const,
      theme: "Animaux et couleurs",
      activities: ["Dessiner des animaux", "Atelier coloriage"],
      tasks: ["Préparer les crayons", "Installer un coin calme"],
    },
    {
      id: "demo-birthday-2",
      type: "BIRTHDAY" as const,
      title: "Anniversaire musical de Lina",
      date: days(50),
      location: "Maison SOS · Jardin",
      birthdayChildId: "demo-child-6",
      participants: [6, 7, 8],
      status: "DRAFT" as const,
      theme: "Musique douce",
      activities: ["Atelier de rythme", "Lecture partagée"],
      tasks: ["Préparer les instruments", "Décorer le jardin"],
    },
    {
      id: "demo-event-1",
      type: "SOS_EVENT" as const,
      title: "Journée nature et création",
      date: days(35),
      location: "Parc municipal",
      birthdayChildId: null,
      participants: [0, 3, 6, 9],
      status: "AWAITING_APPROVAL" as const,
      theme: null,
      activities: ["Découverte du parc", "Collage de feuilles"],
      tasks: ["Vérifier les autorisations", "Prévoir de l’eau"],
    },
    {
      id: "demo-event-2",
      type: "SOS_EVENT" as const,
      title: "Atelier des couleurs",
      date: days(-12),
      location: "Maison SOS · Salle créative",
      birthdayChildId: null,
      participants: [1, 2, 7, 8],
      status: "COMPLETED" as const,
      theme: null,
      activities: ["Peinture collective", "Exposition des créations"],
      tasks: ["Préparer le matériel", "Ranger la salle"],
    },
  ];
  for (const item of eventData) {
    await db.event.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        type: item.type,
        title: item.title,
        eventDate: item.date,
        location: item.location,
        birthdayChildId: item.birthdayChildId,
        theme: item.theme,
        plannedActivities: item.activities,
        suggestedGiftIdeas:
          item.type === "BIRTHDAY" ? ["Matériel créatif"] : [],
        status: item.status,
        organizerId: "demo-admin",
        category:
          item.type === "BIRTHDAY" ? "Anniversaire" : "Atelier collectif",
      },
      update: {},
    });
    for (const index of item.participants)
      await db.eventParticipant.upsert({
        where: {
          eventId_childId: { eventId: item.id, childId: `demo-child-${index}` },
        },
        create: {
          eventId: item.id,
          childId: `demo-child-${index}`,
          motherId: index < 6 ? "demo-mother-a" : "demo-mother-b",
          approvalStatus: item.status === "COMPLETED" ? "APPROVED" : "PENDING",
        },
        update: {},
      });
    for (let position = 0; position < item.tasks.length; position++)
      await db.eventTask.upsert({
        where: { id: `${item.id}-task-${position}` },
        create: {
          id: `${item.id}-task-${position}`,
          eventId: item.id,
          title: item.tasks[position],
          position,
          completed: item.status === "COMPLETED",
        },
        update: {},
      });
  }
  await db.eventFeedback.upsert({
    where: {
      eventId_childId: { eventId: "demo-event-2", childId: "demo-child-1" },
    },
    create: {
      eventId: "demo-event-2",
      childId: "demo-child-1",
      motherId: "demo-mother-a",
      enjoyed: true,
      comfortable: true,
      favoriteActivity: "Peinture collective",
      comment: "Adam était fier de montrer son dessin.",
    },
    update: {},
  });
  console.log(
    "Fictional demo data ready. Accounts: admin@demo.petitsmondes.local, mouna@demo.petitsmondes.local, salma@demo.petitsmondes.local. Password:",
    password,
  );
}
main().finally(() => db.$disconnect());
