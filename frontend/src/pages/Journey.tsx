import { useEffect, useState } from "react";
import { CalendarDays, Check, ChevronLeft, Clock3, Plane, Star } from "lucide-react";
import { Link, useRoute } from "wouter";
import { toursApi, reviewsApi, type Tour } from "@/lib/api";
import { ReservationDialog, durationLabel } from "@/lib/tripUi";

type Review = { id: number; author_name: string; rating: number; comment: string };

export default function Journey() {
  const [, params] = useRoute("/journeys/:slug");
  const slug = params?.slug ?? "";
  const [trip, setTrip] = useState<Tour | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReservation, setShowReservation] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setIsLoading(true);
    toursApi.get(slug).then((data) => { if (!cancelled) setTrip(data); }).finally(() => { if (!cancelled) setIsLoading(false); });
    reviewsApi.list(slug).then((data) => { if (!cancelled) setReviews(data as Review[]); }).catch(() => { if (!cancelled) setReviews([]); });
    return () => { cancelled = true; };
  }, [slug]);

  if (isLoading) return <main className="journey-page"><p>Loading journey…</p></main>;
  if (!trip) return <main className="journey-page"><Link href="/"><ChevronLeft size={16} /> Back to journeys</Link><h1>Journey not found</h1><p>This departure may have been updated or removed from the tour catalog.</p></main>;

  return (
    <main className="journey-page">
      <header className="journey-nav"><Link href="/"><ChevronLeft size={16} /> All journeys</Link><Link href="/traveler">Traveler portal</Link></header>
      <section className="journey-hero" role="img" aria-label={`${trip.destination?.name} image for ${trip.title}`} style={{ backgroundImage: `linear-gradient(90deg,rgba(4,17,18,.9),rgba(4,17,18,.35)),url(${trip.cover_image || "kaaba-night_d708ab92.jpg"})` }}>
        <div>
          <p className="eyebrow eyebrow--light">{trip.destination?.name}, {trip.destination?.country}</p>
          <h1>{trip.title}</h1><p>{trip.summary}</p>
          <div className="journey-hero-facts"><span><CalendarDays /> {durationLabel(trip)}</span><span><Clock3 /> {trip.duration_days} days · {trip.duration_nights} nights</span><span><Plane /> Depart {trip.departure_city ?? "TBC"}</span></div>
          <button className="button button--sand" type="button" onClick={() => setShowReservation(true)}>Reserve your place</button>
        </div>
      </section>

      <section className="journey-detail-grid">
        <div><p className="eyebrow">Why this journey works</p><h2>Time away, thoughtfully planned.</h2><div className="why-date"><div><span>Rating</span><strong>{trip.rating ? `${trip.rating.toFixed(1)} / 5` : "New departure"}</strong></div><div><span>Reviews</span><strong>{trip.review_count ?? 0}</strong></div><div><span>Departure city</span><strong>{trip.departure_city ?? "To be confirmed"}</strong></div></div></div>
        <div className="journey-card"><p className="eyebrow">What's included</p><ul>{(trip.halal_features?.length ? trip.halal_features : ["Premium accommodations", "Daily breakfast", "Private ground transport", "Guided support and preparation", "24/7 trip support"]).map((feature) => <li key={feature}><Check /> {feature}</li>)}</ul><small>Specific inclusions, exclusions, and payment schedules are confirmed per departure.</small></div>
      </section>

      {trip.itinerary?.length ? <section className="journey-stays"><p className="eyebrow">Day by day</p><h2>What to expect on this journey.</h2><div>{trip.itinerary.map((day) => <article key={day.id}><span>Day {day.day}</span><h3>{day.title}</h3><p>{day.description}</p></article>)}</div></section> : null}
      {reviews.length ? <section className="journey-gallery"><div><p className="eyebrow">Traveler reviews</p><h2>What past travelers say.</h2></div><div className="journey-gallery-grid">{reviews.map((review) => <figure key={review.id}><p><Star size={14} /> {review.rating} / 5 — <strong>{review.author_name}</strong></p><figcaption>{review.comment}</figcaption></figure>)}</div></section> : null}

      <section className="journey-reserve"><p className="eyebrow">Ready when you are</p><h2>Make space for a journey that matters.</h2><button className="button button--primary" type="button" onClick={() => setShowReservation(true)}>Review reservation options</button></section>
      {showReservation ? <ReservationDialog trip={trip} onClose={() => setShowReservation(false)} /> : null}
    </main>
  );
}
