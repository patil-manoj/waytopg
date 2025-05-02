import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Navbar from './navbar';

interface Booking {
  id: string;
  accommodationName: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

const UserDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://waytopg-backend.onrender.com/api/user/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setBookings(data.bookings);
        } else {
          console.error('Failed to fetch bookings');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Student Dashboard</h2>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4">Your Bookings</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Accommodation</th>
                  <th className="py-2 px-4 text-left">Check-in</th>
                  <th className="py-2 px-4 text-left">Check-out</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b">
                    <td className="py-2 px-4">{booking.accommodationName}</td>
                    <td className="py-2 px-4">{booking.checkIn}</td>
                    <td className="py-2 px-4">{booking.checkOut}</td>
                    <td className="py-2 px-4">{booking.status}</td>
                    <td className="py-2 px-4">
                      <Button variant="secondary" size="small">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/accommodations" className="text-green-600 hover:text-green-700 font-medium">
            Browse Accommodations
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;