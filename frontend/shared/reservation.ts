import { z } from "zod";

export const reservationInputSchema = z.object({
  tripId: z.number().int().positive(),
  primaryName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(7).max(48),
  homeCity: z.string().trim().max(160).optional(),
  adults: z.number().int().min(1).max(20),
  children: z.number().int().min(0).max(20),
  roomPreference: z.string().trim().max(80).optional(),
  departureCity: z.string().trim().max(80).optional(),
  addUmrahExtension: z.boolean().default(false),
  notes: z.string().trim().max(2000).optional(),
});
