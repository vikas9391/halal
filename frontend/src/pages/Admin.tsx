import { useEffect, useState } from "react";
import { CalendarCog, Plane, Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { bookingsApi } from "@/lib/api";

/**
 * NOTE: The previous version of this page was a full trip create/edit form
 * (title, dates, pricing, PTO, deposit, gallery, etc.). That worked against
 * a tRPC `admin.listTrips` / `admin.upsertTrip` router that doesn't exist in
 * this project anymore — the Django backend only exposes a read-only tours
 * API (tours are managed elsewhere, e.g. Django admin), plus a real
 * bookings API. Until a tour-management endpoint exists on the backend,
 * this page shows what *is* real: incoming bookings.
 */

type Booking = {
  id: number;
  tour_slug: string;
  status: "pending" | "confirmed" | "cancelled";
  travelers: number;
  departure_date: string;
  total_price: number;
};

export default function Admin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    bookingsApi
      .list()
      .then((data) => {
        if (!cancelled) setBookings(data as Booking[]);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load bookings.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <DashboardLayout>
      <div className="admin-shell">
        <div className="admin-title">
          <div>
            <p className="eyebrow">Administrator</p>
            <h1>Bookings desk</h1>
            <p>
              Incoming reservation requests from the public site. Tour catalog editing
              (dates, pricing, galleries) isn't wired up yet — it needs a management
              endpoint on the backend.
            </p>
          </div>
          <div className="admin-title-icon"><CalendarCog /></div>
        </div>

        <section className="admin-kpi-row">
          <div><span>Total bookings</span><strong>{bookings.length}</strong></div>
          <div><span>Pending</span><strong>{pending}</strong></div>
          <div><span>Confirmed</span><strong>{confirmed}</strong></div>
        </section>

        <section className="managed-trips">
          <div className="managed-trips-heading">
            <div>
              <p className="eyebrow">All bookings</p>
              <h2>Reservation requests</h2>
            </div>
          </div>

          {isLoading ? (
            <p>Loading bookings…</p>
          ) : error ? (
            <p className="error-note">{error}</p>
          ) : bookings.length === 0 ? (
            <div className="empty-state">No bookings yet.</div>
          ) : (
            <div className="managed-table">
              <div className="table-head">
                <span>Tour</span>
                <span>Departure</span>
                <span><Users size={14} /> Travelers</span>
                <span>Status</span>
                <span>Total</span>
              </div>
              {bookings.map((booking) => (
                <div className="managed-row" key={booking.id}>
                  <span><strong>{booking.tour_slug}</strong></span>
                  <span>
                    {booking.departure_date
                      ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(booking.departure_date))
                      : "TBC"}
                  </span>
                  <span><Plane size={14} /> {booking.travelers}</span>
                  <span><i className={`mini-status mini-status--${booking.status}`} />{booking.status}</span>
                  <span>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(booking.total_price)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
