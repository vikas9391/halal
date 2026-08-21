import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Compass } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { toursApi, type Tour } from "@/lib/api";
import { SiteHeader, SiteFooter, MobileBookBar } from "@/components/site/SiteChrome";
import Reveal, { RevealGroup, RevealItem } from "@/components/Reveal";
import { Price, DurationMetric, ReservationDialog, durationLabel } from "@/lib/tripUi";

const FALLBACK_HERO = "/kaaba-night_d708ab92.jpg";

export default function Destinations() {
  const [trips, setTrips] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [destinationFilter, setDestinationFilter] = useState<string>("all");
  const [selectedTrip, setSelectedTrip] = useState<Tour | null>(null);

  useEffect(() => {
    let cancelled = false;
    toursApi
      .list()
      .then((data) => {
        if (!cancelled) setTrips(data);
      })
      .catch(() => {
        if (!cancelled) setError("Departures are temporarily unavailable. Please check back shortly.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const destinations = useMemo(
    () => Array.from(new Set(trips.map((trip) => trip.destination?.name).filter(Boolean))) as string[],
    [trips]
  );

  const filteredTrips = useMemo(
    () =>
      destinationFilter === "all"
        ? trips
        : trips.filter((trip) => trip.destination?.name === destinationFilter),
    [destinationFilter, trips]
  );

  const heroImage = trips.find((trip) => trip.cover_image)?.cover_image || FALLBACK_HERO;

  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="hero" style={{ minHeight: "42vh", backgroundImage: `linear-gradient(90deg, rgba(4,17,18,.92) 0%, rgba(4,17,18,.68) 55%, rgba(4,17,18,.25) 100%), url(${heroImage})` }} role="img" aria-label="Kaaba at night representing Umrah and world destinations">
        <motion.div className="hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="eyebrow eyebrow--light">Umrah & World Journeys</p>
          <h1>Find the time to go.</h1>
          <p className="hero-copy">Every departure below is drawn straight from the tour catalog—pricing and availability update without touching the site.</p>
        </motion.div>
      </section>

      <section className="departures section-pad" id="departures">
        <Reveal as="div" className="departures-header">
          <div><p className="eyebrow">Planning calendar</p><h2>Choose your journey.</h2></div>
        </Reveal>
        {destinations.length > 1 ? (
          <Reveal as="div" className="filter-bar" aria-label="Trip filters" delay={0.1}>
            <div className="filter-group">
              <button className={destinationFilter === "all" ? "is-active" : ""} onClick={() => setDestinationFilter("all")}>All journeys</button>
              {destinations.map((name) => (
                <button key={name} className={destinationFilter === name ? "is-active" : ""} onClick={() => setDestinationFilter(name)}>{name}</button>
              ))}
            </div>
          </Reveal>
        ) : null}
        {isLoading ? <div className="loading-grid"><span /><span /><span /></div> : null}
        {error ? <p className="error-note">{error}</p> : null}
        <RevealGroup as="div" className="trip-grid">
          {filteredTrips.map((trip) => {
            const image = trip.cover_image?.trim() || heroImage;
            return (
              <RevealItem key={trip.id} as="article" className="trip-card">
                <div className="trip-image" role="img" aria-label={`${trip.destination?.name} travel scene for ${trip.title}`}>
                  <img
                    src={image}
                    alt={`${trip.destination?.name} travel scene for ${trip.title}`}
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (target.src !== new URL(FALLBACK_HERO, window.location.href).href) {
                        target.src = FALLBACK_HERO;
                      }
                    }}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,19,20,.08), rgba(5,19,20,.88))" }} />
                  {trip.rating ? <span className="status-pill">★ {trip.rating.toFixed(1)} ({trip.review_count})</span> : null}
                </div>
                <div className="trip-body">
                  <p className="trip-location">{trip.destination?.name}, {trip.destination?.country}</p>
                  <h3>{trip.title}</h3>
                  <p className="trip-dates">{durationLabel(trip)}</p>
                  <div className="trip-metrics"><Price trip={trip} emphasis /><DurationMetric trip={trip} /></div>
                  <p className="trip-description">{trip.summary}</p>
                  <div className="card-actions">
                    <Link className="card-detail-link" href={`/journeys/${trip.slug}`}>Journey details <ChevronRight size={15} /></Link>
                    <button className="card-action" onClick={() => setSelectedTrip(trip)}>Reserve <ChevronRight size={16} /></button>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
        {!isLoading && filteredTrips.length === 0 ? <div className="empty-state">No departures currently match those filters. Change your selection or join the first-access list on our contact page.</div> : null}
      </section>

      <section className="world-section section-pad" id="world">
        <Reveal as="div" className="world-heading">
          <p className="eyebrow eyebrow--light">Global journeys</p>
          <h2>The world is bigger<br />when you travel together.</h2>
          <p>Culture. Nature. History. Adventure. Halal-conscious planning. Remarkable people.</p>
          <Link className="button button--sand" href="/contact">Get first access <Compass size={16} /></Link>
        </Reveal>
        <Reveal as="div" className="world-collage" delay={0.15}>
          <div className="collage-image collage-image--one" role="img" aria-label="Mostar bridge and river scene in Bosnia and Herzegovina" style={{ backgroundImage: "url(/bosnia-mostar_053d512e.jpg)" }} />
          <div className="collage-card"><span>Muslim-friendly travel</span><strong>More care. More connection. More world.</strong></div>
          <div className="collage-image collage-image--two" role="img" aria-label="Madinah mosque courtyard scene" style={{ backgroundImage: "url(/madinah-courtyard_bded3f4c.jpeg)" }} />
        </Reveal>
      </section>

      <SiteFooter />
      <MobileBookBar />
      {selectedTrip ? <ReservationDialog trip={selectedTrip} onClose={() => setSelectedTrip(null)} /> : null}
    </main>
  );
}
