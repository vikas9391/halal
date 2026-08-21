import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { SiteHeader, SiteFooter, MobileBookBar } from "@/components/site/SiteChrome";
import Reveal, { RevealGroup, RevealItem } from "@/components/Reveal";

export default function About() {
  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="hero" style={{ minHeight: "46vh", backgroundImage: "linear-gradient(90deg, rgba(4,17,18,.93) 0%, rgba(4,17,18,.7) 55%, rgba(4,17,18,.25) 100%), url(/manus-storage/madinah-courtyard_bded3f4c.jpeg)" }} role="img" aria-label="Madinah mosque courtyard at dawn">
        <motion.div className="hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="eyebrow eyebrow--light">How we travel</p>
          <h1>Purpose in every mile.</h1>
          <p className="hero-copy">We believe an itinerary is more than a list of places. It is a thoughtful agreement about people, pace, and what deserves your attention.</p>
        </motion.div>
      </section>

      <section className="principles section-pad" id="how">
        <RevealGroup as="div" className="principle-list">
          <RevealItem as="article"><span>01</span><h3>Purpose</h3><p>Every itinerary should have a reason behind it.</p></RevealItem>
          <RevealItem as="article"><span>02</span><h3>People</h3><p>Great destinations become unforgettable through the people you experience them with.</p></RevealItem>
          <RevealItem as="article"><span>03</span><h3>Pace</h3><p>We do not pack every minute merely to create a longer itinerary.</p></RevealItem>
          <RevealItem as="article"><span>04</span><h3>Place</h3><p>Choose experiences that tell the real story of a destination.</p></RevealItem>
          <RevealItem as="article"><span>05</span><h3>Peace of mind</h3><p>Travel logistics should feel organized before you leave home.</p></RevealItem>
        </RevealGroup>
      </section>

      <Reveal as="section" className="final-cta" y={20} role="img" aria-label="Nighttime Kaaba scene representing a journey from DFW to the world">
        <div>
          <p className="eyebrow eyebrow--light">Ready when you are</p>
          <h2>Travel that feels<br /><em>like it was made for you.</em></h2>
          <p>See upcoming departures, PTO impact, and pricing in one place.</p>
          <Link className="button button--sand" href="/destinations">See departures <ChevronRight size={16} /></Link>
        </div>
      </Reveal>

      <SiteFooter />
      <MobileBookBar />
    </main>
  );
}
