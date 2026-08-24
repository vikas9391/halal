import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";

const JOTFORM_URL = "https://form.jotform.com/262335830425050";
const JOTFORM_ID = "JotFormIFrame-262335830425050";

declare global {
  interface Window {
    jotformEmbedHandler?: (selector: string, baseUrl: string) => void;
  }
}

export default function UmrahRegistration() {
  useEffect(() => {
    const scriptId = "jotform-embed-handler";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initialise = () => {
      window.jotformEmbedHandler?.(`iframe[id='${JOTFORM_ID}']`, "https://form.jotform.com/");
    };

    if (existing) {
      initialise();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js";
    script.async = true;
    script.onload = initialise;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section-pad registration-section" style={{ maxWidth: 1180, margin: "0 auto", paddingTop: 72, paddingBottom: 72 }}>
        <div className="registration-intro" style={{ maxWidth: 760, marginBottom: 28 }}>
          <p className="eyebrow">November 2026 · Thanksgiving Break Umrah</p>
          <h1>Register for your Umrah journey.</h1>
          <p className="lead">Complete the registration below. The form is organized into three clear stages: starting details, passenger information, and payment/final information.</p>
          <p style={{ marginTop: 12 }}>
            <Link href="/destinations">← Back to journeys</Link>
            <span style={{ margin: "0 10px" }}>·</span>
            <a href={JOTFORM_URL} target="_blank" rel="noreferrer">Open form in a new tab <ExternalLink size={14} style={{ verticalAlign: "-2px" }} /></a>
          </p>
        </div>

        <div className="registration-form-shell" style={{ width: "100%", borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 20px 60px rgba(4,17,18,.10)", border: "1px solid rgba(4,17,18,.10)" }}>
          <iframe
            id={JOTFORM_ID}
            title="Thanksgiving Break Umrah Registration - November 2026"
            src={JOTFORM_URL}
            allow="geolocation; microphone; camera; fullscreen"
            allowFullScreen
            style={{ display: "block", width: "100%", minWidth: "100%", height: 1800, border: 0 }}
            loading="eager"
            scrolling="no"
          />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
