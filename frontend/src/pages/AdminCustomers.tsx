import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminApi, type AdminCustomer } from "@/lib/api";

export default function AdminCustomers() {
  const [items, setItems] = useState<AdminCustomer[]>([]);
  useEffect(() => { adminApi.customers().then(setItems); }, []);
  return <DashboardLayout><main className="admin-shell"><div className="admin-title"><div><p className="eyebrow">Administrator</p><h1>Customers</h1><p>Customer accounts, contact details and booking activity.</p></div><div className="admin-title-icon"><Users /></div></div><section className="rounded-xl border border-[#e2dacb] bg-[#fffdf7] p-5 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="p-3">Customer</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Bookings</th><th className="p-3">Joined</th></tr></thead><tbody>{items.map(item=><tr key={item.id} className="border-b"><td className="p-3 font-medium">{item.full_name || "—"}</td><td className="p-3">{item.email}</td><td className="p-3">{item.phone || "—"}</td><td className="p-3">{item.booking_count}</td><td className="p-3">{new Date(item.date_joined).toLocaleDateString()}</td></tr>)}</tbody></table>{items.length===0&&<div className="empty-state">No customers yet.</div>}</section></main></DashboardLayout>;
}
