import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export interface Destination {
  id: number;
  slug: string;
  name: string;
  country: string;
  hero_image: string;
  short_description: string;
  latitude: number;
  longitude: number;
}

export interface TourImage {
  id: number;
  url: string;
  alt: string;
}

export interface ItineraryDay {
  id: number;
  day: number;
  title: string;
  description: string;
}

export interface Tour {
  id: number;
  slug: string;
  title: string;
  destination: {
    id: number;
    slug: string;
    name: string;
    country: string;
  };
  duration_days: number;
  duration_nights: number;
  price: number;
  currency: string;
  rating: number;
  review_count: number;
  cover_image: string;
  images: TourImage[];
  halal_features: string[];
  summary: string;
  itinerary: ItineraryDay[];
  departure_city: string;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
}

export const toursApi = {
  list: async (params?: Record<string, string | number>) => {
    const response = await api.get<Tour[]>("/tours/", { params });
    return response.data;
  },

  get: async (slug: string) => {
    const response = await api.get<Tour>(`/tours/${slug}/`);
    return response.data;
  },
};

export const destinationsApi = {
  list: async () => {
    const response = await api.get<Destination[]>("/destinations/");
    return response.data;
  },

  get: async (slug: string) => {
    const response = await api.get<Destination>(
      `/destinations/${slug}/`
    );
    return response.data;
  },
};

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login/", {
      email,
      password,
    });

    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);

    return response.data;
  },

  register: async (
    full_name: string,
    email: string,
    password: string,
    confirm_password: string
  ) => {
    const response = await api.post("/auth/register/", {
      full_name,
      email,
      password,
      confirm_password,
    });

    return response.data;
  },

  me: async () => {
    const response = await api.get<User>("/accounts/me/");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

export const bookingsApi = {
  list: async () => {
    const response = await api.get("/bookings/");
    return response.data;
  },

  create: async (data: {
    tour_slug: string;
    departure_date: string;
    travelers: {
      full_name: string;
      passport_number: string;
      date_of_birth: string;
    }[];
    contact_email: string;
    contact_phone: string;
  }) => {
    const response = await api.post("/bookings/", data);
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get(`/bookings/${id}/`);
    return response.data;
  },
};

export const reviewsApi = {
  list: async (tourSlug: string) => {
    const response = await api.get("/reviews/", {
      params: { tour: tourSlug },
    });

    return response.data;
  },

  create: async (data: {
    tour_slug: string;
    author_name: string;
    rating: number;
    comment: string;
  }) => {
    const response = await api.post("/reviews/", data);
    return response.data;
  },
};