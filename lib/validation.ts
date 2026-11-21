import { z } from "zod";

const list = z.array(z.string().trim().min(1).max(80)).max(30).default([]);
export const childSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  birthDate: z.iso.date(),
  avatar: z.string().max(120).optional().nullable(),
  description: z.string().max(3000).optional().nullable(),
  personalityTags: list,
  interests: list,
  favoriteActivities: list,
  favoriteColors: list,
  birthdayThemes: list,
  giftWishes: list,
  comfortPreferences: list,
  approvedPlanningSummary: z.string().max(3000).optional().nullable(),
});
export const noteSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  inputMethod: z.enum(["TEXT", "VOICE"]),
});
export const eventSchema = z.object({
  type: z.enum(["BIRTHDAY", "SOS_EVENT"]),
  title: z.string().trim().min(1).max(180),
  description: z.string().max(5000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  eventDate: z.iso.datetime({ offset: true }),
  location: z.string().trim().min(1).max(180),
  birthdayChildId: z.string().optional().nullable(),
  theme: z.string().max(180).optional().nullable(),
  plannedActivities: list,
  suggestedGiftIdeas: list,
  preparationNotes: z.string().max(5000).optional().nullable(),
  childIds: z.array(z.string()).max(100),
  checklist: list,
});
export const taskSchema = z.object({
  title: z.string().trim().min(1).max(180),
});
export const approvalSchema = z.object({
  status: z.enum(["APPROVED", "DECLINED", "CHANGES_REQUESTED"]),
  comment: z.string().max(2000).optional().nullable(),
});
export const feedbackSchema = z.object({
  enjoyed: z.boolean(),
  comfortable: z.boolean(),
  favoriteActivity: z.string().max(180).optional().nullable(),
  comment: z.string().max(3000).optional().nullable(),
});
export function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
