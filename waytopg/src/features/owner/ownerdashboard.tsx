'use client'

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import Header from '../components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Navbar from '@/components/navbar';

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
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      console.log('Deleting accommodation:', { id });
      
      const response = await fetch(`https://waytopg-backend.onrender.com/api/owner/accommodations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (response.ok) {
        setAccommodations(prev => prev.filter(acc => acc._id !== id));
        setError(null); // Clear any previous errors
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete accommodation:', {
          status: response.status,
          error: errorData
        });
        setError(errorData.message || `Failed to delete accommodation (${response.status})`);
      }
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
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        
        console.log('Fetching accommodations with:', {
          token: token ? 'exists' : 'missing',
          userRole
        });

        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await fetch('https://waytopg-backend.onrender.com/api/owner/accommodations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('API Response:', {
          status: response.status,
          statusText: response.statusText
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Accommodations data:', data);
          setAccommodations(Array.isArray(data) ? data : data.accommodations || []);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch accommodations:', {
            status: response.status,
            error: errorData
          });
          setError(errorData.message || `Failed to fetch accommodations (${response.status})`);
        }
      } catch (error) {
        console.error('Error fetching accommodations:', error);
        setError('An error occurred while fetching accommodations');
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
          <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            Loading...
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
                    <td className="py-2 px-4">${accommodation.price}/month</td>
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
        <div className="mt-8 text-center">
          <Link to="/owner/bookings" className="text-green-600 hover:text-green-700 font-medium">
            View Bookings
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OwnerDashboard;