import { useMemo, useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read that image."));
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.readAsDataURL(file);
  });
}

export default function AdminGallery() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: trips = [] } = trpc.admin.listTrips.useQuery(undefined, { retry: false });
  const [tripId, setTripId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const gallery = trpc.admin.listGallery.useQuery(tripId ? { tripId } : skipToken, { enabled: Boolean(tripId), retry: false });
  const upload = trpc.admin.uploadGalleryImage.useMutation({ onSuccess: () => { toast.success("Gallery image uploaded"); setFile(null); setAltText(""); setCaption(""); utils.admin.listGallery.invalidate(); }, onError: error => toast.error(error.message) });
  const remove = trpc.admin.deleteGalleryImage.useMutation({ onSuccess: () => utils.admin.listGallery.invalidate(), onError: error => toast.error(error.message) });
  const order = trpc.admin.orderGalleryImages.useMutation({ onSuccess: () => utils.admin.listGallery.invalidate(), onError: error => toast.error(error.message) });
  const selectedTrip = useMemo(() => trips.find(trip => trip.id === tripId), [trips, tripId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tripId || !file) return toast.error("Choose a departure and an image first.");
    if (file.size > 10_000_000) return toast.error("Images must be 10 MB or smaller.");
    try { upload.mutate({ tripId, fileName: file.name, contentType: file.type as "image/jpeg" | "image/png" | "image/webp", base64: await toBase64(file), altText, caption: caption || undefined }); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to prepare image."); }
  };

  const move = (from: number, direction: -1 | 1) => {
    const images = [...(gallery.data ?? [])]; const to = from + direction;
    if (to < 0 || to >= images.length) return;
    [images[from], images[to]] = [images[to], images[from]];
    order.mutate({ items: images.map((image, sortOrder) => ({ id: image.id, sortOrder })) });
  };

  return <DashboardLayout><main className="admin-shell admin-media-shell"><div className="admin-title"><div><p className="eyebrow">Administrator</p><h1>Destination galleries</h1><p>Upload destination-specific photographs, write useful alternative text, and control the gallery order for every trip.</p></div><div className="admin-title-icon"><ImagePlus /></div></div>{user?.role !== "admin" ? <div className="admin-locked"><ShieldCheck /><h2>Administrator access required</h2><p>This media desk is reserved for the project owner and approved administrators.</p></div> : <><section className="admin-media-toolbar"><a href="/admin">Departure desk</a><a href="/admin/settings">Public contact settings</a></section><section className="media-workbench"><label>Choose departure<select value={tripId ?? ""} onChange={event => setTripId(Number(event.target.value) || null)}><option value="">Select a trip</option>{trips.map(trip => <option key={trip.id} value={trip.id}>{trip.title}</option>)}</select></label>{selectedTrip ? <p>Managing the gallery for <strong>{selectedTrip.title}</strong>.</p> : <p>Select a database-managed departure to begin.</p>}<form className="media-upload-form" onSubmit={submit}><label>Destination photograph<input required type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setFile(event.target.files?.[0] ?? null)} /></label><label>Accessible image description<input required minLength={6} value={altText} onChange={event => setAltText(event.target.value)} placeholder="e.g. Stone bridge over the Neretva River in Mostar" /></label><label className="form-full">Caption <input value={caption} onChange={event => setCaption(event.target.value)} placeholder="Optional editorial caption" /></label><button className="admin-save form-full" disabled={upload.isPending}><ImagePlus size={16} /> {upload.isPending ? "Uploading…" : "Upload to gallery"}</button></form></section><section className="gallery-manager"><div><p className="eyebrow">Gallery order</p><h2>{selectedTrip ? selectedTrip.destination : "Your destination imagery"}</h2></div>{gallery.isLoading ? <p>Loading images…</p> : <div className="gallery-admin-grid">{(gallery.data ?? []).map((image, index) => <article key={image.id}><img src={image.imageUrl} alt={image.altText} /><div><strong>{image.altText}</strong>{image.caption ? <small>{image.caption}</small> : null}<div className="gallery-admin-actions"><button type="button" onClick={() => move(index, -1)} disabled={index === 0 || order.isPending} aria-label="Move image earlier"><ArrowUp size={15} /></button><button type="button" onClick={() => move(index, 1)} disabled={index === (gallery.data?.length ?? 1) - 1 || order.isPending} aria-label="Move image later"><ArrowDown size={15} /></button><button type="button" className="danger-button" onClick={() => remove.mutate({ id: image.id })} disabled={remove.isPending}><Trash2 size={15} /> Remove</button></div></div></article>)}</div>}{tripId && !gallery.isLoading && !(gallery.data?.length) ? <div className="gallery-empty"><Loader2 size={18} /> No gallery images yet. Upload the first approved destination image above.</div> : null}</section></>}</main></DashboardLayout>;
}
