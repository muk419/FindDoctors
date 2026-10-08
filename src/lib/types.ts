export type LatLng = { lat: number; lng: number };

export type Degree = { code: string; level: number };

export type RatingSummary = { average: number | null; count: number };

export type Doctor = {
  id: string;
  name: string;
  kind: string;
  address: string;
  location: LatLng;
  rating: number | null;
  ratingCount: number;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  specialties: string[];
  distanceKm: number;
  degrees: Degree[];
  hospital: { id: string | null; name: string } | null;
  score: number;
};

export type Hospital = {
  id: string;
  name: string;
  address: string;
  location: LatLng;
  rating: number | null;
  ratingCount: number;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  specialties: string[];
  emergency: boolean;
  matchesSpecialty: boolean;
  distanceKm: number;
  doctorCount: number;
  topDegreeLevel: number;
  score: number;
  reasons: string[];
};

export type Pharmacy = {
  id: string;
  name: string;
  address: string;
  location: LatLng;
  rating: number | null;
  ratingCount: number;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  open24x7: boolean;
  distanceKm: number;
};

export type SortBy = "best" | "rating" | "distance";

export type SearchRequest = {
  lat: number;
  lng: number;
  name?: string;
  disease?: string;
  specialty?: string;
  radiusKm?: number;
  minRating?: number;
  sortBy?: SortBy;
};

export type SearchResponse = {
  specialty: string | null;
  doctors: Doctor[];
  hospitals: Hospital[];
  pharmacies: Pharmacy[];
  recommendedHospitalId: string | null;
};

export type TravelMode = "DRIVE" | "BIKE" | "WALK";

export type RouteStep = { instruction: string; distance: string; duration: string };

export type DirectionsResponse = {
  distance: string;
  duration: string;
  polyline: string;
  steps: RouteStep[];
};
