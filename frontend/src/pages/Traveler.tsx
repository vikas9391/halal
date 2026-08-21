import { CalendarDays, ChevronLeft, Plane, Users } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { LoginForm } from "@/components/LoginForm";
import { bookingsApi } from "@/lib/api";

type Booking = {
  id: number;
  tour_slug: string;
  status: "pending" | "confirmed" | "cancelled";
  travelers: number;
  departure_date: string;
  total_price: number;
};

export default function Traveler() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    bookingsApi
      .list()
      .then((data) => {
        if (!cancelled) setBookings(data as Booking[]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) return <main className="traveler-page">Loading your travel space…</main>;

  if (!user) {
    return (
      <main className="traveler-page traveler-login">
        <Link href="/"><ChevronLeft size={16} /> Back to journeys</Link>
        <p className="eyebrow">Traveler portal</p>
        <h1>Your journey, in one calm place.</h1>
        <p>Sign in to review your reservations, traveler details, and status updates.</p>
        <div style={{ maxWidth: 360 }}>
          <LoginForm />
        </div>
      </main>
    );
  }

  return (
    <main className="traveler-page">
      <header className="traveler-header">
        <Link href="/"><ChevronLeft size={16} /> All journeys</Link>
        <span>Signed in as {user.full_name || user.email}</span>
      </header>
      <p className="eyebrow">Traveler portal</p>
      <h1>Welcome back{user.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}.</h1>
      <p className="traveler-sub">Your reservations will appear here as they are confirmed.</p>

      {isLoading ? (
        <div className="traveler-empty">Loading reservations…</div>
      ) : bookings.length ? (
        <div className="traveler-reservations">
          {bookings.map((booking) => (
            <article key={booking.id}>
              <div>
                <p className="eyebrow">{booking.status}</p>
                <h2>{booking.tour_slug}</h2>
                <p><CalendarDays size={15} /> {booking.departure_date ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(booking.departure_date)) : "Date TBC"}</p>
                <p><Users size={15} /> {booking.travelers} traveler{booking.travelers === 1 ? "" : "s"}</p>
              </div>
              <div className="traveler-status">
                <span>Reservation status</span>
                <strong>{booking.status}</strong>
                <span>Total price</span>
                <strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(booking.total_price)}</strong>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="traveler-empty">
          <Plane />
          <h2>Your next journey starts with a reservation.</h2>
          <p>Once you submit a reservation while signed in, its status and traveler details will appear here.</p>
          <Link className="button button--primary" href="/destinations">Explore departures</Link>
        </div>
      )}
    </main>
  );
}
