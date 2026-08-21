import { useState } from "react";
import { ChevronRight, Landmark, Mail, Menu, Phone, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { contactLinks } from "@/lib/tripUi";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Umrah & Destinations" },
  { href: "/about", label: "How We Travel" },
  { href: "/contact", label: "Contact" },
];

const CONTACT = {
  phone: "214-233-6721",
  email: "info@halal-travel.com",
  whatsapp: "12142336721",
};

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="site-header">
      <Link
        href="/"
        className="brand"
        aria-label="Halal Tours home"
        onClick={() => setMenuOpen(false)}
      >
        <span className="brand-mark">
          <Landmark size={18} />
        </span>

        <span>
          <b>HALAL TOURS</b>
          <small>TRAVEL GROUNDED</small>
        </span>
      </Link>

      <nav
        className={menuOpen ? "main-nav main-nav--open" : "main-nav"}
        aria-label="Primary navigation"
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            style={
              location === link.href
                ? { opacity: 1, fontWeight: 700 }
                : undefined
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Link className="header-cta" href="/destinations">
        Find your journey <ChevronRight size={15} />
      </Link>

      <motion.button
        whileTap={{ scale: 0.9 }}
        className="menu-button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle navigation"
      >
        <AnimatePresence mode="wait" initial={false}>
          {menuOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: "flex" }}
            >
              <X />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: "flex" }}
            >
              <Menu />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </header>
  );
}

export function SiteFooter() {
  const contactAction = contactLinks(
    CONTACT.phone,
    CONTACT.whatsapp
  );

  return (
    <footer>
      <Link className="brand" href="/">
        <span className="brand-mark">
          <Landmark size={18} />
        </span>

        <span>
          <b>HALAL TOURS</b>
          <small>TRAVEL GROUNDED</small>
        </span>
      </Link>

      <p>
        Thoughtfully curated journeys from DFW to the world.
        <br />

        <a href={`tel:${contactAction.telephone}`}>
          <Phone
            size={13}
            style={{
              verticalAlign: "-2px",
              marginRight: "4px",
            }}
          />
          {CONTACT.phone}
        </a>

        {" · "}

        <a href={`mailto:${CONTACT.email}`}>
          <Mail
            size={13}
            style={{
              verticalAlign: "-2px",
              marginRight: "4px",
            }}
          />
          {CONTACT.email}
        </a>
      </p>

      <Link href="/admin">Admin</Link>
    </footer>
  );
}

export function MobileBookBar({
  href = "/destinations",
}: {
  href?: string;
}) {
  return (
    <Link className="mobile-book" href={href}>
      Reserve your spot <ChevronRight size={16} />
    </Link>
  );
}