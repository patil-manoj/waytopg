export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'student' | 'owner' | 'admin';
  isApproved: boolean;
  companyName?: string;
  businessRegistration?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  pendingApprovals: number;
  totalAccommodations: number;
  totalBookings: number;
}

export interface Accommodation {
  _id: string;
  name: string;
  address: string;
  price: number;
  rating?: number;
  images: Array<{ url: string; public_id: string }>;
  description: string;
  amenities: string[];
  type: string;
  owner: {
    name: string;
    email: string;
    isApproved: boolean;
  };
  city?: string;
  roomType?: string;
  rules?: string[];
}

export interface Booking {
  _id: string;
  accommodation: {
    _id: string;
    name: string;
    address: string;
    images: Array<{ url: string }>;
  };
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}
