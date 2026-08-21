import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertTrip, InsertUser, leads, reservations, siteSettings, tripGalleryImages, trips, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  (["name", "email", "loginMethod"] as const).forEach(field => { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } });
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : undefined);
  if (values.role) updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listPublicTrips() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trips).orderBy(desc(trips.departureDate));
}

export async function getTripBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(trips).where(eq(trips.slug, slug)).limit(1);
  return result[0];
}

export async function getTripById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
  return result[0];
}

export async function listTripsForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trips).orderBy(desc(trips.updatedAt));
}

export async function upsertTrip(input: InsertTrip) {
  const db = await getDb();
  if (!db) throw new Error("Trip management is temporarily unavailable.");
  const existing = await getTripBySlug(input.slug);
  if (existing) { await db.update(trips).set(input).where(eq(trips.id, existing.id)); return existing.id; }
  const result = await db.insert(trips).values(input);
  return Number(result[0].insertId);
}

export async function createReservation(input: typeof reservations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Reservations are temporarily unavailable. Please contact the travel team.");
  const result = await db.insert(reservations).values(input);
  return Number(result[0].insertId);
}

export async function setReservationCheckoutSession(reservationId: number, sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Reservation payment is temporarily unavailable.");
  await db.update(reservations).set({ stripeCheckoutSessionId: sessionId }).where(eq(reservations.id, reservationId));
}

export async function listReservationsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ reservation: reservations, trip: trips }).from(reservations).innerJoin(trips, eq(reservations.tripId, trips.id)).where(eq(reservations.userId, userId)).orderBy(desc(reservations.createdAt));
}

export async function createLead(input: typeof leads.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Lead capture is temporarily unavailable. Please contact the travel team.");
  await db.insert(leads).values(input);
}

export async function listGalleryImages(tripId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tripGalleryImages).where(eq(tripGalleryImages.tripId, tripId)).orderBy(asc(tripGalleryImages.sortOrder), asc(tripGalleryImages.id));
}

export async function createGalleryImage(input: typeof tripGalleryImages.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Gallery uploads are temporarily unavailable.");
  const result = await db.insert(tripGalleryImages).values(input);
  return Number(result[0].insertId);
}

export async function deleteGalleryImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Gallery management is temporarily unavailable.");
  await db.delete(tripGalleryImages).where(eq(tripGalleryImages.id, id));
}

export async function setGalleryOrder(items: Array<{ id: number; sortOrder: number }>) {
  const db = await getDb();
  if (!db) throw new Error("Gallery management is temporarily unavailable.");
  await Promise.all(items.map(item => db.update(tripGalleryImages).set({ sortOrder: item.sortOrder }).where(eq(tripGalleryImages.id, item.id))));
}

export async function getSiteSettings() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(siteSettings).limit(1);
  return result[0];
}

export async function upsertSiteSettings(input: { phone: string; email: string; whatsapp: string }) {
  const db = await getDb();
  if (!db) throw new Error("Contact settings are temporarily unavailable.");
  const existing = await getSiteSettings();
  if (existing) { await db.update(siteSettings).set(input).where(eq(siteSettings.id, existing.id)); return existing.id; }
  const result = await db.insert(siteSettings).values(input);
  return Number(result[0].insertId);
}
