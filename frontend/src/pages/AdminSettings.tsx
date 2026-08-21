import { Mail, MessageCircle, Phone, Settings2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

/**
 * NOTE: The previous version of this page read/wrote public contact settings
 * via a tRPC `admin.getSettings` / `admin.saveSettings` router and a
 * `settings.public` query used by the public site. None of that exists on
 * the Django backend — the public contact info is currently hardcoded in
 * SiteChrome.tsx and Contact.tsx. This page is a placeholder until a
 * settings endpoint exists; editing here wouldn't do anything real yet.
 */
const CONTACT = {
  phone: "214-233-6721",
  email: "info@halal-travel.com",
  whatsapp: "12142336721",
};

export default function AdminSettings() {
  return (
    <DashboardLayout>
      <main className="admin-shell">
        <div className="admin-title">
          <div>
            <p className="eyebrow">Administrator</p>
            <h1>Public contact settings</h1>
            <p>
              These values are currently hardcoded in the frontend (SiteChrome.tsx and
              Contact.tsx) — there's no settings API yet to edit them from here.
            </p>
          </div>
          <div className="admin-title-icon"><Settings2 /></div>
        </div>

        <section className="settings-panel">
          <div className="settings-form" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p><Phone size={16} /> {CONTACT.phone}</p>
            <p><Mail size={16} /> {CONTACT.email}</p>
            <p><MessageCircle size={16} /> {CONTACT.whatsapp}</p>
            <small>To change these, edit the CONTACT constant in SiteChrome.tsx and Contact.tsx, or build a settings endpoint on the backend.</small>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
