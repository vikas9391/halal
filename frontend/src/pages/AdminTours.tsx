import { useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminApi, type AdminTourPayload, type Destination, type Tour } from "@/lib/api";

const emptyTour: AdminTourPayload = {
  destination: 0, slug: "", title: "", duration_days: 1, duration_nights: 0, price: 0,
  currency: "USD", rating: 0, review_count: 0, cover_image: "", halal_features: [], summary: "",
  departure_city: "", images: [], itinerary: [],
};

export default function AdminTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [form, setForm] = useState<AdminTourPayload>(emptyTour);
  const [editing, setEditing] = useState<string | null>(null);
  const [destinationForm, setDestinationForm] = useState({ slug: "", name: "", country: "", hero_image: "", short_description: "", latitude: 0, longitude: 0 });
  const [message, setMessage] = useState("");

  const load = async () => {
    const [tourData, destinationData] = await Promise.all([adminApi.tours(), adminApi.destinations()]);
    setTours(tourData); setDestinations(destinationData);
    if (!form.destination && destinationData[0]) setForm((current) => ({ ...current, destination: destinationData[0].id }));
  };
  useEffect(() => { load().catch(() => setMessage("Unable to load catalog.")); }, []);

  const reset = () => { setEditing(null); setForm({ ...emptyTour, destination: destinations[0]?.id ?? 0 }); };
  const edit = (tour: Tour) => setForm({
    destination: tour.destination.id, slug: tour.slug, title: tour.title, duration_days: tour.duration_days,
    duration_nights: tour.duration_nights, price: tour.price, currency: tour.currency, rating: tour.rating,
    review_count: tour.review_count, cover_image: tour.cover_image, halal_features: tour.halal_features,
    summary: tour.summary, departure_city: tour.departure_city,
    images: tour.images.map(({ url, alt }) => ({ url, alt })),
    itinerary: tour.itinerary.map(({ day, title, description }) => ({ day, title, description })),
  });
  const update = (key: keyof AdminTourPayload, value: unknown) => setForm((current) => ({ ...current, [key]: value }));

  const saveTour = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage("");
    try {
      if (editing) await adminApi.updateTour(editing, form);
      else await adminApi.createTour(form);
      await load(); reset(); setMessage("Tour saved.");
    } catch (error: any) { setMessage(error?.response?.data ? JSON.stringify(error.response.data) : "Unable to save tour."); }
  };
  const removeTour = async (slug: string) => { if (!confirm("Delete this tour?")) return; await adminApi.deleteTour(slug); await load(); if (editing === slug) reset(); };
  const saveDestination = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await adminApi.createDestination(destinationForm); setDestinationForm({ slug: "", name: "", country: "", hero_image: "", short_description: "", latitude: 0, longitude: 0 }); await load(); setMessage("Destination saved."); }
    catch (error: any) { setMessage(error?.response?.data ? JSON.stringify(error.response.data) : "Unable to save destination."); }
  };

  return <DashboardLayout>
    <main className="admin-shell space-y-8">
      <div className="admin-title">
        <div><p className="eyebrow">Administrator</p><h1>Tours & destinations</h1><p>Create and maintain the public catalog: destinations, pricing, duration, imagery, halal features and itineraries.</p></div>
        <div className="admin-title-icon"><MapPin /></div>
      </div>
      {message && <div className="rounded-lg border border-[#d8c9ae] bg-[#fffdf7] p-4 text-sm">{message}</div>}

      <section className="rounded-xl border border-[#e2dacb] bg-[#fffdf7] p-6">
        <div className="flex items-center justify-between gap-4 mb-5"><div><p className="eyebrow">Catalog</p><h2>{editing ? "Edit tour" : "Add tour"}</h2></div>{editing && <button className="button button--ghost !text-[#102526] !border-[#bcae94]" onClick={reset}><X size={15}/> Cancel</button>}</div>
        <form onSubmit={saveTour} className="grid gap-4 md:grid-cols-2">
          <label>Title<input required value={form.title} onChange={e=>update("title",e.target.value)} /></label>
          <label>Slug<input required value={form.slug} onChange={e=>update("slug",e.target.value)} /></label>
          <label>Destination<select required value={form.destination} onChange={e=>update("destination",Number(e.target.value))}><option value={0}>Select destination</option>{destinations.map(d=><option key={d.id} value={d.id}>{d.name}, {d.country}</option>)}</select></label>
          <label>Departure city<input required value={form.departure_city} onChange={e=>update("departure_city",e.target.value)} /></label>
          <label>Duration days<input type="number" min="1" required value={form.duration_days} onChange={e=>update("duration_days",Number(e.target.value))}/></label>
          <label>Duration nights<input type="number" min="0" required value={form.duration_nights} onChange={e=>update("duration_nights",Number(e.target.value))}/></label>
          <label>Price<input type="number" min="0" step="0.01" required value={form.price} onChange={e=>update("price",Number(e.target.value))}/></label>
          <label>Currency<input maxLength={3} required value={form.currency} onChange={e=>update("currency",e.target.value.toUpperCase())}/></label>
          <label>Rating<input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e=>update("rating",Number(e.target.value))}/></label>
          <label>Review count<input type="number" min="0" value={form.review_count} onChange={e=>update("review_count",Number(e.target.value))}/></label>
          <label className="md:col-span-2">Cover image URL<input required value={form.cover_image} onChange={e=>update("cover_image",e.target.value)}/></label>
          <label className="md:col-span-2">Summary<textarea required rows={4} value={form.summary} onChange={e=>update("summary",e.target.value)}/></label>
          <label className="md:col-span-2">Halal features<input value={form.halal_features.join(", ")} onChange={e=>update("halal_features",e.target.value.split(",").map(x=>x.trim()).filter(Boolean))}/><small>Use: prayer_friendly, certified_halal_food, gender_separated_options, no_alcohol_venues, scholar_led</small></label>
          <label className="md:col-span-2">Gallery image URLs<textarea rows={3} value={form.images.map(i=>i.url).join("\n")} onChange={e=>update("images",e.target.value.split("\n").map(url=>url.trim()).filter(Boolean).map(url=>({url,alt:form.title})))}/></label>
          <div className="md:col-span-2"><div className="flex items-center justify-between mb-2"><strong>Itinerary</strong><button type="button" className="text-sm underline" onClick={()=>update("itinerary",[...form.itinerary,{day:form.itinerary.length+1,title:"",description:""}])}><Plus size={14} className="inline"/> Add day</button></div>{form.itinerary.map((item,index)=><div key={index} className="grid gap-2 md:grid-cols-[80px_1fr_2fr_auto] mb-2"><input type="number" min="1" value={item.day} onChange={e=>{const next=[...form.itinerary];next[index]={...item,day:Number(e.target.value)};update("itinerary",next)}}/><input placeholder="Day title" value={item.title} onChange={e=>{const next=[...form.itinerary];next[index]={...item,title:e.target.value};update("itinerary",next)}}/><input placeholder="Description" value={item.description} onChange={e=>{const next=[...form.itinerary];next[index]={...item,description:e.target.value};update("itinerary",next)}}/><button type="button" onClick={()=>update("itinerary",form.itinerary.filter((_,i)=>i!==index))}><Trash2 size={16}/></button></div>)}</div>
          <div className="md:col-span-2 flex gap-3"><button className="button button--primary" type="submit"><Save size={15}/> {editing ? "Update tour" : "Create tour"}</button><button className="button !bg-[#eee8dc] !text-[#102526]" type="button" onClick={reset}>Clear</button></div>
        </form>
      </section>

      <section className="rounded-xl border border-[#e2dacb] bg-[#fffdf7] p-6">
        <div className="flex items-center justify-between mb-5"><div><p className="eyebrow">Live catalog</p><h2>Existing tours</h2></div><span className="text-sm">{tours.length} tours</span></div>
        {tours.length===0 ? <div className="empty-state">No tours yet. Create your first tour above.</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="p-3">Tour</th><th className="p-3">Destination</th><th className="p-3">Price</th><th className="p-3">Duration</th><th className="p-3">Actions</th></tr></thead><tbody>{tours.map(t=><tr key={t.id} className="border-b"><td className="p-3 font-medium">{t.title}<div className="text-xs opacity-60">/{t.slug}</div></td><td className="p-3">{t.destination.name}</td><td className="p-3">{t.currency} {t.price.toLocaleString()}</td><td className="p-3">{t.duration_days}d / {t.duration_nights}n</td><td className="p-3 flex gap-2"><button className="button !min-h-8 !px-3 !bg-[#eee8dc] !text-[#102526]" onClick={()=>edit(t)}><Pencil size={13}/> Edit</button><button className="button !min-h-8 !px-3 !bg-[#7b342b] !text-white" onClick={()=>removeTour(t.slug)}><Trash2 size={13}/> Delete</button></td></tr>)}</tbody></table></div>}
      </section>

      <section className="rounded-xl border border-[#e2dacb] bg-[#fffdf7] p-6">
        <p className="eyebrow">Locations</p><h2>Add destination</h2>
        <form onSubmit={saveDestination} className="grid gap-4 md:grid-cols-2 mt-4">
          <label>Name<input required value={destinationForm.name} onChange={e=>setDestinationForm({...destinationForm,name:e.target.value})}/></label>
          <label>Slug<input required value={destinationForm.slug} onChange={e=>setDestinationForm({...destinationForm,slug:e.target.value})}/></label>
          <label>Country<input required value={destinationForm.country} onChange={e=>setDestinationForm({...destinationForm,country:e.target.value})}/></label>
          <label>Hero image URL<input required value={destinationForm.hero_image} onChange={e=>setDestinationForm({...destinationForm,hero_image:e.target.value})}/></label>
          <label className="md:col-span-2">Short description<textarea required rows={3} value={destinationForm.short_description} onChange={e=>setDestinationForm({...destinationForm,short_description:e.target.value})}/></label>
          <label>Latitude<input type="number" step="any" value={destinationForm.latitude} onChange={e=>setDestinationForm({...destinationForm,latitude:Number(e.target.value)})}/></label>
          <label>Longitude<input type="number" step="any" value={destinationForm.longitude} onChange={e=>setDestinationForm({...destinationForm,longitude:Number(e.target.value)})}/></label>
          <button className="button button--primary md:col-span-2" type="submit"><Plus size={15}/> Add destination</button>
        </form>
      </section>
    </main>
  </DashboardLayout>;
}
