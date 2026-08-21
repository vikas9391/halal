import { useEffect, useState } from "react";
import { Mail, MessageCircle, Phone, Save, Settings2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
// import { trpc } from "@/lib/trpc";

export default function AdminSettings() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.admin.getSettings.useQuery(undefined, { retry: false });
  const [form, setForm] = useState({ phone: "", email: "", whatsapp: "" });
  useEffect(() => { if (settings) setForm({ phone: settings.phone, email: settings.email, whatsapp: settings.whatsapp }); }, [settings]);
  const save = trpc.admin.saveSettings.useMutation({ onSuccess: () => { toast.success("Public contact settings saved"); utils.settings.public.invalidate(); utils.admin.getSettings.invalidate(); }, onError: error => toast.error(error.message) });
  return <DashboardLayout><main className="admin-shell"><div className="admin-title"><div><p className="eyebrow">Administrator</p><h1>Public contact settings</h1><p>Update the contact methods used by the public website without changing a single page component.</p></div><div className="admin-title-icon"><Settings2 /></div></div>{user?.role !== "admin" ? <div className="admin-locked"><ShieldCheck /><h2>Administrator access required</h2><p>Only approved administrators can change public contact details.</p></div> : <section className="settings-panel"><div className="settings-links"><a href="/admin">Departure desk</a><a href="/admin/media">Destination galleries</a></div>{isLoading ? <p>Loading settings…</p> : <form className="settings-form" onSubmit={event => { event.preventDefault(); save.mutate(form); }}><label><Phone size={17} /> Public phone number<input required value={form.phone} onChange={event => setForm(current => ({ ...current, phone: event.target.value }))} placeholder="214-233-6721" /></label><label><Mail size={17} /> Public email address<input required type="email" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} placeholder="info@halal-travel.com" /></label><label><MessageCircle size={17} /> WhatsApp number<input required value={form.whatsapp} onChange={event => setForm(current => ({ ...current, whatsapp: event.target.value.replace(/[^0-9+]/g, "") }))} placeholder="12142336721" /><small>Use country code; this creates the public WhatsApp action.</small></label><button className="admin-save" disabled={save.isPending}><Save size={16} /> {save.isPending ? "Saving…" : "Save public contact settings"}</button></form>}</section>}</main></DashboardLayout>;
}
