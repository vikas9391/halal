import { z } from "zod";

export const contactSettingsSchema = z.object({
  phone: z.string().trim().min(7).max(48),
  email: z.string().trim().email().max(320),
  whatsapp: z.string().trim().regex(/^\+?[0-9]{8,20}$/, "Use a WhatsApp number with country code."),
});

export const galleryUploadSchema = z.object({
  tripId: z.number().int().positive(),
  fileName: z.string().trim().min(1).max(180),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  base64: z.string().min(16).max(14_000_000),
  altText: z.string().trim().min(6).max(320),
  caption: z.string().trim().max(500).optional(),
});
