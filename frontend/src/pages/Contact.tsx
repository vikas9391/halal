import { CircleHelp, Mail, MessageCircle, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { SiteHeader, SiteFooter, MobileBookBar, useContactSettings } from "@/components/site/SiteChrome";
import Reveal from "@/components/Reveal";
import { contactLinks, LeadCapture } from "@/lib/tripUi";

export default function Contact() {
  const contact = useContactSettings();
  const contactAction = contactLinks(contact.phone, contact.whatsapp);
  return <main className="site-shell"><SiteHeader /><section className="hero" style={{ minHeight: "38vh", backgroundImage: "linear-gradient(90deg, rgba(4,17,18,.93) 0%, rgba(4,17,18,.72) 55%, rgba(4,17,18,.3) 100%), url(bosnia-mostar_053d512e.jpg)" }} role="img" aria-label="Mostar bridge in Bosnia and Herzegovina at sunset"><motion.div className="hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}><p className="eyebrow eyebrow--light">Get first access</p><h1>The next journey could fit your calendar.</h1><p className="hero-copy">New departures. Early-bird pricing. Holiday-smart travel ideas. Choose what you want to hear about.</p></motion.div></section><section className="first-access section-pad" id="contact"><Reveal as="div"><p className="eyebrow">Talk to our travel team</p><h2>We're happy to help you plan.</h2><p>Not sure which trip fits your family, your calendar, or your budget? Reach out below or join our first-access list.</p><div className="contact-options"><span><CircleHelp size={15} /> Not sure which trip fits? Tell us below.</span><a href={`tel:${contactAction.telephone}`}><Phone size={15} /> {contact.phone}</a><a href={`mailto:${contact.email}`}><Mail size={15} /> {contact.email}</a><a href={`https://wa.me/${contactAction.whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /> Chat on WhatsApp</a></div></Reveal><Reveal as="div" delay={0.15}><LeadCapture /></Reveal></section><SiteFooter /><MobileBookBar /></main>;
}
