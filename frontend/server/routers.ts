import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import * as db from "./db";
import { createDepositCheckout, getCheckoutPaymentSummary } from "./stripe";
import { storagePut } from "./storage";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { reservationInputSchema } from "../shared/reservation";
import { contactSettingsSchema, galleryUploadSchema } from "../shared/adminMedia";

const tripEditorSchema = z.object({
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  title: z.string().trim().min(3).max(240), destination: z.string().trim().min(2).max(160), category: z.enum(["umrah", "express_umrah", "world"]),
  status: z.enum(["book_now", "priority_reservation", "waitlist", "coming_soon", "notify_me"]), reservationMode: z.enum(["interest", "priority_hold", "deposit", "full_payment"]),
  shortDescription: z.string().trim().max(2000).optional(), heroImage: z.string().trim().max(2000).optional(), departureDate: z.string().date().optional(), returnDate: z.string().date().optional(),
  durationDays: z.number().int().min(1).max(60).optional(), nights: z.number().int().min(1).max(59).optional(), departureAirport: z.string().trim().max(32).optional(), returnAirport: z.string().trim().max(32).optional(),
  startingPrice: z.number().int().min(0).max(100000).optional(), priceLabel: z.string().trim().max(120).optional(), depositCents: z.number().int().min(50).max(10000000).nullable().optional(),
  holidayUsed: z.string().trim().max(120).optional(), estimatedPtoDays: z.number().int().min(0).max(20).optional(), schoolBreakNote: z.string().trim().max(255).optional(),
  expressUmrahEligible: z.boolean().default(false), extensionTiming: z.enum(["none", "before", "after", "both"]).default("none"), leaderName: z.string().trim().max(160).optional(), leaderRole: z.string().trim().max(160).optional(),
  itinerary: z.array(z.object({ location: z.string().trim().min(1).max(100), hotel: z.string().trim().min(1).max(200), nights: z.number().int().min(1).max(30) })).max(12).optional(),
});


function originFor(req: { headers: { origin?: string }; protocol: string; get(name: string): string | undefined }) {
  return req.headers.origin || `${req.protocol}://${req.get("host") || "localhost"}`;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const options = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...options, maxAge: -1 }); return { success: true } as const; }),
  }),
  settings: router({ public: publicProcedure.query(() => db.getSiteSettings()) }),
  trips: router({
    list: publicProcedure.query(() => db.listPublicTrips()),
    bySlug: publicProcedure.input(z.object({ slug: z.string().min(1).max(160) })).query(({ input }) => db.getTripBySlug(input.slug)),
    gallery: publicProcedure.input(z.object({ tripId: z.number().int().positive() })).query(({ input }) => db.listGalleryImages(input.tripId)),
  }),
  reservations: router({
    create: publicProcedure.input(reservationInputSchema).mutation(async ({ input, ctx }) => ({ success: true, reservationId: await db.createReservation({ ...input, userId: ctx.user?.id, status: "submitted" }) } as const)),
    createDepositCheckout: publicProcedure.input(reservationInputSchema).mutation(async ({ input, ctx }) => {
      const trip = await db.getTripById(input.tripId);
      if (!trip) throw new Error("This departure is no longer available.");
      if (trip.reservationMode !== "deposit" || !trip.depositCents || trip.depositCents < 50) throw new Error("A secure deposit is not configured for this departure yet.");
      const reservationId = await db.createReservation({ ...input, userId: ctx.user?.id, status: "submitted" });
      const session = await createDepositCheckout({ trip: { id: trip.id, title: trip.title, depositCents: trip.depositCents, departureDate: trip.departureDate }, reservationId, email: input.email, name: input.primaryName, userId: ctx.user?.id, origin: originFor(ctx.req) });
      await db.setReservationCheckoutSession(reservationId, session.id);
      return { checkoutUrl: session.url!, reservationId };
    }),
  }),
  leads: router({
    create: publicProcedure.input(z.object({ firstName: z.string().trim().min(2).max(120), email: z.string().trim().email().max(320), mobile: z.string().trim().max(48).optional(), homeAirport: z.string().trim().max(32).optional(), interests: z.array(z.string().trim().min(1).max(80)).min(1).max(10) })).mutation(async ({ input }) => { await db.createLead({ ...input, interests: input.interests }); return { success: true } as const; }),
  }),
  traveler: router({
    reservations: protectedProcedure.query(({ ctx }) => db.listReservationsForUser(ctx.user.id)),
    payments: protectedProcedure.query(async ({ ctx }) => {
      const reservations = await db.listReservationsForUser(ctx.user.id);
      const completed = await Promise.all(reservations.filter(item => item.reservation.stripeCheckoutSessionId).map(async item => {
        try {
          const payment = await getCheckoutPaymentSummary(item.reservation.stripeCheckoutSessionId!);
          return { tripTitle: item.trip.title, reservationId: item.reservation.id, ...payment };
        } catch {
          return null;
        }
      }));
      return completed.filter((payment): payment is NonNullable<typeof payment> => Boolean(payment));
    }),
  }),
  admin: router({
    listTrips: adminProcedure.query(() => db.listTripsForAdmin()),
    upsertTrip: adminProcedure.input(tripEditorSchema).mutation(async ({ input }) => ({ success: true, id: await db.upsertTrip({ ...input, departureDate: input.departureDate ? new Date(`${input.departureDate}T12:00:00Z`) : null, returnDate: input.returnDate ? new Date(`${input.returnDate}T12:00:00Z`) : null }) } as const)),
    getSettings: adminProcedure.query(() => db.getSiteSettings()),
    saveSettings: adminProcedure.input(contactSettingsSchema).mutation(async ({ input }) => ({ success: true, id: await db.upsertSiteSettings(input) } as const)),
    listGallery: adminProcedure.input(z.object({ tripId: z.number().int().positive() })).query(({ input }) => db.listGalleryImages(input.tripId)),
    uploadGalleryImage: adminProcedure.input(galleryUploadSchema).mutation(async ({ input }) => {
      const imageBytes = Buffer.from(input.base64, "base64");
      if (!imageBytes.length || imageBytes.length > 10_000_000) throw new Error("Images must be between 1 byte and 10 MB.");
      const extension = input.contentType.split("/")[1];
      const { key, url } = await storagePut(`trip-galleries/${input.tripId}/${Date.now()}-${input.fileName.replace(/[^a-z0-9._-]/gi, "-")}.${extension}`, imageBytes, input.contentType);
      const current = await db.listGalleryImages(input.tripId);
      const id = await db.createGalleryImage({ tripId: input.tripId, storageKey: key, imageUrl: url, altText: input.altText, caption: input.caption || null, sortOrder: current.length });
      return { success: true, id, url } as const;
    }),
    deleteGalleryImage: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { await db.deleteGalleryImage(input.id); return { success: true } as const; }),
    orderGalleryImages: adminProcedure.input(z.object({ items: z.array(z.object({ id: z.number().int().positive(), sortOrder: z.number().int().min(0) })).min(1) })).mutation(async ({ input }) => { await db.setGalleryOrder(input.items); return { success: true } as const; }),
  }),
});

export type AppRouter = typeof appRouter;
