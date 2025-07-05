'use client'

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import Header from '../components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Navbar from '@/components/navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import api from '@/utils/api/axios';

interface Accommodation {
  _id: string;
  name: string;
  address: string;
  price: number;
  images: {
    url: string;
    public_id: string;
  }[];
  description?: string;
  amenities?: string[];
  rules?: string[];
}

const OwnerDashboard: React.FC = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this accommodation?')) {
      return;
    }

    try {
      setDeletingIds(prev => new Set(prev).add(id));
      await api.delete(`/owner/accommodations/${id}`);
      setAccommodations(prev => prev.filter(acc => acc._id !== id));
      setError(null);
    } catch (error) {
      console.error('Error deleting accommodation:', error);
      setError('An error occurred while deleting the accommodation');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const fetchAccommodations = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/owner/accommodations');
        setAccommodations(data.accommodations || []);
      } catch (error) {
        console.error('Error fetching accommodations:', error);
        setError('Failed to load accommodations');
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Owner Dashboard</h2>
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="medium" text="Loading your dashboard..." />
          </div>
        )}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Your Accommodations</h3>
            <Link to="/add-accommodation">
              <Button variant="primary" size="small">Add New Accommodation</Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Address</th>
                  <th className="py-2 px-4 text-left">Price</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accommodations.map((accommodation) => (
                  <tr key={accommodation._id} className="border-b">
                    <td className="py-2 px-4">
                      <div className="flex items-center space-x-3">
                        {accommodation.images && accommodation.images[0] && (
                          <img 
                            src={accommodation.images[0].url} 
                            alt={accommodation.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        )}
                        <span>{accommodation.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4">{accommodation.address}</td>
                    <td className="py-2 px-4">₹{accommodation.price}/month</td>
                    <td className="py-2 px-4">
                      <Button 
                        variant="secondary" 
                        size="small"
                        onClick={() => window.location.href = `/edit-accommodation/${accommodation._id}`}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="small" 
                        className="ml-2"
                        onClick={() => handleDelete(accommodation._id)}
                        disabled={loading || deletingIds.has(accommodation._id)}
                      >
                        {deletingIds.has(accommodation._id) ? 'Deleting...' : 'Delete'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Stats & Bookings Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Accommodations</h3>
            <p className="text-3xl font-bold text-blue-600">{accommodations.length}</p>
          </div>
          <Link 
            to="/owner/bookings" 
            className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center hover:bg-blue-50 transition-colors duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Manage Bookings</h3>
            <p className="text-blue-600">View all booking requests →</p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OwnerDashboard;
