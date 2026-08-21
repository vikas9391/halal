import { describe, expect, it } from "vitest";
import { contactSettingsSchema, galleryUploadSchema } from "../shared/adminMedia";
import { buildTripDepositLineItem } from "./products";

describe("administrator contact settings", () => {
  it("accepts a public phone, email, and country-code WhatsApp number", () => {
    expect(contactSettingsSchema.safeParse({ phone: "214-233-6721", email: "info@halal-travel.com", whatsapp: "12142336721" }).success).toBe(true);
  });

  it("rejects an invalid public email or incomplete WhatsApp number", () => {
    expect(contactSettingsSchema.safeParse({ phone: "214-233-6721", email: "not-an-email", whatsapp: "12142336721" }).success).toBe(false);
    expect(contactSettingsSchema.safeParse({ phone: "214-233-6721", email: "info@halal-travel.com", whatsapp: "123" }).success).toBe(false);
  });
});

describe("destination gallery uploads", () => {
  const image = { tripId: 1, fileName: "mostar.webp", contentType: "image/webp" as const, base64: "dGVzdC1pbWFnZS1ieXRlcy0xMjM0NTY=", altText: "Stone bridge spanning the river in Mostar", caption: "Mostar, Bosnia and Herzegovina" };

  it("accepts supported image metadata with meaningful alternative text", () => {
    expect(galleryUploadSchema.safeParse(image).success).toBe(true);
  });

  it("rejects unsupported image media types", () => {
    expect(galleryUploadSchema.safeParse({ ...image, contentType: "image/gif" }).success).toBe(false);
  });
});

describe("Stripe deposit products", () => {
  it("constructs a USD deposit line item with the configured cents amount", () => {
    const item = buildTripDepositLineItem({ id: 1, title: "Thanksgiving Break Umrah 2026", depositCents: 50000, departureDate: new Date("2026-11-23T12:00:00Z") });
    expect(item.price_data.currency).toBe("usd");
    expect(item.price_data.unit_amount).toBe(50000);
    expect(item.price_data.product_data.name).toBe("Thanksgiving Break Umrah 2026 deposit");
  });
});
