import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/LoginForm";
import { bookingsApi, enquiriesApi, type Tour, type TravelerUploadDraft } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type Trip = Tour;
export function durationLabel(trip: Trip) { return trip.duration_days ? `${trip.duration_days} days · ${trip.duration_nights} nights` : "Dates to be confirmed"; }
export function contactLinks(phone: string, whatsapp: string) { const d = phone.replace(/\D/g, ""); return { telephone: `+${d.length === 10 ? `1${d}` : d}`, whatsapp: whatsapp.replace(/\D/g, "") }; }
export function Price({ trip, emphasis = false }: { trip: Trip; emphasis?: boolean }) { return <div className={emphasis ? "price-block price-block--emphasis" : "price-block"}><span>{trip.price ? "From" : "Planning"}</span><strong>{trip.price ? `${trip.currency ?? "$"}${Number(trip.price).toLocaleString()}` : "Coming soon"}</strong>{trip.price ? <small>per traveler</small> : null}</div>; }
export function DurationMetric({ trip, large = false }: { trip: Trip; large?: boolean }) { return <div className={large ? "pto-metric pto-metric--large" : "pto-metric"}><span className="pto-kicker">Trip length</span><strong>{trip.duration_days ?? "—"}<em> days</em></strong><small>{trip.duration_nights ? `${trip.duration_nights} nights` : "Nights to be confirmed"}</small></div>; }

type TravelerDraft = TravelerUploadDraft;
const emptyTraveler = (): TravelerDraft => ({ full_name: "", passport_number: "", date_of_birth: "", passport_status: "valid", mobility_assistance: "yes", passport_document: null, passport_photo: null });

const disclaimer = `DOCUMENTS REQUIRED\n\n1. 6 months Valid passport with 4 empty pages\n2. 1 passport-size photo with white background and front face from neck up\n\nRESPONSIBILITY\n\nThe responsibility of The agent assigned for Halal Trails Travel Group, LLC as the tour operator or their agents is limited.\n\nThe agent assigned for Halal Trails Travel Group, LLC acts only as an agent for passengers in making arrangements for airlines, hotels, buses or any other services in connection with this tour and assumes no liability for injury, damage, loss, accident, or delay. Irregularity which may occasionally occur either by reason of defect through the acts or defaults of any company or person engaged in conveying passengers or in carrying out the arrangements of the tour, or dangerous incidents in the air, sea, fire, breakdown in machinery, or equipment, acts of governments or other authorities, war whether declared or not, hostilities, civil disturbances, strikes, riots, theft, epidemics, quarantines, medical or customs regulations, or from any causes beyond - The agent assigned for Halal Trails Travel Group, LLC‘s control, or from any loss or damage resulting from improper passports, visas or other documents.\n\nThe agent assigned for Halal Trails Travel Group, LLC will accept no responsibility for the loss or additional expenses to delays or changes in schedule or other causes.\n\nThe agent assigned for Halal Trails Travel Group, LLC shall not be liable or responsible for any inconvenience, loss, damage or injury arising in connection with such services.\n\nThe agent assigned for Halal Trails Travel Group, LLC will not be responsible for failure to follow instructions, including but not limited to check-in and check-out times and baggage handling. In the event of a delay, it is the responsibility of the airlines to determine exactly what procedure will be followed. The policy chosen by that carrier shall be based on its procedures.\n\nThe agent assigned for Halal Trails Travel Group, LLC and its affiliates will not be responsible for any person(s) missing any part of the program due to his/her negligence or delay or absenteeism for any time during the tour and will not be responsible for any additional expenses for the participant to rejoin the tour.`;

