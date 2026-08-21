import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

export type Trip = {
  id: number;
  slug: string;
  title: string;
  destination: string;
  category: "umrah" | "express_umrah" | "world";
  status: "book_now" | "priority_reservation" | "waitlist" | "coming_soon" | "notify_me";
  reservationMode: "interest" | "priority_hold" | "deposit" | "full_payment";
  shortDescription: string | null;
  heroImage: string | null;
  departureDate: Date | null;
  returnDate: Date | null;
  durationDays: number | null;
  nights: number | null;
  departureAirport: string | null;
  returnAirport: string | null;
  startingPrice: number | null;
  priceLabel: string | null;
  depositCents: number | null;
  holidayUsed: string | null;
  estimatedPtoDays: number | null;
  schoolBreakNote: string | null;
  expressUmrahEligible: boolean;
  extensionTiming: "none" | "before" | "after" | "both";
  leaderName: string | null;
  leaderRole: string | null;
  itinerary: unknown | null;
};

export const statusLabels: Record<Trip["status"], string> = {
  book_now: "Book now",
  priority_reservation: "Priority reservation",
  waitlist: "Join waitlist",
  coming_soon: "Coming soon",
  notify_me: "Notify me",
};

const dayFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export function dateRange(trip: Trip) {
  if (!trip.departureDate || !trip.returnDate) return "Dates to be confirmed";
  return `${dayFormatter.format(new Date(trip.departureDate))} – ${dayFormatter.format(new Date(trip.returnDate))}`;
}

export function getStays(itinerary: unknown) {
  if (!Array.isArray(itinerary)) return [] as Array<{ location: string; hotel: string; nights: number }>;
  return itinerary.filter((item): item is { location: string; hotel: string; nights: number } => Boolean(item && typeof item === "object" && typeof (item as { location?: unknown }).location === "string" && typeof (item as { hotel?: unknown }).hotel === "string" && typeof (item as { nights?: unknown }).nights === "number"));
}

export function contactLinks(phone: string, whatsapp: string) {
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneWithCountry = phoneDigits.length === 10 ? `1${phoneDigits}` : phoneDigits;
  return { telephone: `+${phoneWithCountry}`, whatsapp: whatsapp.replace(/\D/g, "") };
}

export function Price({ trip, emphasis = false }: { trip: Trip; emphasis?: boolean }) {
  return (
    <div className={emphasis ? "price-block price-block--emphasis" : "price-block"}>
      <span>{trip.startingPrice ? "From" : "Planning"}</span>
      <strong>{trip.startingPrice ? `$${trip.startingPrice.toLocaleString()}` : "Coming soon"}</strong>
      {trip.priceLabel ? <small>{trip.priceLabel}</small> : null}
    </div>
  );
}

export function PtoMetric({ trip, large = false }: { trip: Trip; large?: boolean }) {
  return (
    <div className={large ? "pto-metric pto-metric--large" : "pto-metric"} title="PTO estimates assume a typical Monday–Friday U.S. work schedule. Employer and school calendars vary.">
      <span className="pto-kicker">Workdays away</span>
      <strong>{trip.estimatedPtoDays ?? "—"}<em> PTO</em></strong>
      <small>{trip.holidayUsed ?? "Holiday alignment to be confirmed"}</small>
    </div>
  );
}

