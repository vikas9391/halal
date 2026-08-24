import { ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";

const JOTFORM_URL = "https://form.jotform.com/262335830425050";

export default function UmrahRegistration() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section-pad" style={{ maxWidth: 1180, margin: "0 auto", paddingTop: 72, paddingBottom: 72 }}>
        <div style={{ maxWidth: 760, marginBottom: 28 }}>
          <p className="eyebrow">November 2026 · Thanksgiving Break Umrah</p>
          <h1>Register for your Umrah journey.</h1>
          <p className="lead">Complete the registration below. The form is organized into three clear stages: starting details, passenger information, and payment/final information.</p>
          <p style={{ marginTop: 12 }}>
            <Link href="/destinations">← Back to journeys</Link>
            <span style={{ margin: "0 10px" }}>·</span>
            <a href={JOTFORM_URL} target="_blank" rel="noreferrer">Open form in a new tab <ExternalLink size={14} style={{ verticalAlign: "-2px" }} /></a>
          </p>
        </div>

        <div style={{ width: "100%", borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 20px 60px rgba(4,17,18,.10)", border: "1px solid rgba(4,17,18,.10)" }}>
          <iframe
            title="Thanksgiving Break Umrah Registration - November 2026"
            src={JOTFORM_URL}
            style={{ display: "block", width: "100%", minHeight: 1100, border: 0 }}
            loading="lazy"
          />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