export function ReservationDialog({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const { user, loading } = useAuth();
  const [departureDate, setDepartureDate] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [travelers, setTravelers] = useState<TravelerDraft[]>([emptyTraveler()]);
  const [paymentType, setPaymentType] = useState<"full_payment" | "down_payment">("full_payment");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "zelle">("card");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const updateTraveler = (index: number, field: keyof TravelerDraft, value: string | File | null) => setTravelers((current) => current.map((t, i) => i === index ? { ...t, [field]: value } : t));
  const totalPrice = trip.price ? Number(trip.price) * travelers.length : null;

  const validateStep = (form: HTMLFormElement) => {
    if (!form.reportValidity()) return false;
    for (const traveler of travelers) {
      if (!traveler.passport_document || !traveler.passport_photo) { toast.error("Passport and passport photo are required for every traveler."); return false; }
      if (traveler.passport_document.size > 10 * 1024 * 1024) { toast.error("Each passport file must be 10 MB or smaller."); return false; }
      if (traveler.passport_photo.size > 5 * 1024 * 1024) { toast.error("Each passport photo must be 5 MB or smaller."); return false; }
    }
    return true;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1) { if (validateStep(event.currentTarget)) setStep(2); return; }
    setSubmitting(true);
    try {
      const booking = await bookingsApi.create({ tour_slug: trip.slug, departure_date: departureDate, travelers, contact_email: contactEmail, contact_phone: contactPhone, payment_type: paymentType, payment_method: paymentMethod });
      toast.success("Your reservation request has been received.", { description: paymentMethod === "zelle" ? "Zelle was selected. The travel team will provide/confirm payment instructions." : "The travel team will follow up with the card payment step." });
      onClose();
      return booking;
    } catch (error) { toast.error("We could not submit your reservation.", { description: error instanceof Error ? error.message : "Please try again shortly." }); }
    finally { setSubmitting(false); }
  };

  return <AnimatePresence><motion.div className="dialog-backdrop" role="presentation" onMouseDown={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.section className="reservation-dialog" role="dialog" aria-modal="true" aria-labelledby="reserve-title" onMouseDown={(e) => e.stopPropagation()} initial={{ opacity: 0, y: 24, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }}>
    <button className="icon-button" onClick={onClose} aria-label="Close reservation form"><X size={19} /></button>
    <p className="eyebrow">Reserve · Step {step} of 2</p><h2 id="reserve-title">Reserve your place</h2><p className="dialog-trip"><strong>{trip.title}</strong><span>{durationLabel(trip)}</span></p>
    {loading ? <p className="secure-note">Checking your sign-in status…</p> : !user ? <><p className="secure-note">Sign in to submit a reservation request.</p><LoginForm /></> : <form onSubmit={submit} className="reserve-form">
      {step === 1 ? <>
        <label>Departure date<input required type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} /></label>
        <label>Contact email<input required type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></label>
        <label>Contact phone<input required type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} /></label>
        {travelers.map((traveler, index) => <div className="form-row" key={index}>
          <label>Traveler {index + 1} full name<input required value={traveler.full_name} onChange={(e) => updateTraveler(index, "full_name", e.target.value)} /></label>
          <label>Passport number<input required value={traveler.passport_number} onChange={(e) => updateTraveler(index, "passport_number", e.target.value)} /></label>
          <label>Date of birth<input required type="date" value={traveler.date_of_birth} onChange={(e) => updateTraveler(index, "date_of_birth", e.target.value)} /></label>
          <fieldset><legend>Passport Status <small>Passports must be valid until July 2027</small></legend><label><input required type="radio" name={`passport-status-${index}`} checked={traveler.passport_status === "valid"} onChange={() => updateTraveler(index, "passport_status", "valid")} /> Valid</label><label><input type="radio" name={`passport-status-${index}`} checked={traveler.passport_status === "expired"} onChange={() => updateTraveler(index, "passport_status", "expired")} /> Expired</label></fieldset>
          <fieldset><legend>Are you able to walk for 5+ hours without the use of a wheelchair, or will you need assistance to push your wheelchair?</legend><label><input required type="radio" name={`mobility-${index}`} checked={traveler.mobility_assistance === "yes"} onChange={() => updateTraveler(index, "mobility_assistance", "yes")} /> Yes</label><label><input type="radio" name={`mobility-${index}`} checked={traveler.mobility_assistance === "wheelchair_assistance"} onChange={() => updateTraveler(index, "mobility_assistance", "wheelchair_assistance")} /> Need help for pushing wheelchair</label></fieldset>
          <label>Passport Upload *<small>Please upload a clear picture/scan of your passport.</small><input required type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => updateTraveler(index, "passport_document", e.target.files?.[0] ?? null)} /></label>
          <label>Passport Photo *<small>Please upload a passport-size photo with a white background and front face from neck up.</small><input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => updateTraveler(index, "passport_photo", e.target.files?.[0] ?? null)} /></label>
          {travelers.length > 1 && <button type="button" className="icon-button" aria-label="Remove traveler" onClick={() => setTravelers((c) => c.filter((_, i) => i !== index))}><Trash2 size={15} /></button>}
        </div>)}
        <button type="button" className="admin-secondary" onClick={() => setTravelers((c) => [...c, emptyTraveler()])}><Plus size={15} /> Add another traveler</button>
        <button className="button button--primary" type="submit">Review reservation <ChevronRight size={16} /></button>
      </> : <>
        <div className="reservation-review"><p className="eyebrow">Review & Payment</p><div><span>Travelers</span><strong>{travelers.length}</strong></div><div><span>Departure date</span><strong>{departureDate}</strong></div><div><span>Total price</span><strong>{totalPrice ? `${trip.currency ?? "$"}${totalPrice.toLocaleString()}` : "To be confirmed"}</strong></div>
          <fieldset><legend>Payment</legend><label><input type="radio" name="payment-type" checked={paymentType === "full_payment"} onChange={() => setPaymentType("full_payment")} /> Full Payment</label><label><input type="radio" name="payment-type" checked={paymentType === "down_payment"} onChange={() => setPaymentType("down_payment")} /> Down Payment ONLY</label></fieldset>
          <fieldset><legend>Payment Method</legend><label><input type="radio" name="payment-method" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} /> Credit/Debit Card</label><label><input type="radio" name="payment-method" checked={paymentMethod === "zelle"} onChange={() => setPaymentMethod("zelle")} /> Zelle</label></fieldset>
          {paymentMethod === "card" ? <p className="secure-note">Card details are not stored in this website. The secure card checkout will use the existing payment provider flow.</p> : <p className="secure-note">Zelle selected. Payment instructions and verification will be handled by the travel team.</p>}
        </div>
        <section className="reservation-disclaimer"><p className="eyebrow">DISCLAIMER</p><pre>{disclaimer}</pre></section>
        <div className="review-actions"><button className="admin-secondary" type="button" onClick={() => setStep(1)}>Back</button><button className="button button--primary" type="submit" disabled={submitting}>{submitting ? "Sending request…" : "Submit reservation request"}<ChevronRight size={16} /></button></div>
      </>}
    </form>}
    <p className="secure-note">Passport documents are submitted as part of your private reservation and are not placed in the public website.</p>
  </motion.section></motion.div></AnimatePresence>;
}

export function LeadCapture() {
  const [firstName, setFirstName] = useState(""); const [email, setEmail] = useState(""); const [interest, setInterest] = useState("Umrah"); const [submitting, setSubmitting] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setSubmitting(true); try { await enquiriesApi.create({ name: firstName, email, message: `I'm interested in: ${interest}. Please add me to the first-access list.` }); toast.success("You're on the first-access list."); setFirstName(""); setEmail(""); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to submit right now."); } finally { setSubmitting(false); } };
  return <form className="lead-form" onSubmit={submit}><input aria-label="First name" placeholder="First name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} /><input aria-label="Email address" placeholder="Email address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /><select aria-label="Interest" value={interest} onChange={(e) => setInterest(e.target.value)}><option>Umrah</option><option>Express Umrah</option><option>Bosnia</option><option>Morocco</option><option>Spain</option><option>Global journeys</option></select><button className="button button--sand" disabled={submitting}>{submitting ? "Joining…" : "Get first access"}</button></form>;
}
