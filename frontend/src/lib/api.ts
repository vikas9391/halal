import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";
export const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Destination { id: number; slug: string; name: string; country: string; hero_image: string; short_description: string; latitude: number; longitude: number; }
export interface TourImage { id: number; url: string; alt: string; }
export interface ItineraryDay { id: number; day: number; title: string; description: string; }
export interface Tour { id: number; slug: string; title: string; destination: { id: number; slug: string; name: string; country: string }; duration_days: number; duration_nights: number; price: number; currency: string; rating: number; review_count: number; cover_image: string; images: TourImage[]; halal_features: string[]; summary: string; itinerary: ItineraryDay[]; departure_city: string; }
export interface User { id: number; full_name: string; email: string; phone: string; }

export const toursApi = { list: async (params?: Record<string, string | number>) => (await api.get<Tour[]>("/tours/", { params })).data, get: async (slug: string) => (await api.get<Tour>(`/tours/${slug}/`)).data };
export const destinationsApi = { list: async () => (await api.get<Destination[]>("/destinations/")).data, get: async (slug: string) => (await api.get<Destination>(`/destinations/${slug}/`)).data };
export const authApi = {
  login: async (email: string, password: string) => { const response = await api.post("/auth/login/", { email, password }); localStorage.setItem("access_token", response.data.access); localStorage.setItem("refresh_token", response.data.refresh); return response.data; },
  register: async (full_name: string, email: string, password: string, confirm_password: string) => (await api.post("/auth/register/", { full_name, email, password, confirm_password })).data,
  me: async () => (await api.get<User>("/accounts/me/")).data,
  updateMe: async (data: Partial<Pick<User, "full_name" | "phone">>) => (await api.patch<User>("/accounts/me/", data)).data,
  logout: () => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); },
};

export type TravelerUploadDraft = { full_name: string; passport_number: string; date_of_birth: string; passport_status: "valid" | "expired"; mobility_assistance: "yes" | "wheelchair_assistance"; passport_document: File | null; passport_photo: File | null };

export const bookingsApi = {
  list: async () => (await api.get("/bookings/")).data,
  create: async (data: { tour_slug: string; departure_date: string; travelers: TravelerUploadDraft[]; contact_email: string; contact_phone: string; payment_type: "full_payment" | "down_payment"; payment_method: "card" | "zelle" }) => {
    const form = new FormData();
    form.append("tour_slug", data.tour_slug); form.append("departure_date", data.departure_date); form.append("contact_email", data.contact_email); form.append("contact_phone", data.contact_phone); form.append("payment_type", data.payment_type); form.append("payment_method", data.payment_method);
    form.append("travelers", JSON.stringify(data.travelers.map(({ passport_document, passport_photo, ...traveler }) => traveler)));
    data.travelers.forEach((traveler, index) => { if (traveler.passport_document) form.append(`traveler_${index}_passport_document`, traveler.passport_document); if (traveler.passport_photo) form.append(`traveler_${index}_passport_photo`, traveler.passport_photo); });
    return (await api.post("/bookings/", form)).data;
  },
  get: async (id: number) => (await api.get(`/bookings/${id}/`)).data,
};

export const paymentsApi = {
  createOrder: async (bookingId: number) => (await api.post("/payments/create-order/", { bookingId })).data as { orderId: string; amount: number; currency: string; keyId: string },
};

export const enquiriesApi = { create: async (data: { name: string; email: string; phone?: string; message: string }) => (await api.post("/enquiries/", data)).data };
export const reviewsApi = { list: async (tourSlug: string) => (await api.get("/reviews/", { params: { tour: tourSlug } })).data, create: async (data: { tour_slug: string; author_name: string; rating: number; comment: string }) => (await api.post("/reviews/", data)).data };
