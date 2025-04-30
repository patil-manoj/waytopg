import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from './Button';
import { MapPin, Star, Wifi, Tv, Users, Utensils, Car, Snowflake, Sun } from 'lucide-react';
import Navbar from './navbar';

interface Accommodation {
  id: string;
  name: string;
  address: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  amenities: string[];
  type: string;
}

const AccommodationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  useEffect(() => {
    const fetchAccommodation = async () => {
      // Simulating API call
      const data: Accommodation = {
        id: id || '1',
        name: 'Luxury Loft',
        address: '123 College St',
        price: 800,
        rating: 4.8,
        image: '/placeholder.svg?height=600&width=800',
        description: 'Experience luxury living in this stunning loft apartment. Perfect for students who appreciate high-end amenities and a prime location near campus. Enjoy spacious living areas, modern furnishings, and breathtaking city views. This accommodation offers the perfect blend of comfort and style, ensuring an unforgettable stay during your academic journey.',
        amenities: ['Wi-Fi', 'Fully Equipped Kitchen', 'Smart TV', 'Study Area', 'Gym Access', 'Parking', 'Air Conditioning', 'Heating'],
        type: 'Apartment'
      };
      setAccommodation(data);
    };

    fetchAccommodation();
  }, [id]);

  const handleBooking = () => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      alert('Check-out date must be after check-in date');
      return;
    }
    // Simulate booking process 
    alert(`Booking initiated for ${checkInDate} to ${checkOutDate}`);
  };

  if (!accommodation) {
    return <div>Loading...</div>;
  }

  const amenityIcons: { [key: string]: React.ReactNode } = {
    'Wi-Fi': <Wifi className="w-5 h-5" />,
    'Fully Equipped Kitchen': <Utensils className="w-5 h-5" />,
    'Smart TV': <Tv className="w-5 h-5" />,
    'Study Area': <Users className="w-5 h-5" />,
    'Gym Access': <Users className="w-5 h-5" />,
    'Parking': <Car className="w-5 h-5" />,
    'Air Conditioning': <Snowflake className="w-5 h-5" />,
    'Heating': <Sun className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img src={accommodation.image} alt={accommodation.name} className="w-full h-[400px] object-cover" />
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: Accommodation details */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold mb-4">{accommodation.name}</h1>
              <p className="text-gray-600 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" /> {accommodation.address}
              </p>
              <div className="flex items-center mb-6">
                <Star className="w-6 h-6 text-yellow-400 mr-2" />
                <span className="text-2xl font-semibold">{accommodation.rating.toFixed(1)}</span>
                <span className="ml-2 text-gray-600">({Math.floor(Math.random() * 100) + 50} reviews)</span>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Overview</h2>
                <p className="text-gray-700">{accommodation.description}</p>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  {accommodation.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-gray-600">
                      {amenityIcons[amenity]}
                      <span className="ml-2">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Map placeholder</p>
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">House Rules</h2>
                <ul className="list-disc list-inside text-gray-700">
                  <li>No smoking</li>
                  <li>No pets</li>
                  <li>No parties or events</li>
                  <li>Check-in time is 2PM - 8PM</li>
                  <li>Check out by 11AM</li>
                </ul>
              </div>
            </div>
            
            {/* Right column: Sticky booking information */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-lg shadow-md text-white">
                  <h2 className="text-2xl font-bold mb-4">${accommodation.price}<span className="text-sm text-blue-200">/month</span></h2>
                  <div className="mb-4">
                    <label htmlFor="checkIn" className="block text-sm font-medium text-blue-100 mb-1">Check-in Date</label>
                    <input
                      type="date"
                      id="checkIn"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border-0 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="checkOut" className="block text-sm font-medium text-blue-100 mb-1">Check-out Date</label>
                    <input
                      type="date"
                      id="checkOut"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border-0 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <Button onClick={handleBooking} className="w-full bg-white hover:bg-blue-50 text-blue-600">
                    Book Now
                  </Button>
                  <p className="mt-4 text-sm text-blue-200 text-center">Free cancellation up to 48 hours before check-in</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold mb-2">Why Book With Us?</h3>
                  <ul className="text-sm text-gray-600">
                    <li className="mb-1">• Best Price Guarantee</li>
                    <li className="mb-1">• 24/7 Customer Support</li>
                    <li className="mb-1">• Verified Listings</li>
                    <li>• Secure Payments</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccommodationDetailPage;