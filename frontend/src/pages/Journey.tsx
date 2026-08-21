import { CalendarDays, Check, ChevronLeft, Clock3, Plane, UserRound } from "lucide-react";
import { skipToken } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

function dateRange(departureDate: Date | null, returnDate: Date | null) {
  if (!departureDate || !returnDate) return "Dates to be confirmed";
  const format = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });
  return `${format.format(new Date(departureDate))} – ${format.format(new Date(returnDate))}`;
}

function stays(value: unknown) {
  if (!Array.isArray(value)) return [] as Array<{ location: string; hotel: string; nights: number }>;
  return value.filter((stay): stay is { location: string; hotel: string; nights: number } => Boolean(stay && typeof stay === "object" && typeof (stay as { location?: unknown }).location === "string" && typeof (stay as { hotel?: unknown }).hotel === "string" && typeof (stay as { nights?: unknown }).nights === "number"));
}

export default function Journey() {
  const [, params] = useRoute("/journeys/:slug");
  const slug = params?.slug ?? "";
  const { data: trip, isLoading } = trpc.trips.bySlug.useQuery({ slug }, { enabled: Boolean(slug) });
  const { data: gallery = [] } = trpc.trips.gallery.useQuery(trip ? { tripId: trip.id } : skipToken);
  if (isLoading) return <main className="journey-page"><p>Loading journey…</p></main>;
  if (!trip) return <main className="journey-page"><Link href="/"><ChevronLeft size={16} /> Back to journeys</Link><h1>Journey not found</h1><p>This departure may have been updated or removed from the planning calendar.</p></main>;
  const accommodation = stays(trip.itinerary);
  return <main className="journey-page">
    <header className="journey-nav"><Link href="/"><ChevronLeft size={16} /> All journeys</Link><Link href="/traveler">Traveler portal</Link></header>
    <section className="journey-hero" role="img" aria-label={`${trip.destination} image for ${trip.title}`} style={{ backgroundImage: `linear-gradient(90deg,rgba(4,17,18,.9),rgba(4,17,18,.35)),url(${trip.heroImage || "/manus-storage/kaaba-night_d708ab92.jpg"})` }}><div><p className="eyebrow eyebrow--light">{trip.category === "umrah" ? "Sacred journey" : "World journey"} · {trip.holidayUsed ?? "Planning window"}</p><h1>{trip.title}</h1><p>{trip.shortDescription}</p><div className="journey-hero-facts"><span><CalendarDays /> {dateRange(trip.departureDate, trip.returnDate)}</span><span><Clock3 /> {trip.durationDays} days · {trip.nights} nights · {trip.estimatedPtoDays} PTO days</span><span><Plane /> Depart {trip.departureAirport ?? "TBC"} · Return {trip.returnAirport ?? "TBC"}</span></div><a className="button button--sand" href="/destinations">Reserve your place</a></div></section>
    <section className="journey-detail-grid"><div><p className="eyebrow">Why this date works</p><h2>Time away, thoughtfully planned.</h2><div className="why-date"><div><span>Federal holiday</span><strong>{trip.holidayUsed ?? "To be confirmed"}</strong></div><div><span>Estimated PTO</span><strong>{trip.estimatedPtoDays ?? "—"} days</strong></div><div><span>School planning</span><strong>{trip.schoolBreakNote ?? "Check local calendar"}</strong></div></div><p className="journey-body-copy">PTO estimates assume a typical Monday–Friday U.S. work schedule. Employer and school calendars vary.</p></div><div className="journey-card"><p className="eyebrow">What’s included when configured</p><ul><li><Check /> Premium accommodations</li><li><Check /> Daily breakfast</li><li><Check /> Private ground transport</li><li><Check /> Guided support and preparation</li><li><Check /> 24/7 trip support</li></ul><small>Specific inclusions, exclusions, and payment schedules are confirmed per departure.</small></div></section>
    {accommodation.length ? <section className="journey-stays"><p className="eyebrow">Where you’ll stay</p><h2>Comfort near what matters.</h2><div>{accommodation.map(stay => <article key={`${stay.location}-${stay.hotel}`}><span>{stay.location}</span><h3>{stay.hotel}</h3><p>{stay.nights} nights</p></article>)}</div></section> : null}
    {gallery.length ? <section className="journey-gallery"><div><p className="eyebrow">Destination gallery</p><h2>See the journey before you go.</h2></div><div className="journey-gallery-grid">{gallery.map(image => <figure key={image.id}><img src={image.imageUrl} alt={image.altText} />{image.caption ? <figcaption>{image.caption}</figcaption> : null}</figure>)}</div></section> : null}
    {trip.leaderName ? <section className="leader-section"><div className="leader-symbol"><UserRound /></div><div><p className="eyebrow eyebrow--light">Group leadership</p><h2>{trip.leaderName}</h2><p>{trip.leaderRole ?? "Trip leader"}</p><p>This departure is led with meaningful preparation, clear group communication, and support throughout the journey.</p></div></section> : null}
    <section className="journey-reserve"><p className="eyebrow">Ready when you are</p><h2>Make space for a journey that matters.</h2><a className="button button--primary" href="/destinations">Review reservation options</a></section>
  </main>;
}
