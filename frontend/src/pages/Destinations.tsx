import { useMemo, useState } from "react";
import { ChevronRight, Clock3, Compass } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { matchesTripFilters } from "@shared/trips";
import { SiteHeader, SiteFooter, MobileBookBar } from "@/components/site/SiteChrome";
import Reveal, { RevealGroup, RevealItem } from "@/components/Reveal";
import { Price, PtoMetric, ReservationDialog, statusLabels, dateRange, type Trip } from "@/lib/tripUi";

export default function Destinations() {
  const { data, isLoading, error } = trpc.trips.list.useQuery();
  const [filter, setFilter] = useState<"all" | "umrah" | "world">("all");
  const [ptoOnly, setPtoOnly] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const trips = (data ?? []) as Trip[];
  const filteredTrips = useMemo(() => trips.filter(trip => matchesTripFilters(trip, filter, ptoOnly)), [filter, ptoOnly, trips]);
  const heroImage = trips.find(trip => trip.category === "umrah")?.heroImage ?? "/manus-storage/kaaba-night_d708ab92.jpg";

  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="hero" style={{ minHeight: "42vh", backgroundImage: `linear-gradient(90deg, rgba(4,17,18,.92) 0%, rgba(4,17,18,.68) 55%, rgba(4,17,18,.25) 100%), url(${heroImage})` }} role="img" aria-label="Kaaba at night representing Umrah and world destinations">
        <motion.div className="hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="eyebrow eyebrow--light">Umrah & World Journeys</p>
          <h1>Find the time to go.</h1>
          <p className="hero-copy">Every departure below is an editable planning object—dates, holidays, pricing, and availability evolve without changing the site.</p>
        </motion.div>
      </section>

      <section className="departures section-pad" id="departures">
        <Reveal as="div" className="departures-header">
          <div><p className="eyebrow">Planning calendar</p><h2>Choose your journey.</h2></div>
        </Reveal>
        <Reveal as="div" className="filter-bar" aria-label="Trip filters" delay={0.1}>
          <div className="filter-group">
            <button className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>All journeys</button>
            <button className={filter === "umrah" ? "is-active" : ""} onClick={() => setFilter("umrah")}>Umrah</button>
            <button className={filter === "world" ? "is-active" : ""} onClick={() => setFilter("world")}>World</button>
          </div>
          <button className={ptoOnly ? "pto-filter is-active" : "pto-filter"} onClick={() => setPtoOnly(current => !current)}><Clock3 size={15} /> 4 PTO days or less</button>
        </Reveal>
        {isLoading ? <div className="loading-grid"><span /><span /><span /></div> : null}
        {error ? <p className="error-note">Departures are temporarily unavailable. Please check back shortly.</p> : null}
        <RevealGroup as="div" className="trip-grid">
          {filteredTrips.map(trip => (
            <RevealItem key={trip.id} as="article" className={trip.category === "world" ? "trip-card trip-card--world" : "trip-card"}>
              <div className="trip-image" role="img" aria-label={`${trip.destination} travel scene for ${trip.title}`} style={{ backgroundImage: `linear-gradient(180deg, rgba(5,19,20,.08), rgba(5,19,20,.88)), url(${trip.heroImage || heroImage})` }}>
                <span className={`status-pill status-pill--${trip.status}`}>{statusLabels[trip.status]}</span>
                {trip.expressUmrahEligible ? <span className="extension-pill">+ Express Umrah</span> : null}
              </div>
              <div className="trip-body">
                <p className="trip-location">{trip.destination} · {trip.holidayUsed ?? "Planning window"}</p>
                <h3>{trip.title}</h3>
                <p className="trip-dates">{dateRange(trip)} · {trip.durationDays ?? "—"} days</p>
                <div className="trip-metrics">{trip.category === "world" ? <PtoMetric trip={trip} large /> : <Price trip={trip} emphasis />}{trip.category === "world" ? <Price trip={trip} /> : <PtoMetric trip={trip} />}</div>
                <p className="trip-description">{trip.shortDescription}</p>
                <div className="card-actions">
                  <Link className="card-detail-link" href={`/journeys/${trip.slug}`}>Journey details <ChevronRight size={15} /></Link>
                  <button className="card-action" onClick={() => setSelectedTrip(trip)}>{statusLabels[trip.status]} <ChevronRight size={16} /></button>
                </div>
              </div>
            </RevealItem>
          ))}
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
          <div className="collage-image collage-image--one" role="img" aria-label="Mostar bridge and river scene in Bosnia and Herzegovina" style={{ backgroundImage: "url(/manus-storage/bosnia-mostar_053d512e.jpg)" }} />
          <div className="collage-card"><span>Muslim-friendly travel</span><strong>More care. More connection. More world.</strong></div>
          <div className="collage-image collage-image--two" role="img" aria-label="Madinah mosque courtyard scene" style={{ backgroundImage: "url(/manus-storage/madinah-courtyard_bded3f4c.jpeg)" }} />
        </Reveal>
      </section>

      <SiteFooter />
      <MobileBookBar />
      {selectedTrip ? <ReservationDialog trip={selectedTrip} onClose={() => setSelectedTrip(null)} /> : null}
    </main>
  );
}
