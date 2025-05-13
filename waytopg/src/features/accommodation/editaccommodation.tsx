import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, MapPin, IndianRupee, Upload, Plus, Minus, Loader, Wifi, Tv, Car, 
  Utensils, Dumbbell, Fan, Snowflake, Bath, Wind, ShieldCheck, BookOpen, Package,
  Zap, ArrowUpDown, Video } from 'lucide-react';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Navbar from '@/components/navbar';

interface AmenityOption {
  id: string;
  label: string;
  icon: React.ElementType;
}

const amenityOptions: AmenityOption[] = [
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'kitchen', label: 'Kitchen', icon: Utensils },
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'ac', label: 'Air Conditioning', icon: Snowflake },
  { id: 'fan', label: 'Fan', icon: Fan },
  { id: 'bathroom', label: 'Attached Bathroom', icon: Bath },
  { id: 'laundry', label: 'Laundry', icon: Wind },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'study-table', label: 'Study Table', icon: BookOpen },
  { id: 'cupboard', label: 'Cupboard', icon: Package },
  { id: 'balcony', label: 'Balcony', icon: Home },
  { id: 'power-backup', label: 'Power Backup', icon: Zap },
  { id: 'elevator', label: 'Elevator', icon: ArrowUpDown },
  { id: 'cctv', label: 'CCTV', icon: Video },
];

const EditAccommodationPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ url: string; public_id: string }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    price: '',
    type: 'apartment',
    roomType: 'single',
    amenities: [] as string[],
    rules: [''],
    mapLink: '',
    capacity: '',
    status: 'available',
    gender: 'any',
    furnishing: 'furnished',
    securityDeposit: '',
    foodAvailable: false,
    foodPrice: '',
    maintenanceCharges: '',
    electricityIncluded: false,
    waterIncluded: false,
    noticePeriod: '30',
  });

  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch(`https://waytopg-dev.onrender.com/api/owner/accommodations/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch accommodation details');
        }
        setFormData({
          name: data.name || '',
          description: data.description || '',
          address: data.address || '',
          city: data.city || '',
          price: data.price?.toString() || '',
          type: data.type || 'apartment',
          roomType: data.roomType || 'single',
          amenities: data.amenities || [],
          rules: data.rules?.length ? data.rules : [''],
          mapLink: data.mapLink || '',
          capacity: data.capacity?.toString() || '',
          status: data.status || 'available',
          gender: data.gender || 'any',
          furnishing: data.furnishing || 'furnished',
          securityDeposit: data.securityDeposit?.toString() || '',
          foodAvailable: data.foodAvailable || false,
          foodPrice: data.foodPrice?.toString() || '',
          maintenanceCharges: data.maintenanceCharges?.toString() || '',
          electricityIncluded: data.electricityIncluded || false,
          waterIncluded: data.waterIncluded || false,
          noticePeriod: data.noticePeriod?.toString() || '30',
        });
        setExistingImages(data.images || []);
      } catch (error) {
        console.error('Error fetching accommodation:', error);
        setError('Failed to load accommodation details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAccommodation();
    }
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        setError('Please upload only image files');
      }
      return isValid;
    });

    if (validFiles.length + images.length + existingImages.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }
    
    setImages(prev => [...prev, ...validFiles]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleAddRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const handleRemoveRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleRuleChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  const validateForm = () => {
    // Required fields
    const requiredFields = {
      name: 'Property Name',
      address: 'Address',
      city: 'City',
      price: 'Rent Amount',
      capacity: 'Room Capacity',
      securityDeposit: 'Security Deposit'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Please enter ${label}`);
        return false;
      }
    }

    // Validate images
    if (images.length + existingImages.length === 0) {
      setError('Please upload at least one image');
      return false;
    }
    if (images.length + existingImages.length > 10) {
      setError('Maximum 10 images allowed');
      return false;
    }

    // Validate numeric fields
    const numericFields = ['price', 'capacity', 'securityDeposit', 'maintenanceCharges', 'foodPrice', 'noticePeriod'];
    for (const field of numericFields) {
      const value = parseFloat(formData[field as keyof typeof formData] as string);
      if (formData[field as keyof typeof formData] && (isNaN(value) || value < 0)) {
        setError(`Please enter a valid number for ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Validate map link format if provided
    if (formData.mapLink && !formData.mapLink.startsWith('https://')) {
      setError('Please enter a valid Google Maps link');
      return false;
    }

    // Validate food price if food is available
    if (formData.foodAvailable && !formData.foodPrice) {
      setError('Please enter food charges');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !id) return;
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const formDataToSend = new FormData();
      
      // Convert form data to the correct types before sending
      const processedFormData = {
        ...formData,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity, 10),
        securityDeposit: parseFloat(formData.securityDeposit),
        maintenanceCharges: formData.maintenanceCharges ? parseFloat(formData.maintenanceCharges) : 0,
        foodPrice: formData.foodPrice ? parseFloat(formData.foodPrice) : 0,
        noticePeriod: parseInt(formData.noticePeriod, 10),
        rules: formData.rules.filter(item => item !== '')
      };

      // Append all form fields
      Object.entries(processedFormData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formDataToSend.append(key, value.toString());
        } else {
          formDataToSend.append(key, value?.toString() || '');
        }
      });

      // Append existing images
      formDataToSend.append('existingImages', JSON.stringify(existingImages));

      // Append new images
      images.forEach((image, index) => {
        const timestamp = Date.now();
        const newFile = new File([image], `${timestamp}_${index}_${image.name}`, {
          type: image.type
        });
        formDataToSend.append('images', newFile);
      });

      const response = await fetch(`https://waytopg-dev.onrender.com/api/owner/accommodations/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update accommodation (${response.status})`);
      }

      navigate('/owner-dashboard');
    } catch (error) {
      console.error('Error updating accommodation:', error);
      setError('An error occurred while updating the accommodation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">Edit Accommodation</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-6" role="alert">
              <span className="text-sm sm:text-base block">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <Home className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-green-600" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Accommodation Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Sunny Student Villa"
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Accommodation Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="hostel">Hostel</option>
                    <option value="pg">PG</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe your accommodation..."
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <MapPin className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-green-600" />
                Location
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <IndianRupee className="w-5 h-5 mr-2 text-green-600" />
                Pricing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Rent (₹)
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 10000"
                  />
                </div>

                <div>
                  <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type
                  </label>
                  <select
                    id="roomType"
                    value={formData.roomType}
                    onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="single">Single Sharing</option>
                    <option value="double">Double Sharing</option>
                    <option value="triple">Triple Sharing</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {amenityOptions.map((amenity) => {
                  const Icon = amenity.icon;
                  const isSelected = formData.amenities.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'border-green-500 bg-green-50 text-green-700' 
                          : 'border-gray-200 hover:border-green-500 hover:bg-green-50'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium block text-center">{amenity.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* House Rules */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">House Rules</h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={handleAddRule}
                  className="w-full sm:w-auto flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Rule
                </Button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {formData.rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => handleRuleChange(index, e.target.value)}
                      placeholder="e.g., No smoking"
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {formData.rules.length > 1 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={() => handleRemoveRule(index)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Images</h2>
              
              {existingImages.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">Current Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Current ${index + 1}`}
                          className="h-24 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500">
                        <span>Upload images</span>
                        <input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                  </div>
                </div>

                {/* New Images Preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="h-24 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={isLoading}
                className="w-full sm:w-auto min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Updating...
                  </>
                ) : (
                  'Update Accommodation'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default EditAccommodationPage;
