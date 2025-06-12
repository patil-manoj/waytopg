import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { MapPin, Star, Wifi, Tv, Users, Utensils, Car, Snowflake, BookOpen, ChevronLeft, ChevronRight, 
  Fan, Bath, Wind, ShieldCheck, Package, Home, Zap, ArrowUpDown, Video, Heater, Dumbbell } from 'lucide-react';
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
  mapLink?: string;
}

const AccommodationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Image modal state

  useEffect(() => {
    const fetchAccommodation = async () => {
      setIsLoading(true);
      setError(null);
      try {

        const response = await fetch(`https://waytopg.onrender.com/api/accommodations/${id}`);
        
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
          rules: data.rules || [],
          mapLink: data.mapLink
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

  const handleBooking = async () => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      alert('Check-out date must be after check-in date');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to book accommodation');
        return;
      }


      const response = await fetch('https://waytopg.onrender.com/api/student/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          accommodation: id,
          checkIn: checkInDate,
          checkOut: checkOutDate
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Booking confirmed successfully!');
        // Refresh the accommodation data to update status
        window.location.reload();
      } else {
        alert(data.message || 'Error making booking. Please try again.');
      }
    } catch (error) {
      console.error('Error booking accommodation:', error);
      alert('Error making booking. Please try again.');
    }
  };

  const handleNextImage = useCallback(() => {
    if (accommodation && accommodation.images) {
      const newIndex = currentImageIndex === accommodation.images.length - 1 ? 0 : currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(accommodation.images[newIndex].url);
    }
  }, [accommodation, currentImageIndex]);

  const handlePrevImage = useCallback(() => {
    if (accommodation && accommodation.images) {
      const newIndex = currentImageIndex === 0 ? accommodation.images.length - 1 : currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(accommodation.images[newIndex].url);
    }
  }, [accommodation, currentImageIndex]);

  // Add keyboard navigation handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (selectedImage) {
        if (event.key === 'ArrowRight') {
          handleNextImage();
        } else if (event.key === 'ArrowLeft') {
          handlePrevImage();
        } else if (event.key === 'Escape') {
          setSelectedImage(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, handleNextImage, handlePrevImage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 via-blue-50 to-white">
        <LoadingSpinner size="large" text="Loading accommodation details..." />
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
    'TV': <Tv className="w-5 h-5" />,
    'Parking': <Car className="w-5 h-5" />,
    'Kitchen': <Utensils className="w-5 h-5" />,
    'Gym': <Dumbbell className="w-5 h-5" />,
    'Air Conditioning': <Snowflake className="w-5 h-5" />,
    'Fan': <Fan className="w-5 h-5" />,
    'Attached Bathroom': <Bath className="w-5 h-5" />,
    'Laundry': <Wind className="w-5 h-5" />,
    'Security': <ShieldCheck className="w-5 h-5" />,
    'Study Table': <BookOpen className="w-5 h-5" />,
    'Cupboard': <Package className="w-5 h-5" />,
    'Balcony': <Home className="w-5 h-5" />,
    'Power Backup': <Zap className="w-5 h-5" />,
    'Elevator': <ArrowUpDown className="w-5 h-5" />,
    'CCTV': <Video className="w-5 h-5" />,
    'Water Heater': <Heater className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="relative">
            {/* Main Image Display */}
            <div className="h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden relative group">
              {accommodation.images && accommodation.images.length > 0 ? (
                <>
                  <img 
                    src={accommodation.images[currentImageIndex].url} 
                    alt={`${accommodation.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                    onClick={() => setSelectedImage(accommodation.images[currentImageIndex].url)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg?height=500&width=800';
                    }}
                  />
                  {accommodation.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </>
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
                        ${currentImageIndex === index ? 'ring-2 ring-blue-500' : 'ring-1 ring-white/50'}`}
                      onClick={() => setCurrentImageIndex(index)}
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
                className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
                onClick={() => setSelectedImage(null)}
              >
                <div className="relative mx-auto" style={{ width: '80vw', height: '80vh' }}>
                  <img
                    src={selectedImage}
                    alt={accommodation.name}
                    className="w-full h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors z-50"
                    onClick={() => setSelectedImage(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {accommodation.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevImage();
                        }}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/75 transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-8 h-8" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextImage();
                        }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/75 transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-8 h-8" />
                      </button>
                    </>
                  )}
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
                <div className="bg-gray-100 h-64 rounded-lg overflow-hidden relative">
                  {accommodation.address ? (
                    <div className="w-full h-full">
                      <iframe
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(accommodation.address + ', ' + accommodation.city)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Location of ${accommodation.name}`}
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <MapPin className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-center px-4">
                        <span className="font-medium block mb-1">Location map unavailable</span>
                        {accommodation.address}, {accommodation.city}
                      </p>
                    </div>
                  )}
                  {accommodation.mapLink && (
                    <a
                      href={accommodation.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-4 right-4 bg-white text-blue-600 px-4 py-2 rounded-full shadow-md hover:bg-blue-50 transition-colors duration-200 flex items-center"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Open in Google Maps
                    </a>
                  )}
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
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-2xl shadow-xl overflow-hidden group">
                  {/* Glass effect overlay */}
                  <div className="absolute inset-0 bg-white opacity-90"></div>

                  {/* Subtle corner accent */}
                  <div className="absolute top-0 right-0 w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-bl from-blue-200 via-purple-200 to-transparent rounded-bl-full opacity-30"></div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20"></div>
                  
                  {/* Price section with animation */}
                  <div className="relative">
                    <h2 className="relative text-4xl font-bold mb-2 flex items-baseline text-blue-600">
                      <span className="flex items-center">
                        <span className="text-blue-700">$</span>
                        <span>{accommodation.price}</span>
                      </span>
                      <span className="text-lg font-medium text-blue-500 ml-2">/month</span>
                    </h2>
                    <div className="h-px bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 my-4"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="relative group/date">
                      <label htmlFor="checkIn" className="block text-sm font-semibold text-blue-700 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Check-in Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="checkIn"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-blue-200 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all duration-200 hover:border-blue-300 shadow-sm pl-10"
                        />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white/50 via-transparent to-transparent rounded-lg group-hover/date:opacity-0 transition-opacity"></div>
                      </div>
                    </div>
                    <div className="relative group/date">
                      <label htmlFor="checkOut" className="block text-sm font-semibold text-blue-700 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Check-out Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="checkOut"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-blue-200 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all duration-200 hover:border-blue-300 shadow-sm pl-10"
                        />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white/50 via-transparent to-transparent rounded-lg group-hover/date:opacity-0 transition-opacity"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 relative">
                    <Button 
                      onClick={handleBooking} 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold tracking-wide text-lg shadow-md hover:shadow-lg transition-all duration-300 py-3"
                      variant="primary"
                      size="large"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {localStorage.getItem('token') ? 'Book Now' : 'Login to Book'}
                      </span>
                    </Button>
                    <div className="mt-4 text-sm text-blue-700 text-center font-medium relative">
                      <div className="flex items-center justify-center space-x-2">
                        <span>Free cancellation up to 48 hours before check-in</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/95 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100/20 backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-6 text-blue-600">Why Book With Us?</h3>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex items-center bg-blue-50/50 p-3 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">Best Price Guarantee</span>
                    </li>
                    <li className="flex items-center bg-blue-50/50 p-3 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">24/7 Customer Support</span>
                    </li>
                    <li className="flex items-center bg-blue-50/50 p-3 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="font-medium">Verified Listings</span>
                    </li>
                    <li className="flex items-center bg-blue-50/50 p-3 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <span className="font-medium">Secure Payments</span>
                    </li>
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
