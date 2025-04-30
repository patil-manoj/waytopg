import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
// import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { Search, MapPin, Star, } from 'lucide-react';
import Navbar from './navbar';

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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  // Get search query from URL parameters when component mounts
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    // In a real application, this would be an API call
    const fetchAccommodations = async () => {
      // Simulating API call
      const data: Accommodation[] = [
        { id: '1', name: 'Luxury Loft', address: '123 College St', price: 800, rating: 4.8, image: '/placeholder.svg?height=300&width=400', type: 'Apartment' },
        { id: '2', name: 'Cozy Studio', address: '456 University Ave', price: 500, rating: 4.2, image: '/placeholder.svg?height=300&width=400', type: 'Studio' },
        { id: '3', name: 'Spacious Suite', address: '789 Campus Rd', price: 700, rating: 4.6, image: '/placeholder.svg?height=300&width=400', type: 'Suite' },
        { id: '4', name: 'Modern Dorm', address: '101 Dorm Lane', price: 400, rating: 4.0, image: '/placeholder.svg?height=300&width=400', type: 'Dorm' },
        { id: '5', name: 'Eco-Friendly Flat', address: '202 Green St', price: 600, rating: 4.5, image: '/placeholder.svg?height=300&width=400', type: 'Apartment' },
        { id: '6', name: 'Historic Townhouse', address: '303 Heritage Ave', price: 900, rating: 4.7, image: '/placeholder.svg?height=300&width=400', type: 'House' },
      ];
      setAccommodations(data);
      setFilteredAccommodations(data);
    };

    fetchAccommodations();
  }, []);

  useEffect(() => {
    const filtered = accommodations.filter(
      (acc) =>
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
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Find Your Perfect Accommodation</h1>
        
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
                max="1000"
                step="50"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="flex-1 min-w-0 h-2 bg-gradient-to-r from-blue-200 to-blue-600 rounded-full appearance-none cursor-pointer"
                style={{
                  WebkitAppearance: 'none',
                  outline: 'none'
                }}
              />
              <span className="flex-none whitespace-nowrap text-sm font-semibold text-blue-600">
                ${priceRange[1]}<span className="text-gray-500 font-normal">/mo</span>
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
                    <Link to={`/accommodation/${accommodation.id}`}>
                      <Button variant="primary" size="small" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccommodationListPage;