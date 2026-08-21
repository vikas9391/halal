import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminApi, toursApi, type Tour } from "@/lib/api";

export default function AdminGallery() {
  const [trips, setTrips] = useState<Tour[]>([]);
  const [tourSlug, setTourSlug] = useState("");
  const [selected, setSelected] = useState<Tour | null>(null);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [message, setMessage] = useState("");
  const load = async () => { const data = await toursApi.list(); setTrips(data); const current = tourSlug ? data.find(t=>t.slug===tourSlug) : data[0]; if (current) { setTourSlug(current.slug); setSelected(current); } };
  useEffect(() => { load().catch(()=>setMessage("Unable to load gallery.")); }, []);
  useEffect(() => { if (!tourSlug) { setSelected(null); return; } toursApi.get(tourSlug).then(setSelected); }, [tourSlug]);
  const images = useMemo(() => selected?.images ?? [], [selected]);
  const add = async (event: React.FormEvent) => { event.preventDefault(); if (!selected || !url.trim()) return; await adminApi.addTourImage({ tour: selected.id, url: url.trim(), alt: alt.trim() || selected.title }); setUrl(""); setAlt(""); await load(); setMessage("Image added."); };
  const remove = async (id:number) => { if(!confirm("Remove this image?")) return; await adminApi.deleteTourImage(id); await load(); };
  return <DashboardLayout><main className="admin-shell"><div className="admin-title"><div><p className="eyebrow">Administrator</p><h1>Destination galleries</h1><p>Add and remove tour gallery images from the admin workspace.</p></div><div className="admin-title-icon"><ImagePlus /></div></div><section className="rounded-xl border border-[#e2dacb] bg-[#fffdf7] p-6"><label>Choose tour<select value={tourSlug} onChange={e=>setTourSlug(e.target.value)}><option value="">Select a tour</option>{trips.map(t=><option key={t.id} value={t.slug}>{t.title}</option>)}</select></label>{selected&&<form onSubmit={add} className="grid gap-3 md:grid-cols-[2fr_1fr_auto] mt-5"><input required placeholder="Image URL" value={url} onChange={e=>setUrl(e.target.value)}/><input placeholder="Alt text" value={alt} onChange={e=>setAlt(e.target.value)}/><button className="button button--primary" type="submit"><ImagePlus size={15}/> Add image</button></form>}{message&&<p className="text-sm mt-3">{message}</p>}</section><section className="gallery-manager mt-6"><div><p className="eyebrow">Gallery</p><h2>{selected?.destination?.name ?? "Destination imagery"}</h2></div>{tourSlug&&images.length===0?<div className="gallery-empty">No gallery images for this tour yet.</div>:<div className="gallery-admin-grid">{images.map(image=><article key={image.id}><img src={image.url} alt={image.alt}/><div className="flex items-center justify-between gap-2"><strong>{image.alt}</strong><button onClick={()=>remove(image.id)} aria-label="Delete image"><Trash2 size={15}/></button></div></article>)}</div>}</section></main></DashboardLayout>;
}
