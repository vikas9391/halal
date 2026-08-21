import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminApi, type AdminPayment } from "@/lib/api";

export default function AdminPayments() {
  const [items, setItems] = useState<AdminPayment[]>([]);
  useEffect(() => { adminApi.payments().then(setItems); }, []);
  return <DashboardLayout><main className="admin-shell"><div className="admin-title"><div><p className="eyebrow">Administrator</p><h1>Payments</h1><p>Payment attempts and captured transactions linked to customer bookings.</p></div><div className="admin-title-icon"><CreditCard /></div></div><section className="rounded-xl border border-[#e2dacb] bg-[#fffdf7] p-5 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="p-3">Booking</th><th className="p-3">Customer</th><th className="p-3">Tour</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Created</th></tr></thead><tbody>{items.map(item=><tr key={item.id} className="border-b"><td className="p-3">#{item.booking_id}</td><td className="p-3">{item.customer_name}<div className="text-xs opacity-60">{item.customer_email}</div></td><td className="p-3">{item.tour_slug}</td><td className="p-3">{item.currency} {(item.amount / 100).toLocaleString()}</td><td className="p-3 uppercase">{item.status}</td><td className="p-3">{new Date(item.created_at).toLocaleString()}</td></tr>)}</tbody></table>{items.length===0&&<div className="empty-state">No payments yet.</div>}</section></main></DashboardLayout>;
}
