import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { MapPin, Star, Wifi, Tv, Users, Utensils, Car, Snowflake, Sun } from 'lucide-react';
import Navbar from '@/components/navbar';

interface Accommodation {
  id: string;
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

const AccommodationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccommodation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://waytopg-dev.onrender.com/api/accommodations/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch accommodation details');
        }

        const data = await response.json();
        setAccommodation({
          id: data._id,
          name: data.name,
          address: data.address,
          price: data.price,
          rating: data.rating || 4.5,
          images: data.images || [],
          description: data.description,
          amenities: data.amenities || [],
          type: data.type,
          owner: data.owner,
          city: data.city,
          roomType: data.roomType,
          rules: data.rules || []
        });
      } catch (error) {
        console.error('Error fetching accommodation:', error);
        setError('Failed to load accommodation details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accommodation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!accommodation) {
    return null;
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
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="relative">
            {/* Main Image Display */}
            <div className="h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden">
              {accommodation.images && accommodation.images.length > 0 ? (
                <img 
                  src={selectedImage || accommodation.images[0].url} 
                  alt={accommodation.name} 
                  className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={() => setSelectedImage(selectedImage ? null : accommodation.images[0].url)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg?height=500&width=800';
                  }}
                />
              ) : (
                <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {accommodation.images && accommodation.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0">
                <div className="flex gap-1 sm:gap-2 justify-center px-2 sm:px-4 overflow-x-auto py-2">
                  {accommodation.images.map((image, index) => (
                    <div
                      key={image.public_id}
                      className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden cursor-pointer 
                        ${selectedImage === image.url ? 'ring-2 ring-blue-500' : 'ring-1 ring-white/50'}`}
                      onClick={() => setSelectedImage(image.url)}
                    >
                      <img
                        src={image.url}
                        alt={`${accommodation.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fullscreen Image Modal */}
            {selectedImage && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedImage(null)}
              >
                <div className="relative max-w-7xl w-full">
                  <img
                    src={selectedImage}
                    alt={accommodation.name}
                    className="w-full h-auto max-h-[90vh] object-contain"
                  />
                  <button
                    className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75"
                    onClick={() => setSelectedImage(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left column: Accommodation details */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{accommodation.name}</h1>
                  <p className="text-gray-600 flex flex-wrap items-center mt-2">
                    <MapPin className="w-5 h-5 mr-2 flex-shrink-0" /> 
                    <span className="break-words">{accommodation.address}
                    {accommodation.city && `, ${accommodation.city}`}</span>
                  </p>
                </div>
                <div className="flex items-center">
                  <Star className="w-6 h-6 text-yellow-400 mr-2" />
                  <span className="text-2xl font-semibold">{accommodation.rating?.toFixed(1)}</span>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Overview</h2>
                <p className="text-gray-700">{accommodation.description}</p>
              </div>
              
              {/* Property Details */}
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Property Type</h3>
                  <p className="text-gray-600 capitalize">{accommodation.type}</p>
                </div>
                {accommodation.roomType && (
                  <div>
                    <h3 className="font-medium text-gray-900">Room Type</h3>
                    <p className="text-gray-600 capitalize">{accommodation.roomType}</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
                  {accommodation.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-gray-600">
                      {amenityIcons[amenity] ? (
                        <div className="mr-2">{amenityIcons[amenity]}</div>
                      ) : (
                        <Users className="w-5 h-5 mr-2" />
                      )}
                      <span>{amenity}</span>
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

              {accommodation.rules && accommodation.rules.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">House Rules</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {accommodation.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Owner Information */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Property Owner</h2>
                <p className="text-gray-700">{accommodation.owner.name}</p>
                <p className="text-gray-600">{accommodation.owner.email}</p>
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
                  <Button 
                    onClick={handleBooking} 
                    className="w-full bg-white hover:bg-blue-50 text-blue-600 font-semibold tracking-wide"
                    variant="primary"
                    size="large"
                  >
                    {localStorage.getItem('token') ? 'Book Now' : 'Login to Book'}
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