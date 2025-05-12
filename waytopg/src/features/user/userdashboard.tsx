import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import type { Booking } from '@/types';

const UserDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchBookings = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null);
      const response = await fetch('https://waytopg-backend.onrender.com/api/student/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://waytopg-backend.onrender.com/api/student/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Update the booking status in the UI
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      ));

    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Student Dashboard</h2>
          <Button
            onClick={fetchBookings}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Bookings'}
          </Button>
        </div>
        
        {error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <h3 className="text-xl font-semibold mb-4">No Bookings Yet</h3>
            <p className="text-gray-600 mb-6">You haven't made any bookings yet. Start exploring accommodations!</p>
            <Link to="/accommodations">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Browse Accommodations
              </Button>
            </Link>
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
                  <p className="text-gray-600 text-sm mb-3">{booking.accommodation.address}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="font-medium">Check-in:</span>{' '}
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Check-out:</span>{' '}
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link 
                      to={`/accommodation/${booking.accommodation._id}`}
                      className="flex-1"
                    >
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        View Details
                      </Button>
                    </Link>
                    {booking.status !== 'cancelled' && (
                      <Button 
                        onClick={() => handleCancelBooking(booking._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        Cancel
                      </Button>
                    )}
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

export default UserDashboard;