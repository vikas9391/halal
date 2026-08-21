import { useAuth } from "@/_core/hooks/useAuth";
import { LoginForm } from "@/components/LoginForm";
import { bookingsApi, enquiriesApi, type Tour } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// `Trip` is kept as an alias so existing page components don't need to
// rename every reference — it now points at the real Tour shape returned
// by the Django API instead of the old tRPC trips router.
export type Trip = Tour;

export function durationLabel(trip: Trip) {
  if (!trip.duration_days) return "Dates to be confirmed";
  return `${trip.duration_days} days · ${trip.duration_nights} nights`;
}

export function contactLinks(phone: string, whatsapp: string) {
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneWithCountry = phoneDigits.length === 10 ? `1${phoneDigits}` : phoneDigits;
  return { telephone: `+${phoneWithCountry}`, whatsapp: whatsapp.replace(/\D/g, "") };
}

export function Price({ trip, emphasis = false }: { trip: Trip; emphasis?: boolean }) {
  return (
    <div className={emphasis ? "price-block price-block--emphasis" : "price-block"}>
      <span>{trip.price ? "From" : "Planning"}</span>
      <strong>
        {trip.price
          ? `${trip.currency ?? "$"}${Number(trip.price).toLocaleString()}`
          : "Coming soon"}
      </strong>
      {trip.price ? <small>per traveler</small> : null}
    </div>
  );
}

export function DurationMetric({ trip, large = false }: { trip: Trip; large?: boolean }) {
  return (
    <div className={large ? "pto-metric pto-metric--large" : "pto-metric"}>
      <span className="pto-kicker">Trip length</span>
      <strong>
        {trip.duration_days ?? "—"}
        <em> days</em>
      </strong>
      <small>{trip.duration_nights ? `${trip.duration_nights} nights` : "Nights to be confirmed"}</small>
    </div>
  );
}

type TravelerDraft = { full_name: string; passport_number: string; date_of_birth: string };

const emptyTraveler = (): TravelerDraft => ({ full_name: "", passport_number: "", date_of_birth: "" });

export function ReservationDialog({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const { user, loading } = useAuth();
  const [departureDate, setDepartureDate] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [travelers, setTravelers] = useState<TravelerDraft[]>([emptyTraveler()]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const updateTraveler = (index: number, field: keyof TravelerDraft, value: string) => {
    setTravelers((current) =>
      current.map((traveler, i) => (i === index ? { ...traveler, [field]: value } : traveler))
    );
  };

  const totalPrice = trip.price ? Number(trip.price) * travelers.length : null;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1) {
      if (event.currentTarget.reportValidity()) setStep(2);
      return;
    }

    setSubmitting(true);
    try {
      await bookingsApi.create({
        tour_slug: trip.slug,
        departure_date: departureDate,
        travelers,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      });
      toast.success("Your reservation request has been received.", {
        description: "The travel team will follow up with the next steps.",
      });
      onClose();
    } catch (error) {
      toast.error("We could not submit your reservation.", {
        description: error instanceof Error ? error.message : "Please try again shortly.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="dialog-backdrop"
        role="presentation"
        onMouseDown={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.section
          className="reservation-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reserve-title"
          onMouseDown={(event) => event.stopPropagation()}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <button className="icon-button" onClick={onClose} aria-label="Close reservation form">
            <X size={19} />
          </button>
          <p className="eyebrow">Reserve · Step {step} of 2</p>
          <h2 id="reserve-title">Reserve your place</h2>
          <p className="dialog-trip">
            <strong>{trip.title}</strong>
            <span>{durationLabel(trip)}</span>
          </p>

          {loading ? (
            <p className="secure-note">Checking your sign-in status…</p>
          ) : !user ? (
            <>
              <p className="secure-note">Sign in to submit a reservation request.</p>
              <LoginForm />
            </>
          ) : (
            <form onSubmit={submit} className="reserve-form">
              {step === 1 ? (
                <>
                  <label>
                    Departure date
                    <input
                      required
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                    />
                  </label>
                  <label>
                    Contact email
                    <input
                      required
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </label>
                  <label>
                    Contact phone
                    <input
                      required
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </label>

                  {travelers.map((traveler, index) => (
                    <div className="form-row" key={index}>
                      <label>
                        Traveler {index + 1} full name
                        <input
                          required
                          value={traveler.full_name}
                          onChange={(e) => updateTraveler(index, "full_name", e.target.value)}
                        />
                      </label>
                      <label>
                        Passport number
                        <input
                          required
                          value={traveler.passport_number}
                          onChange={(e) => updateTraveler(index, "passport_number", e.target.value)}
                        />
                      </label>
                      <label>
                        Date of birth
                        <input
                          required
                          type="date"
                          value={traveler.date_of_birth}
                          onChange={(e) => updateTraveler(index, "date_of_birth", e.target.value)}
                        />
                      </label>
                      {travelers.length > 1 ? (
                        <button
                          type="button"
                          className="icon-button"
                          aria-label="Remove traveler"
                          onClick={() =>
                            setTravelers((current) => current.filter((_, i) => i !== index))
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : null}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="admin-secondary"
                    onClick={() => setTravelers((current) => [...current, emptyTraveler()])}
                  >
                    <Plus size={15} /> Add another traveler
                  </button>

                  <button className="button button--primary" type="submit">
                    Review reservation <ChevronRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div className="reservation-review">
                    <p className="eyebrow">Reservation summary</p>
                    <div>
                      <span>Travelers</span>
                      <strong>{travelers.length}</strong>
                    </div>
                    <div>
                      <span>Departure date</span>
                      <strong>{departureDate || "—"}</strong>
                    </div>
                    <div>
                      <span>Total price</span>
                      <strong>
                        {totalPrice ? `${trip.currency ?? "$"}${totalPrice.toLocaleString()}` : "To be confirmed"}
                      </strong>
                    </div>
                    <div>
                      <span>Next step</span>
                      <strong>Travel team confirms availability</strong>
                    </div>
                  </div>
                  <div className="review-actions">
                    <button className="admin-secondary" type="button" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button className="button button--primary" type="submit" disabled={submitting}>
                      {submitting ? "Sending request…" : "Submit reservation request"}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          <p className="secure-note">
            No card details are collected here. The travel team will follow up to confirm pricing and payment.
          </p>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}

export function LeadCapture() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("Umrah");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await enquiriesApi.create({
        name: firstName,
        email,
        message: `I'm interested in: ${interest}. Please add me to the first-access list.`,
      });
      toast.success("You're on the first-access list.");
      setFirstName("");
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="lead-form" onSubmit={submit}>
      <input
        aria-label="First name"
        placeholder="First name"
        required
        value={firstName}
        onChange={(event) => setFirstName(event.target.value)}
      />
      <input
        aria-label="Email address"
        placeholder="Email address"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <select aria-label="Interest" value={interest} onChange={(event) => setInterest(event.target.value)}>
        <option>Umrah</option>
        <option>Express Umrah</option>
        <option>Bosnia</option>
        <option>Morocco</option>
        <option>Spain</option>
        <option>Global journeys</option>
      </select>
      <button className="button button--sand" disabled={submitting}>
        {submitting ? "Joining…" : "Get first access"}
      </button>
    </form>
  );
}
