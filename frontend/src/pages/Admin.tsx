import { useState } from "react";
import { CalendarCog, Edit3, Plus, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type EditorForm = {
  slug: string;
  title: string;
  destination: string;
  category: "umrah" | "express_umrah" | "world";
  status: "book_now" | "priority_reservation" | "waitlist" | "coming_soon" | "notify_me";
  reservationMode: "interest" | "priority_hold" | "deposit" | "full_payment";
  shortDescription: string;
  heroImage: string;
  departureDate: string;
  returnDate: string;
  durationDays: string;
  nights: string;
  departureAirport: string;
  returnAirport: string;
  startingPrice: string;
  priceLabel: string;
  depositCents: string;
  holidayUsed: string;
  estimatedPtoDays: string;
  schoolBreakNote: string;
  expressUmrahEligible: boolean;
  extensionTiming: "none" | "before" | "after" | "both";
  leaderName: string;
  leaderRole: string;
  stayPlan: string;
};

const emptyForm: EditorForm = {
  slug: "", title: "", destination: "", category: "world", status: "coming_soon", reservationMode: "interest",
  shortDescription: "", heroImage: "/manus-storage/bosnia-mostar_053d512e.jpg", departureDate: "", returnDate: "",
  durationDays: "", nights: "", departureAirport: "DFW", returnAirport: "", startingPrice: "", priceLabel: "Pricing coming soon", depositCents: "",
  holidayUsed: "", estimatedPtoDays: "", schoolBreakNote: "", expressUmrahEligible: false, extensionTiming: "none", leaderName: "", leaderRole: "", stayPlan: "",
};

function toDateInput(value: Date | null) { return value ? new Date(value).toISOString().slice(0, 10) : ""; }
function formatStays(itinerary: unknown) {
  return Array.isArray(itinerary)
    ? itinerary.filter((stay): stay is { location: string; hotel: string; nights: number } => Boolean(stay && typeof stay === "object" && typeof (stay as { location?: unknown }).location === "string" && typeof (stay as { hotel?: unknown }).hotel === "string" && typeof (stay as { nights?: unknown }).nights === "number")).map(stay => `${stay.location} | ${stay.hotel} | ${stay.nights}`).join("\n")
    : "";
}
function parseStays(value: string) {
  return value.split("\n").map(line => line.split("|").map(part => part.trim())).filter(parts => parts.length === 3 && parts[0] && parts[1] && Number(parts[2]) > 0).map(([location, hotel, nights]) => ({ location, hotel, nights: Number(nights) }));
}

export default function Admin() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: trips = [], isLoading, error } = trpc.admin.listTrips.useQuery(undefined, { retry: false });
  const [form, setForm] = useState<EditorForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const update = (field: keyof EditorForm, value: string | boolean) => setForm(current => ({ ...current, [field]: value }));
  const mutation = trpc.admin.upsertTrip.useMutation({
    onSuccess: () => { toast.success(editingId ? "Departure updated" : "Departure created"); utils.admin.listTrips.invalidate(); setForm(emptyForm); setEditingId(null); },
    onError: error => toast.error(error.message),
  });

  const startEditing = (trip: typeof trips[number]) => {
    setEditingId(trip.id);
    setForm({
      slug: trip.slug, title: trip.title, destination: trip.destination, category: trip.category, status: trip.status, reservationMode: trip.reservationMode,
      shortDescription: trip.shortDescription ?? "", heroImage: trip.heroImage ?? "", departureDate: toDateInput(trip.departureDate), returnDate: toDateInput(trip.returnDate),
      durationDays: trip.durationDays?.toString() ?? "", nights: trip.nights?.toString() ?? "", departureAirport: trip.departureAirport ?? "", returnAirport: trip.returnAirport ?? "",
      startingPrice: trip.startingPrice?.toString() ?? "", priceLabel: trip.priceLabel ?? "", depositCents: trip.depositCents?.toString() ?? "", holidayUsed: trip.holidayUsed ?? "", estimatedPtoDays: trip.estimatedPtoDays?.toString() ?? "",
      schoolBreakNote: trip.schoolBreakNote ?? "", expressUmrahEligible: trip.expressUmrahEligible, extensionTiming: trip.extensionTiming, leaderName: trip.leaderName ?? "", leaderRole: trip.leaderRole ?? "", stayPlan: formatStays(trip.itinerary),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate({
      ...form,
      slug: form.slug.toLowerCase().replace(/\s+/g, "-"),
      shortDescription: form.shortDescription || undefined,
      heroImage: form.heroImage || undefined,
      departureDate: form.departureDate || undefined,
      returnDate: form.returnDate || undefined,
      durationDays: form.durationDays ? Number(form.durationDays) : undefined,
      nights: form.nights ? Number(form.nights) : undefined,
      departureAirport: form.departureAirport || undefined,
      returnAirport: form.returnAirport || undefined,
      startingPrice: form.startingPrice ? Number(form.startingPrice) : undefined,
      priceLabel: form.priceLabel || undefined,
      depositCents: form.depositCents ? Math.round(Number(form.depositCents) * 100) : null,
      holidayUsed: form.holidayUsed || undefined,
      estimatedPtoDays: form.estimatedPtoDays ? Number(form.estimatedPtoDays) : undefined,
      schoolBreakNote: form.schoolBreakNote || undefined,
      leaderName: form.leaderName || undefined,
      leaderRole: form.leaderRole || undefined,
      itinerary: parseStays(form.stayPlan),
    });
  };

  return <DashboardLayout><div className="admin-shell">
    <div className="admin-title"><div><p className="eyebrow">Administrator</p><h1>Departure desk</h1><p>Every trip is a database object. Change holiday alignment, routing, dates, PTO, pricing labels, accommodations, and availability here—without rebuilding the public site.</p></div><div className="admin-title-icon"><CalendarCog /></div></div>
    {user?.role !== "admin" ? <div className="admin-locked"><ShieldCheck /><h2>Administrator access required</h2><p>This desk is reserved for the project owner and approved administrators.</p></div> : <>
      <section className="admin-media-toolbar"><a href="/admin/media">Destination galleries</a><a href="/admin/settings">Public contact settings</a></section><section className="admin-kpi-row"><div><span>Published / planning</span><strong>{trips.length}</strong></div><div><span>PTO is editable</span><strong>Yes</strong></div><div><span>Customer-facing rebuild</span><strong>Never</strong></div></section>
      <section className="admin-editor">
        <div className="admin-editor-heading"><div><p className="eyebrow">{editingId ? "Editing departure" : "New departure"}</p><h2>{editingId ? form.title || "Untitled departure" : "Create an editable trip"}</h2></div>{editingId ? <button className="admin-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel edit</button> : null}</div>
        <form className="admin-form" onSubmit={submit}>
          <label>Trip title<input required value={form.title} onChange={e => update("title", e.target.value)} placeholder="Jamaica · Presidents Day" /></label>
          <label>URL slug<input required value={form.slug} onChange={e => update("slug", e.target.value)} placeholder="jamaica-presidents-day-2028" /></label>
          <label>Destination<input required value={form.destination} onChange={e => update("destination", e.target.value)} placeholder="Jamaica" /></label>
          <label>Category<select value={form.category} onChange={e => update("category", e.target.value)}><option value="world">World journey</option><option value="umrah">Umrah</option><option value="express_umrah">Express Umrah</option></select></label>
          <label>Status<select value={form.status} onChange={e => update("status", e.target.value)}><option value="book_now">Book now</option><option value="priority_reservation">Priority reservation</option><option value="waitlist">Join waitlist</option><option value="coming_soon">Coming soon</option><option value="notify_me">Notify me</option></select></label>
          <label>Reservation mode<select value={form.reservationMode} onChange={e => update("reservationMode", e.target.value)}><option value="interest">Interest</option><option value="priority_hold">Priority hold</option><option value="deposit">Deposit</option><option value="full_payment">Full payment</option></select></label>
          <label>Departure date<input type="date" value={form.departureDate} onChange={e => update("departureDate", e.target.value)} /></label>
          <label>Return date<input type="date" value={form.returnDate} onChange={e => update("returnDate", e.target.value)} /></label>
          <label>Departure airport<input value={form.departureAirport} onChange={e => update("departureAirport", e.target.value)} placeholder="DFW" /></label>
          <label>Return airport<input value={form.returnAirport} onChange={e => update("returnAirport", e.target.value)} placeholder="JED" /></label>
          <label>Travel days<input min="1" max="60" type="number" value={form.durationDays} onChange={e => update("durationDays", e.target.value)} /></label>
          <label>Nights<input min="1" max="59" type="number" value={form.nights} onChange={e => update("nights", e.target.value)} /></label>
          <label className="admin-highlight-field">Estimated PTO days<input min="0" max="20" type="number" value={form.estimatedPtoDays} onChange={e => update("estimatedPtoDays", e.target.value)} /></label>
          <label>Holiday used<input value={form.holidayUsed} onChange={e => update("holidayUsed", e.target.value)} placeholder="Presidents Day Weekend" /></label>
          <label>Price label<input value={form.priceLabel} onChange={e => update("priceLabel", e.target.value)} placeholder="Pricing coming soon" /></label>
          <label>Starting price<input min="0" type="number" value={form.startingPrice} onChange={e => update("startingPrice", e.target.value)} placeholder="Leave blank if unconfirmed" /></label>
          <label className="admin-highlight-field">Stripe deposit (USD)<input min="0.50" step="0.01" type="number" value={form.depositCents} onChange={e => update("depositCents", e.target.value)} placeholder="e.g. 500.00" /><small>Used only when reservation mode is Deposit.</small></label>
          <label>Hero image URL<input value={form.heroImage} onChange={e => update("heroImage", e.target.value)} /></label>
          <label>School-break note<input value={form.schoolBreakNote} onChange={e => update("schoolBreakNote", e.target.value)} /></label>
          <label>Extension timing<select value={form.extensionTiming} onChange={e => update("extensionTiming", e.target.value)}><option value="none">None</option><option value="before">Before this tour</option><option value="after">After this tour</option><option value="both">Before or after</option></select></label>
          <label>Leader name<input value={form.leaderName} onChange={e => update("leaderName", e.target.value)} /></label>
          <label>Leader role<input value={form.leaderRole} onChange={e => update("leaderRole", e.target.value)} /></label>
          <label className="form-full">Short description<textarea rows={3} value={form.shortDescription} onChange={e => update("shortDescription", e.target.value)} /></label>
          <label className="form-full">Accommodation plan<textarea rows={3} value={form.stayPlan} onChange={e => update("stayPlan", e.target.value)} placeholder={"Madinah | Shaza Regency | 4\nMakkah | DoubleTree by Hilton Jabal Omar | 4"} /><small>One stay per line: location | hotel | nights</small></label>
          <label className="check-label form-full"><input type="checkbox" checked={form.expressUmrahEligible} onChange={e => update("expressUmrahEligible", e.target.checked)} /> Express Umrah extension eligible</label>
          <button className="admin-save form-full" disabled={mutation.isPending}><Save size={16} /> {mutation.isPending ? "Saving…" : editingId ? "Save trip changes" : "Create trip"}</button>
        </form>
      </section>
      <section className="managed-trips"><div className="managed-trips-heading"><div><p className="eyebrow">All trip objects</p><h2>Manage dates, PTO, and availability</h2></div><button className="admin-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Plus size={15} /> New trip</button></div>{isLoading ? <p>Loading departures…</p> : error ? <p className="error-note">Unable to load trip objects.</p> : <div className="managed-table"><div className="table-head"><span>Departure</span><span>Dates</span><span>PTO</span><span>Status</span><span /></div>{trips.map(trip => <div className="managed-row" key={trip.id}><span><strong>{trip.title}</strong><small>{trip.destination}</small></span><span>{trip.departureDate ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(trip.departureDate)) : "TBC"}</span><span className="pto-cell">{trip.estimatedPtoDays ?? "—"} PTO</span><span><i className={`mini-status mini-status--${trip.status}`} />{trip.status.replace(/_/g, " ")}</span><button onClick={() => startEditing(trip)}><Edit3 size={15} /> Edit</button></div>)}</div>}</section>
    </>}
  </div></DashboardLayout>;
}
