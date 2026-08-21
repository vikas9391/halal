import { useEffect, useState } from "react";
import { CalendarCog, CreditCard, MapPin, MessageSquare, Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminApi, type AdminSummary } from "@/lib/api";

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

export default function Admin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [bookingData, summaryData] = await Promise.all([adminApi.bookings(), adminApi.summary()]);
    setBookings(bookingData as Booking[]); setSummary(summaryData);
  };
  useEffect(() => { load().catch(() => setError("Unable to load admin data.")).finally(() => setIsLoading(false)); }, []);

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
