import { useEffect, useState } from "react";
import { CalendarDays, Check, ChevronRight, Clock3, Moon, Plane, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { toursApi, type Tour } from "@/lib/api";
import { SiteHeader, SiteFooter, MobileBookBar } from "@/components/site/SiteChrome";
import Reveal, { RevealGroup, RevealItem } from "@/components/Reveal";
import { Price, ReservationDialog, durationLabel } from "@/lib/tripUi";

const FALLBACK_HERO = "kaaba-night_d708ab92.jpg";

export default function Home() {
  const [trips, setTrips] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Tour | null>(null);

  useEffect(() => {
    let cancelled = false;
    toursApi
      .list()
      .then((data) => {
        if (!cancelled) setTrips(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const flagship =
    trips.find((trip) => trip.slug === "thanksgiving-umrah-2026") ??
    trips.find((trip) => trip.destination?.name?.toLowerCase().includes("umrah")) ??
    trips[0];
  const heroImage = flagship?.cover_image || FALLBACK_HERO;

  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="hero" id="top" role="img" aria-label="Nighttime Kaaba scene representing premium Umrah journeys" style={{ backgroundImage: `linear-gradient(90deg, rgba(4,17,18,.95) 0%, rgba(4,17,18,.78) 45%, rgba(4,17,18,.25) 100%), url(${heroImage})` }}>
        <motion.div className="hero-content" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <motion.p className="eyebrow eyebrow--light" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.5 }}>DFW based · Globally connected</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.6 }}>Journeys that move you.<br /><em>Travel that keeps you grounded.</em></motion.h1>
          <motion.p className="hero-copy" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.6 }}>Premium Umrah and thoughtfully curated journeys around the world—designed for Muslim travelers, families, and communities who want extraordinary experiences without compromising what matters.</motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.6 }}>
            <Link className="button button--sand" href="/destinations">Explore Umrah <ChevronRight size={16} /></Link>
            <Link className="button button--ghost" href="/register/thanksgiving-umrah-2026">Register for November Umrah <ChevronRight size={16} /></Link>
            <Link className="button button--ghost" href="/destinations">Explore the world</Link>
          </motion.div>
          <motion.p className="hero-trust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.6 }}>GROUP TRAVEL, THOUGHTFULLY DESIGNED</motion.p>
        </motion.div>
        {flagship ? (
          <motion.aside className="hero-trip" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <p>Next sacred journey</p><strong>{flagship.title}</strong><span>{durationLabel(flagship)}</span>
            <div><Clock3 size={16} /> {flagship.duration_days} days · {flagship.duration_nights} nights</div>
            <Link href={`/journeys/${flagship.slug}`}>View full journey <ChevronRight size={15} /></Link>
          </motion.aside>
        ) : null}
      </section>

      <Reveal as="section" className="value-strip" y={16} aria-label="Travel commitments">
        <span><CalendarDays /> PTO-Smart departures</span><span><Moon /> Prayer-aware planning</span><span><Plane /> Thoughtful group logistics</span><span><Sparkles /> Family-ready pacing</span>
      </Reveal>

      <section className="two-ways section-pad">
        <Reveal as="div" className="section-intro"><p className="eyebrow">Designed for the way you live</p><h2>Two ways to travel with purpose.</h2></Reveal>
        <RevealGroup as="div" className="two-cards">
          <RevealItem as="article" className="way-card way-card--sacred">
            <p className="eyebrow eyebrow--light">Sacred journeys</p><h3>Umrah</h3><p>From first-timers to returning pilgrims, travel with preparation, comfortable stays, guided worship, and a team focused on the details.</p>
            <Link href="/destinations">View Umrah departures <ChevronRight size={16} /></Link>
          </RevealItem>
          <RevealItem as="article" className="way-card way-card--world">
            <p className="eyebrow">World journeys</p><h3>Explore without compromise.</h3><p>Remarkable places planned with halal-conscious dining, prayer, family comfort, culture, nature, and meaningful connection in mind.</p>
            <Link href="/destinations">Explore destinations <ChevronRight size={16} /></Link>
          </RevealItem>
        </RevealGroup>
      </section>

      <section className="flagship-section section-pad" id="umrah">
        {flagship ? (
          <>
            <Reveal
              as="div"
              className="flagship-photo"
              y={0}
              role="img"
              aria-label="Makkah scene for the flagship Umrah journey"
              style={{ backgroundImage: `url(${flagship.cover_image || heroImage})` }}
            />
            <Reveal as="div" className="flagship-copy" delay={0.1}>
              <p className="eyebrow">Flagship journey · {flagship.destination?.name}</p><h2>{flagship.title}</h2><p className="lead">Step away from the noise. Return with a renewed heart.</p>
              <div className="journey-facts"><span><CalendarDays /> {durationLabel(flagship)}</span><span><Clock3 /> {flagship.duration_days} days · {flagship.duration_nights} nights</span><span><Plane /> Depart {flagship.departure_city ?? "TBC"}</span></div>
              {flagship.halal_features?.length ? (
                <div className="stay-grid">
                  {flagship.halal_features.map((feature) => (
                    <div key={feature}><strong>{feature}</strong></div>
                  ))}
                </div>
              ) : null}
              <div className="flagship-bottom">
                <Price trip={flagship} emphasis />
                <div className="flagship-actions">
                  <Link className="button button--outline" href={`/journeys/${flagship.slug}`}>View journey</Link>
                  <Link className="button button--primary" href="/register/thanksgiving-umrah-2026">Register now <ChevronRight size={16} /></Link>
                  <button className="button button--primary" onClick={() => setSelectedTrip(flagship)}>Reserve your spot <ChevronRight size={16} /></button>
                </div>
              </div>
              <p className="quiet-note">Pricing shown is per traveler and may vary by departure date.</p>
            </Reveal>
          </>
        ) : isLoading ? (
          <div className="empty-state">Loading the flagship departure…</div>
        ) : (
          <div className="empty-state">The flagship departure will appear here when it is published in the tour catalog.</div>
        )}
      </section>

      <section className="included section-pad">
        <Reveal as="div"><p className="eyebrow">What travelers can expect</p><h2>The details you shouldn't have to worry about.</h2></Reveal>
        <RevealGroup as="div" className="included-grid">
          <RevealItem as="article"><Check /><h3>Halal-conscious dining</h3><p>Appropriate options are identified whenever available, with limitations communicated clearly.</p></RevealItem>
          <RevealItem as="article"><Check /><h3>Prayer-aware itineraries</h3><p>Daily pacing, stops, and activities are considered with prayer in mind.</p></RevealItem>
          <RevealItem as="article"><Check /><h3>Family comfort</h3><p>Transportation, pacing, and experiences are designed for families and multigenerational groups.</p></RevealItem>
          <RevealItem as="article"><Check /><h3>Peace of mind</h3><p>Clear communications, preparation, and coordinated support from home to destination.</p></RevealItem>
        </RevealGroup>
      </section>

      <Reveal as="section" className="final-cta" y={20} role="img" aria-label="Nighttime Kaaba scene representing a journey from DFW to the world">
        <div>
          <p className="eyebrow eyebrow--light">From DFW to the world</p><h2>The world is waiting.<br /><em>How will you meet it?</em></h2>
          <p>Begin with Umrah. Continue across continents. Discover remarkable places alongside people who understand how you want to travel.</p>
          <Link className="button button--sand" href="/destinations">Find my journey <ChevronRight size={16} /></Link>
        </div>
      </Reveal>

      <SiteFooter />
      <MobileBookBar />
      {selectedTrip ? <ReservationDialog trip={selectedTrip} onClose={() => setSelectedTrip(null)} /> : null}
    </main>
  );
}
