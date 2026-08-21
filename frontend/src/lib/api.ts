import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";
export const api = axios.create({ baseURL: API_BASE_URL });

let refreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original?._retry || original?.url?.includes("/auth/")) return Promise.reject(error);
    original._retry = true;
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return Promise.reject(error);
    if (refreshing) {
      const token = await new Promise<string | null>((resolve) => refreshQueue.push(resolve));
      if (!token) return Promise.reject(error);
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    }
    refreshing = true;
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken });
      const access = response.data.access as string;
      localStorage.setItem("access_token", access);
      if (response.data.refresh) localStorage.setItem("refresh_token", response.data.refresh as string);
      refreshQueue.forEach((resolve) => resolve(access));
      refreshQueue = [];
      original.headers.Authorization = `Bearer ${access}`;
      return api(original);
    } catch (refreshError) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      refreshQueue.forEach((resolve) => resolve(null));
      refreshQueue = [];
      return Promise.reject(refreshError);
    } finally {
      refreshing = false;
    }
  }
);

export interface Destination { id: number; slug: string; name: string; country: string; hero_image: string; short_description: string; latitude: number; longitude: number; }
export interface TourImage { id: number; url: string; alt: string; }
export interface ItineraryDay { id: number; day: number; title: string; description: string; }
export interface Tour { id: number; slug: string; title: string; destination: { id: number; slug: string; name: string; country: string }; duration_days: number; duration_nights: number; price: number; currency: string; rating: number; review_count: number; cover_image: string; images: TourImage[]; halal_features: string[]; summary: string; itinerary: ItineraryDay[]; departure_city: string; }
export interface User { id: number; full_name: string; email: string; phone: string; is_staff: boolean; }

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

export type AdminTourPayload = {
  destination: number;
  slug: string;
  title: string;
  duration_days: number;
  duration_nights: number;
  price: number;
  currency: string;
  rating: number;
  review_count: number;
  cover_image: string;
  halal_features: string[];
  summary: string;
  departure_city: string;
  images: Array<{ url: string; alt: string }>;
  itinerary: Array<{ day: number; title: string; description: string }>;
};

export type AdminSummary = {
  bookings: { total: number; pending: number; confirmed: number; cancelled: number };
  customers: number;
  enquiries: number;
  payments: { total: number; captured: number; failed: number };
};

export type AdminEnquiry = { id: number; name: string; email: string; phone: string; message: string; created_at: string; handled: boolean };
export type AdminCustomer = { id: number; full_name: string; email: string; phone: string; is_staff: boolean; date_joined: string; booking_count: number };
export type AdminPayment = { id: number; booking_id: number; customer_name: string; customer_email: string; tour_slug: string; razorpay_order_id: string; razorpay_payment_id: string; amount: number; currency: string; status: string; created_at: string; updated_at: string };

export const adminApi = {
  summary: async () => (await api.get<AdminSummary>("/admin/summary/")).data,
  tours: async () => (await api.get<Tour[]>("/tours/" )).data,
  createTour: async (data: AdminTourPayload) => (await api.post<Tour>("/tours/", data)).data,
  updateTour: async (slug: string, data: Partial<AdminTourPayload>) => (await api.patch<Tour>(`/tours/${slug}/`, data)).data,
  deleteTour: async (slug: string) => api.delete(`/tours/${slug}/`),
  destinations: async () => (await api.get<Destination[]>("/destinations/")).data,
  createDestination: async (data: Omit<Destination, "id">) => (await api.post<Destination>("/destinations/", data)).data,
  updateDestination: async (slug: string, data: Partial<Omit<Destination, "id" | "slug">>) => (await api.patch<Destination>(`/destinations/${slug}/`, data)).data,
  deleteDestination: async (slug: string) => api.delete(`/destinations/${slug}/`),
  bookings: async () => (await api.get("/bookings/")).data,
  updateBooking: async (id: number, data: { status: "pending" | "confirmed" | "cancelled" }) => (await api.patch(`/bookings/${id}/`, data)).data,
  enquiries: async () => (await api.get<AdminEnquiry[]>("/admin/enquiries/")).data,
  updateEnquiry: async (id: number, data: { handled: boolean }) => (await api.patch<AdminEnquiry>(`/admin/enquiries/${id}/`, data)).data,
  customers: async () => (await api.get<AdminCustomer[]>("/admin/customers/")).data,
  payments: async () => (await api.get<AdminPayment[]>("/admin/payments/")).data,
  settings: async () => (await api.get<{ phone: string; email: string; whatsapp: string }>("/settings/")).data,
  updateSettings: async (data: { phone?: string; email?: string; whatsapp?: string }) => (await api.patch<{ phone: string; email: string; whatsapp: string }>("/settings/", data)).data,
};
