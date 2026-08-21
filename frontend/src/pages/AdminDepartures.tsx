import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminApi } from "@/lib/api";

type Booking = { id: number; tour_slug: string; status: string; travelers: number; departure_date: string; total_price: number; customer?: { fullName: string; email: string } };

export default function AdminDepartures() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => { adminApi.bookings().then(setBookings); }, []);
  const grouped = useMemo(() => [...bookings].sort((a,b)=>a.departure_date.localeCompare(b.departure_date)), [bookings]);
  return <DashboardLayout><main className="admin-shell"><div className="admin-title"><div><p className="eyebrow">Administrator</p><h1>Departure desk</h1><p>Upcoming departures grouped from customer reservations so the team can see traveler volume and status.</p></div><div className="admin-title-icon"><CalendarDays /></div></div>{grouped.length===0?<div className="empty-state">No booked departures yet.</div>:<div className="grid gap-4">{grouped.map(b=><article key={b.id} className="rounded-xl border border-[#e2dacb] bg-[#fffdf7] p-5 flex flex-wrap justify-between gap-4"><div><p className="eyebrow">{new Date(b.departure_date).toLocaleDateString(undefined,{dateStyle:"long"})}</p><h3 className="text-2xl">{b.tour_slug}</h3><p className="text-sm opacity-70">Booking #{b.id} · {b.travelers} traveler{b.travelers===1?"":"s"}</p></div><div className="text-right"><span className="uppercase text-xs">{b.status}</span><p className="font-semibold mt-2">{new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(b.total_price)}</p></div></article>)}</div>}</main></DashboardLayout>;
}
