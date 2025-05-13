import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Calendar, User, Phone, Mail } from 'lucide-react';

interface Booking {
  _id: string;
  accommodation: {
    _id: string;
    name: string;
    address: string;
    images: Array<{ url: string }>;
  };
  student: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

const OwnerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      setLoading(true);
      setError(null);
      const response = await fetch('https://waytopg-dev.onrender.com/api/owner/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Booking fetch error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.message || `Failed to fetch bookings (${response.status})`);
      }

      const data = await response.json();
      console.log('Bookings data received:', data);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Booking Management</h2>
          <Button
            onClick={fetchBookings}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <h3 className="text-xl font-semibold mb-4">No Bookings Yet</h3>
            <p className="text-gray-600">You haven't received any bookings for your accommodations yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map(booking => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Accommodation Image */}
                <div className="relative h-48">
                  <img
                    src={booking.accommodation.images[0]?.url || '/placeholder.svg'}
                    alt={booking.accommodation.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium
                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </div>

                {/* Booking Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{booking.accommodation.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{booking.accommodation.address}</p>

                  <div className="space-y-3">
                    {/* Dates */}
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm">
                          <span className="font-medium">Check-in:</span>{' '}
                          {new Date(booking.checkIn).toLocaleDateString()}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Check-out:</span>{' '}
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">{booking.student.name}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">{booking.student.email}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">{booking.student.phoneNumber}</span>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OwnerBookings;