export function ReservationDialog({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const [form, setForm] = useState({ primaryName: "", email: "", phone: "", homeCity: "", adults: 1, children: 0, roomPreference: "", departureCity: "", notes: "", addUmrahExtension: false });
  const [step, setStep] = useState<1 | 2>(1);
  const depositReady = trip.reservationMode === "deposit" && Boolean(trip.depositCents && trip.depositCents >= 50);
  const reservation = trpc.reservations.create.useMutation({ onSuccess: () => { toast.success("Your request has been received.", { description: "The travel team will follow up with the next steps." }); onClose(); }, onError: error => toast.error("We could not submit your request.", { description: error.message }) });
  const depositCheckout = trpc.reservations.createDepositCheckout.useMutation({ onSuccess: data => { toast.success("Opening secure deposit checkout", { description: "Stripe will handle your payment details in a new tab." }); window.open(data.checkoutUrl, "_blank", "noopener,noreferrer"); onClose(); }, onError: error => toast.error("We could not open secure checkout.", { description: error.message }) });
  const update = (field: keyof typeof form, value: string | boolean | number) => setForm(current => ({ ...current, [field]: value }));
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (step === 1) { if (event.currentTarget.reportValidity()) setStep(2); return; } if (depositReady) depositCheckout.mutate({ tripId: trip.id, ...form }); else reservation.mutate({ tripId: trip.id, ...form }); };
  const childLabel = form.children ? ` · ${form.children} child${form.children > 1 ? "ren" : ""}` : "";

  return (
    <AnimatePresence>
      <motion.div className="dialog-backdrop" role="presentation" onMouseDown={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
        <motion.section
          className="reservation-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reserve-title"
          onMouseDown={event => event.stopPropagation()}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <button className="icon-button" onClick={onClose} aria-label="Close reservation form"><X size={19} /></button>
          <p className="eyebrow">{statusLabels[trip.status]} · Step {step} of 2</p>
          <h2 id="reserve-title">Reserve your place</h2>
          <p className="dialog-trip"><strong>{trip.title}</strong><span>{dateRange(trip)}</span></p>
          <form onSubmit={submit} className="reserve-form">
            {step === 1 ? (
              <>
                <label>Primary traveler name<input required value={form.primaryName} onChange={event => update("primaryName", event.target.value)} /></label>
                <label>Email address<input required type="email" value={form.email} onChange={event => update("email", event.target.value)} /></label>
                <label>Mobile number<input required type="tel" value={form.phone} onChange={event => update("phone", event.target.value)} /></label>
                <div className="form-row"><label>Adults<input required min="1" max="20" type="number" value={form.adults} onChange={event => update("adults", Number(event.target.value))} /></label><label>Children<input min="0" max="20" type="number" value={form.children} onChange={event => update("children", Number(event.target.value))} /></label></div>
                <div className="form-row"><label>Home city<input value={form.homeCity} onChange={event => update("homeCity", event.target.value)} /></label><label>Preferred room<select value={form.roomPreference} onChange={event => update("roomPreference", event.target.value)}><option value="">Select later</option><option>Quad</option><option>Triple</option><option>Double</option><option>Single</option></select></label></div>
                {trip.expressUmrahEligible ? <label className="check-label"><input type="checkbox" checked={form.addUmrahExtension} onChange={event => update("addUmrahExtension", event.target.checked)} /> I'd like to discuss the optional Express Umrah extension.</label> : null}
                <label>Anything we should know?<textarea rows={3} value={form.notes} onChange={event => update("notes", event.target.value)} placeholder="Family needs, room requests, departure city…" /></label>
                <button className="button button--primary" type="submit">Review reservation <ChevronRight size={16} /></button>
              </>
            ) : (
              <>
                <div className="reservation-review">
                  <p className="eyebrow">Reservation summary</p>
                  <div><span>Travelers</span><strong>{form.adults} adult{form.adults > 1 ? "s" : ""}{childLabel}</strong></div>
                  <div><span>Room request</span><strong>{form.roomPreference || "To be confirmed"}</strong></div>
                  <div><span>Package price</span><strong>{trip.priceLabel ?? "Pricing to be confirmed"}</strong></div>
                  <div><span>Due today</span><strong>{depositReady ? `$${(trip.depositCents! / 100).toLocaleString()} secure deposit` : "No payment collected"}</strong></div>
                  <div><span>Next step</span><strong>{depositReady ? "Stripe Checkout opens in a new tab" : "Travel team confirms availability"}</strong></div>
                </div>
                <div className="review-actions">
                  <button className="admin-secondary" type="button" onClick={() => setStep(1)}>Back</button>
                  <button className="button button--primary" type="submit" disabled={reservation.isPending || depositCheckout.isPending}>{depositReady ? (depositCheckout.isPending ? "Opening checkout…" : "Continue to secure deposit") : (reservation.isPending ? "Sending request…" : "Submit reservation request")}<ChevronRight size={16} /></button>
                </div>
              </>
            )}
          </form>
          <p className="secure-note">No card details are collected here. When enabled, a secure deposit is handled by Stripe Checkout. Deposit rules and balance schedules remain trip-specific.</p>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}

export function LeadCapture() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("Umrah");
  const lead = trpc.leads.create.useMutation({
    onSuccess: () => { toast.success("You're on the first-access list."); setFirstName(""); setEmail(""); },
    onError: error => toast.error(error.message),
  });
  return (
    <form className="lead-form" onSubmit={event => { event.preventDefault(); lead.mutate({ firstName, email, interests: [interest] }); }}>
      <input aria-label="First name" placeholder="First name" required value={firstName} onChange={event => setFirstName(event.target.value)} />
      <input aria-label="Email address" placeholder="Email address" type="email" required value={email} onChange={event => setEmail(event.target.value)} />
      <select aria-label="Interest" value={interest} onChange={event => setInterest(event.target.value)}><option>Umrah</option><option>Express Umrah</option><option>Bosnia</option><option>Morocco</option><option>Spain</option><option>Global journeys</option></select>
      <button className="button button--sand" disabled={lead.isPending}>{lead.isPending ? "Joining…" : "Get first access"}</button>
    </form>
  );
}
