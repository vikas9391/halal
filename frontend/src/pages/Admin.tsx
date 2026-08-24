import { useEffect, useState } from "react";
import { CalendarCog, CreditCard, ExternalLink, MapPin, MessageSquare, RefreshCw, Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminApi, type AdminJotFormResponse, type AdminSummary } from "@/lib/api";

type Booking = {
  id: number;
  tour_slug: string;
  status: "pending" | "confirmed" | "cancelled";
  travelers: number;
  departure_date: string;
  total_price: number;
  payment_type?: string;
  payment_method?: string;
  customer?: { fullName: string; email: string; phone: string };
};

function submissionLabel(submission: AdminJotFormResponse["submissions"][number], terms: string[]) {
  const answers = submission.answers || {};
  for (const term of terms) {
    const entry = Object.values(answers).find((answer) => String(answer?.name || "").toLowerCase().includes(term.toLowerCase()));
    if (entry?.answer !== undefined && entry.answer !== null && String(entry.answer).trim()) return String(entry.answer);
    if (entry?.text) return entry.text;
  }
  return "—";
}

export default function Admin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [jotform, setJotform] = useState<AdminJotFormResponse | null>(null);
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJotformLoading, setIsJotformLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jotformError, setJotformError] = useState<string | null>(null);

  const load = async () => {
    const [bookingData, summaryData] = await Promise.all([adminApi.bookings(), adminApi.summary()]);
    setBookings(bookingData as Booking[]); setSummary(summaryData);
  };

  const loadJotform = async () => {
    setIsJotformLoading(true); setJotformError(null);
    try { setJotform(await adminApi.jotformRegistrations()); }
    catch (e) { setJotformError(e instanceof Error ? e.message : "Unable to load JotForm registrations."); }
    finally { setIsJotformLoading(false); }
  };

  useEffect(() => { load().catch(() => setError("Unable to load admin data.")).finally(() => setIsLoading(false)); loadJotform(); }, []);
  const changeStatus = async (id: number, status: Booking["status"]) => { await adminApi.updateBooking(id, { status }); await load(); };

  return <DashboardLayout>
    <div className="admin-shell">
      <div className="admin-title">
        <div><p className="eyebrow">Administrator</p><h1>Bookings desk</h1><p>One control center for reservations, customers, payments, enquiries and the tour catalog.</p></div>
        <div className="admin-title-icon"><CalendarCog /></div>
      </div>
      {error && <p className="error-note">{error}</p>}
      <section className="admin-kpi-row">
        <div><span>Total bookings</span><strong>{summary?.bookings.total ?? 0}</strong></div>
        <div><span>Pending</span><strong>{summary?.bookings.pending ?? 0}</strong></div>
        <div><span>Confirmed</span><strong>{summary?.bookings.confirmed ?? 0}</strong></div>
      </section>
      <section className="grid gap-4 md:grid-cols-4 my-6">
        <a href="/admin/tours" className="rounded-xl border border-[#e2dacb] bg-[#fffdf7] p-5"><MapPin size={18}/><strong className="block mt-3">Tours</strong><span className="text-sm opacity-65">Catalog, pricing, itinerary</span></a>
        <a href="/admin/customers" className="rounded-xl border border-[#e2dacb] bg-[#fffdf7] p-5"><Users size={18}/><strong className="block mt-3">Customers</strong><span className="text-sm opacity-65">{summary?.customers ?? 0} customer accounts</span></a>
        <a href="/admin/enquiries" className="rounded-xl border border-[#e2dacb] bg-[#fffdf7] p-5"><MessageSquare size={18}/><strong className="block mt-3">Enquiries</strong><span className="text-sm opacity-65">{summary?.enquiries ?? 0} open requests</span></a>
        <a href="/admin/payments" className="rounded-xl border border-[#e2dacb] bg-[#fffdf7] p-5"><CreditCard size={18}/><strong className="block mt-3">Payments</strong><span className="text-sm opacity-65">{summary?.payments.captured ?? 0} captured</span></a>
      </section>

      <section className="managed-trips mb-8">
        <div className="managed-trips-heading flex items-center justify-between gap-4"><div><p className="eyebrow">JotForm</p><h2>November 2026 Umrah Registrations</h2><p className="text-sm opacity-65">Live submissions from the Thanksgiving Break Umrah registration form.</p></div><div className="flex gap-2"><button className="admin-secondary" type="button" onClick={loadJotform} disabled={isJotformLoading}><RefreshCw size={15} className={isJotformLoading ? "animate-spin" : ""}/> Refresh</button>{jotform?.form_url ? <a className="admin-secondary" href={jotform.form_url} target="_blank" rel="noreferrer">Open JotForm <ExternalLink size={15}/></a> : null}</div></div>
        {isJotformLoading && !jotform ? <p>Loading JotForm registrations…</p> : jotformError ? <p className="error-note">{jotformError}</p> : jotform?.configured === false ? <div className="empty-state"><strong>JotForm connection is not configured yet.</strong><p>{jotform.message}</p><p>Set <code>JOTFORM_API_KEY</code> in the backend environment and redeploy.</p></div> : jotform?.submissions.length ? <div className="managed-table">
          <div className="table-head"><span>Submission</span><span>Primary passenger</span><span>Passengers</span><span>Contact</span><span>Submitted</span><span>Details</span></div>
          {jotform.submissions.map(submission => <div key={submission.id}>
            <div className="managed-row">
              <span><strong>#{submission.id}</strong><small>JotForm</small></span>
              <span>{submissionLabel(submission, ["Full Legal Name", "Full Legal First Name", "Full Name"])} </span>
              <span>{submissionLabel(submission, ["Number of Passengers", "Number of passengers"])}</span>
              <span>{submissionLabel(submission, ["Email Address", "Email"])}<small>{submissionLabel(submission, ["Mobile Phone", "Phone"])}</small></span>
              <span>{submission.created_at ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(submission.created_at)) : "—"}</span>
              <span><button className="admin-secondary" type="button" onClick={() => setExpandedSubmission(expandedSubmission === submission.id ? null : submission.id)}>{expandedSubmission === submission.id ? "Hide" : "View"}</button></span>
            </div>
            {expandedSubmission === submission.id ? <div className="rounded-xl border border-[#e2dacb] bg-[#fffdf7] p-5 m-3 overflow-auto max-h-[520px]"><div className="grid gap-3 md:grid-cols-2">{Object.entries(submission.answers || {}).map(([key, answer]) => <div key={key} className="rounded-lg border border-[#e2dacb] p-3"><small className="block opacity-60">{answer?.name || key}</small><strong className="block mt-1 break-words">{typeof answer?.answer === "object" ? JSON.stringify(answer.answer) : String(answer?.answer ?? answer?.text ?? "—")}</strong></div>)}</div></div> : null}
          </div>)}
        </div> : <div className="empty-state">No JotForm registrations yet.</div>}
      </section>

      <section className="managed-trips">
        <div className="managed-trips-heading"><div><p className="eyebrow">All bookings</p><h2>Reservation requests</h2></div></div>
        {isLoading ? <p>Loading bookings…</p> : bookings.length === 0 ? <div className="empty-state">No bookings yet. A customer booking will appear here after the reservation form is submitted.</div> : <div className="managed-table">
          <div className="table-head"><span>Tour</span><span>Customer</span><span>Departure</span><span>Travelers</span><span>Status</span><span>Total</span></div>
          {bookings.map(booking=><div className="managed-row" key={booking.id}>
            <span><strong>{booking.tour_slug}</strong><small>#{booking.id}</small></span>
            <span>{booking.customer?.fullName || "Customer"}<small>{booking.customer?.email}</small></span>
            <span>{new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"}).format(new Date(booking.departure_date))}</span>
            <span>{booking.travelers}</span>
            <span><select value={booking.status} onChange={e=>changeStatus(booking.id,e.target.value as Booking["status"])}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></select></span>
            <span>{new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(booking.total_price)}</span>
          </div>)}
        </div>}
      </section>
    </div>
  </DashboardLayout>;
}
