import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { Search, MapPin, Star, RefreshCw, Loader } from 'lucide-react';
import Navbar from './navbar';
import AuthPopup from './AuthPopup';

interface AccommodationResponse {
  _id: string;
  name: string;
  address: string;
  price: number;
  rating?: number;
  images?: Array<{ url: string }>;
  type?: string;
}

interface Accommodation {
  id: string;
  name: string;
  address: string;
  price: number;
  rating: number;
  image: string;
  type: string;
}



const AccommodationListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState<Accommodation[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  
  // Get search query from URL parameters when component mounts
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://waytopg-dev.onrender.com/api/accommodations', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch accommodations');
      }

      const data: AccommodationResponse[] = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }

      // Transform the data to match our interface
      const transformedData: Accommodation[] = data.map((acc: AccommodationResponse) => ({
        id: acc._id,
        name: acc.name || 'Unnamed Accommodation',
        address: acc.address || 'Address not available',
        price: typeof acc.price === 'number' ? acc.price : 0,
        rating: acc.rating || 4.5,
        image: acc.images?.[0]?.url || '/placeholder.svg?height=300&width=400',
        type: acc.type || 'Apartment'
      }));
      
      setAccommodations(transformedData);
      setFilteredAccommodations(transformedData);
    } catch (err) {
      console.error('Error fetching accommodations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load accommodations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccommodations();
  }, []);

  useEffect(() => {
    const filtered = accommodations.filter(
      (acc: Accommodation) =>
        acc.price >= priceRange[0] &&
        acc.price <= priceRange[1] &&
        acc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedType === '' || acc.type === selectedType)
    );
    setFilteredAccommodations(filtered);
  }, [priceRange, searchTerm, selectedType, accommodations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-800">Find Your Perfect Accommodation</h1>
          <Button 
            onClick={fetchAccommodations}
            variant="primary"
            size="small"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <Button 
              onClick={fetchAccommodations}
              variant="secondary"
              size="small"
              className="ml-4"
            >
              Try again
            </Button>
          </div>
        )}
        
        <div className="mb-8 bg-white px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm bg-opacity-90">
          <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
            <div className="relative flex-1 min-w-0 md:max-w-[40%]">
              <input
                type="text"
                placeholder="Search by location, property name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-none w-full md:w-48 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Studio">Studio</option>
              <option value="Suite">Suite</option>
              <option value="Dorm">Dorm</option>
              <option value="House">House</option>
            </select>

            <div className="flex items-center gap-4 flex-1 min-w-0">
              <input
                type="range"
                min="0"
                max="100000"
                step="500"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="flex-1 min-w-0 h-2 bg-gradient-to-r from-blue-200 to-blue-600 rounded-full appearance-none cursor-pointer"
                style={{
                  WebkitAppearance: 'none',
                  outline: 'none'
                }}
              />
              <span className="flex-none whitespace-nowrap text-sm font-semibold text-blue-600">
                ₹{priceRange[1]}<span className="text-gray-500 font-normal">/mo</span>
              </span>
            </div>
          </div>
        </div>

        <style>{`
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            background-color: #ffffff;
            border: 2px solid #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
          }
          input[type='range']::-webkit-slider-thumb:hover {
            box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1);
          }
          input[type='range']::-webkit-slider-thumb:active {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2);
            background-color: #3b82f6;
            border-color: #3b82f6;
          }
        `}</style>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="mt-4 text-gray-600">Loading accommodations...</p>
          </div>
        ) : filteredAccommodations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-600">No accommodations found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAccommodations.map((accommodation) => (
              <div key={accommodation.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="relative">
                  <img src={accommodation.image} alt={accommodation.name} className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-semibold text-sm">{accommodation.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {accommodation.name}
                    </h2>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                      {accommodation.type}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" /> {accommodation.address}
                  </p>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">${accommodation.price}</span>
                        <span className="text-gray-500 text-sm">/month</span>
                      </div>
                      <Button 
                        variant="primary" 
                        size="small" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                        onClick={() => {
                          const token = localStorage.getItem('token');
                          if (!token) {
                            setShowAuthPopup(true);
                          } else {
                            window.location.href = `/accommodation/${accommodation.id}`;
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <AuthPopup isOpen={showAuthPopup} onClose={() => setShowAuthPopup(false)} />
    </div>
  );
};

export default AccommodationListPage;