import { useEffect, useMemo, useState } from "react";
import { ImagePlus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toursApi, type Tour } from "@/lib/api";

/**
 * NOTE: The previous version of this page uploaded/reordered/deleted gallery
 * images via a tRPC `admin.*Gallery*` router. The Django backend has no
 * image-upload or gallery-management endpoints — `Tour.images` is read-only,
 * populated from wherever tours are created (e.g. Django admin / fixtures).
 * This is a read-only viewer until an upload endpoint exists.
 */
export default function AdminGallery() {
  const [trips, setTrips] = useState<Tour[]>([]);
  const [tourSlug, setTourSlug] = useState<string>("");
  const [selected, setSelected] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    toursApi.list().then(setTrips).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!tourSlug) {
      setSelected(null);
      return;
    }
    toursApi.get(tourSlug).then(setSelected);
  }, [tourSlug]);

  const images = useMemo(() => selected?.images ?? [], [selected]);

  return (
    <DashboardLayout>
      <main className="admin-shell admin-media-shell">
        <div className="admin-title">
          <div>
            <p className="eyebrow">Administrator</p>
            <h1>Destination galleries</h1>
            <p>
              Viewing the images already attached to each tour. Uploading, reordering, and
              removing images isn't available yet — the backend doesn't expose a
              gallery-management endpoint.
            </p>
          </div>
          <div className="admin-title-icon"><ImagePlus /></div>
        </div>

        <section className="media-workbench">
          <label>
            Choose tour
            <select value={tourSlug} onChange={(event) => setTourSlug(event.target.value)}>
              <option value="">Select a tour</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.slug}>{trip.title}</option>
              ))}
            </select>
          </label>
          {selected ? (
            <p>Viewing the gallery for <strong>{selected.title}</strong>.</p>
          ) : (
            <p>{isLoading ? "Loading tours…" : "Select a tour to view its gallery."}</p>
          )}
        </section>

        <section className="gallery-manager">
          <div>
            <p className="eyebrow">Gallery</p>
            <h2>{selected?.destination?.name ?? "Destination imagery"}</h2>
          </div>
          {tourSlug && images.length === 0 ? (
            <div className="gallery-empty">No gallery images for this tour yet.</div>
          ) : (
            <div className="gallery-admin-grid">
              {images.map((image) => (
                <article key={image.id}>
                  <img src={image.url} alt={image.alt} />
                  <div><strong>{image.alt}</strong></div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}
