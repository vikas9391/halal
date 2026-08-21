import { useEffect, useState } from "react";
import { Mail, MessageCircle, Phone, Save, Settings2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminApi } from "@/lib/api";

export default function AdminSettings() {
  const [form, setForm] = useState({ phone: "", email: "", whatsapp: "" });
  const [message, setMessage] = useState("");
  useEffect(() => { adminApi.settings().then(setForm).catch(() => setMessage("Unable to load settings.")); }, []);
  const save = async (event: React.FormEvent) => { event.preventDefault(); await adminApi.updateSettings(form); setMessage("Settings saved."); };
  return <DashboardLayout><main className="admin-shell"><div className="admin-title"><div><p className="eyebrow">Administrator</p><h1>Public contact settings</h1><p>Update the phone, email and WhatsApp details used by the public contact experience.</p></div><div className="admin-title-icon"><Settings2 /></div></div>{message&&<p className="text-sm mb-4">{message}</p>}<section className="settings-panel"><form onSubmit={save} className="settings-form grid gap-4 max-w-xl"><label><Phone size={16} className="inline mr-2"/>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label><Mail size={16} className="inline mr-2"/>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label><MessageCircle size={16} className="inline mr-2"/>WhatsApp<input value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})}/></label><button className="button button--primary w-fit" type="submit"><Save size={15}/> Save settings</button></form></section></main></DashboardLayout>;
}
