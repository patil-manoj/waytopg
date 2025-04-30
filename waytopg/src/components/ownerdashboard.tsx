'use client'

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import Header from '../components/Header';
import Footer from './Footer';
import Button from './Button';
import Navbar from './navbar';

interface Accommodation {
  id: string;
  name: string;
  address: string;
  price: number;
}

const OwnerDashboard: React.FC = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://waytopg-backend.onrender.com/api/owner/accommodations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAccommodations(data.accommodations);
        } else {
          console.error('Failed to fetch accommodations');
        }
      } catch (error) {
        console.error('Error fetching accommodations:', error);
      }
    };

    fetchAccommodations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Owner Dashboard</h2>
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
                  <tr key={accommodation.id} className="border-b">
                    <td className="py-2 px-4">{accommodation.name}</td>
                    <td className="py-2 px-4">{accommodation.address}</td>
                    <td className="py-2 px-4">${accommodation.price}/month</td>
                    <td className="py-2 px-4">
                      <Button variant="secondary" size="small">Edit</Button>
                      <Button variant="secondary" size="small" className="ml-2">Delete</Button>
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