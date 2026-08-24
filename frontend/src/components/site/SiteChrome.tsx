import { useEffect, useState } from "react";
import { ChevronRight, Landmark, Mail, Menu, Phone, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { contactLinks } from "@/lib/tripUi";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

const FALLBACK_CONTACT = { phone: "214-233-6721", email: "info@halal-travel.com", whatsapp: "12142336721" };

export function useContactSettings() {
  const [contact, setContact] = useState(FALLBACK_CONTACT);
  useEffect(() => { api.get<typeof FALLBACK_CONTACT>("/settings/").then(response => setContact(response.data)).catch(() => undefined); }, []);
  return contact;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Umrah & Destinations" },
  { href: "/register/thanksgiving-umrah-2026", label: "November Umrah Registration" },
  { href: "/about", label: "How We Travel" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  return <header className="site-header"><Link href="/" className="brand" aria-label="Halal Tours home" onClick={() => setMenuOpen(false)}><span className="brand-mark"><Landmark size={18} /></span><span><b>HALAL TOURS</b><small>TRAVEL GROUNDED</small></span></Link><nav className={menuOpen ? "main-nav main-nav--open" : "main-nav"} aria-label="Primary navigation">{NAV_LINKS.map(link => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={location === link.href ? { opacity: 1, fontWeight: 700 } : undefined}>{link.label}</Link>)}<Link href="/traveler" onClick={() => setMenuOpen(false)}>My bookings</Link></nav><div className="flex items-center gap-2"><Link className="header-cta" href={user ? "/profile" : "/login"}>{user ? "My account" : "Sign in / Register"} <ChevronRight size={15} /></Link><motion.button whileTap={{ scale: 0.9 }} className="menu-button" onClick={() => setMenuOpen(open => !open)} aria-label="Toggle navigation"><AnimatePresence mode="wait" initial={false}>{menuOpen ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: .15 }} style={{ display: "flex" }}><X /></motion.span> : <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: .15 }} style={{ display: "flex" }}><Menu /></motion.span>}</AnimatePresence></motion.button></div></header>;
}

export function SiteFooter() {
  const contact = useContactSettings();
  const contactAction = contactLinks(contact.phone, contact.whatsapp);
  return <footer><Link className="brand" href="/"><span className="brand-mark"><Landmark size={18} /></span><span><b>HALAL TOURS</b><small>TRAVEL GROUNDED</small></span></Link><p>Thoughtfully curated journeys from DFW to the world.<br /><a href={`tel:${contactAction.telephone}`}><Phone size={13} style={{ verticalAlign: "-2px", marginRight: "4px" }} />{contact.phone}</a>{" · "}<a href={`mailto:${contact.email}`}><Mail size={13} style={{ verticalAlign: "-2px", marginRight: "4px" }} />{contact.email}</a></p><div className="flex gap-3"><Link href="/login">Customer login</Link><Link href="/admin">Admin</Link></div></footer>;
}

export function MobileBookBar({ href = "/destinations" }: { href?: string }) { return <Link className="mobile-book" href={href}>Reserve your spot <ChevronRight size={16} /></Link>; }
