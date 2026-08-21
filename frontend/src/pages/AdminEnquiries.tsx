import { useEffect, useState } from "react";
import { CheckCircle2, Mail, MessageSquare, Phone } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminApi, type AdminEnquiry } from "@/lib/api";

export default function AdminEnquiries() {
  const [items, setItems] = useState<AdminEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => adminApi.enquiries().then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const markHandled = async (item: AdminEnquiry) => { await adminApi.updateEnquiry(item.id, { handled: !item.handled }); await load(); };
  return <DashboardLayout><main className="admin-shell"><div className="admin-title"><div><p className="eyebrow">Administrator</p><h1>Enquiries</h1><p>Review contact requests from the public website and mark them handled when your team follows up.</p></div><div className="admin-title-icon"><MessageSquare /></div></div>{loading ? <p>Loading enquiries…</p> : items.length === 0 ? <div className="empty-state">No enquiries yet.</div> : <div className="grid gap-4">{items.map(item=><article key={item.id} className="rounded-xl border border-[#e2dacb] bg-[#fffdf7] p-5"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="text-xl">{item.name}</h3><div className="flex flex-wrap gap-4 text-sm opacity-75"><span><Mail size={14} className="inline mr-1"/>{item.email}</span>{item.phone&&<span><Phone size={14} className="inline mr-1"/>{item.phone}</span>}</div></div><button className="button button--primary" onClick={()=>markHandled(item)}><CheckCircle2 size={15}/>{item.handled ? "Mark open" : "Mark handled"}</button></div><p className="mt-4 leading-7">{item.message}</p><small className="opacity-60">{new Date(item.created_at).toLocaleString()}</small></article>)}</div>}</main></DashboardLayout>;
}
