import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { Home, MapPin, IndianRupee, Upload, Plus, Minus, Loader, Wifi, Tv, Car, 
  Utensils, Dumbbell, Fan, Snowflake, Bath, Wind, ShieldCheck, BookOpen, Package,
  Zap, ArrowUpDown, Video, Info, CreditCard, Map, Heater } from 'lucide-react';
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
  { id: 'Water-Heater', label: 'Water Heater', icon: Heater },
];

const furnishingOptions = [
  { value: 'furnished', label: 'Fully Furnished' },
  { value: 'semi-furnished', label: 'Semi Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

const genderOptions = [
  { value: 'male', label: 'Male Only' },
  { value: 'female', label: 'Female Only' },
  { value: 'any', label: 'Any' },
];

const AddAccommodationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  interface Owner {
    _id: string;
    name: string;
    email: string;
    role: string;
    isApproved: boolean;
  }
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isAdmin] = useState(() => localStorage.getItem('userRole') === 'admin');

  // Fetch owners if admin
  useEffect(() => {
    const fetchOwners = async () => {
      if (!isAdmin) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://waytopg.onrender.com/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch owners');
        }

        const data = await response.json();
        const { users } = data;
        setOwners(users.filter((user: Owner) => user.role === 'owner' && user.isApproved));
      } catch (error) {
        console.error('Error fetching owners:', error);
        setError('Failed to load owners list');
      }
    };

    fetchOwners();
  }, [isAdmin]);

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
    ownerId: '' // Only used by admin
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        setError('Please upload only image files');
      }
      return isValid;
    });
    
    if (validFiles.length + images.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    try {
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        quality: 0.8
      };

      const compressedFiles = await Promise.all(
        validFiles.map(async (file) => {
          try {
            const compressedFile = await imageCompression(file, compressionOptions);
            // Create a new File object with the compressed data
            return new File([compressedFile], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
          } catch (err) {
            console.error('Error compressing file:', err);
            return file; // Return original file if compression fails
          }
        })
      );

      setImages(prev => [...prev, ...compressedFiles]);
    } catch (error) {
      console.error('Error handling images:', error);
      setError('Error processing images. Please try again.');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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

    // Add ownerId validation for admin
    if (isAdmin && !formData.ownerId) {
      setError('Please select a property owner');
      return false;
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Please enter ${label}`);
        return false;
      }
    }

    // Validate images
    if (images.length === 0) {
      setError('Please upload at least one image');
      return false;
    }
    if (images.length > 10) {
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
    if (isLoading) return;
    
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
        capacity: parseInt(formData.capacity),
        securityDeposit: parseFloat(formData.securityDeposit),
        maintenanceCharges: formData.maintenanceCharges ? parseFloat(formData.maintenanceCharges) : 0,
        foodPrice: formData.foodPrice ? parseFloat(formData.foodPrice) : 0,
        noticePeriod: parseInt(formData.noticePeriod),
        rules: formData.rules.filter(item => item !== ''),
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

      // Append images with unique names to prevent duplicates
      images.forEach((image, index) => {
        const timestamp = Date.now();
        const newFile = new File([image], `${timestamp}_${index}_${image.name}`, {
          type: image.type
        });
        formDataToSend.append('images', newFile);
      });

      // Use different endpoints for admin and owner
      const endpoint = isAdmin ? 
        'https://waytopg.onrender.com/api/admin/accommodations' :
        'https://waytopg.onrender.com/api/owner/accommodations';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create accommodation (${response.status})`);
      }

      // Navigate based on role
      navigate(isAdmin ? '/admin-dashboard' : '/owner-dashboard');
    } catch (error) {
      console.error('Error adding accommodation:', error);
      setError('An error occurred while adding the accommodation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Add New Accommodation</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Home className="w-5 h-5 mr-2 text-green-600" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {isAdmin && (
                  <div>
                    <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-1">
                      Property Owner
                    </label>
                    <select
                      id="ownerId"
                      value={formData.ownerId}
                      onChange={(e) => setFormData(prev => ({ ...prev, ownerId: e.target.value }))}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Owner</option>
                      {owners.map((owner) => (
                        <option key={owner._id} value={owner._id}>
                          {owner.name} ({owner.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
            <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Location
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">House Rules</h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={handleAddRule}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Rule
                </Button>
              </div>
              
              <div className="space-y-4">
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
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Images</h2>
              
              <div className="space-y-4">
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

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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

            {/* Additional Details */}
            <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-green-600" />
                Additional Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 2"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender Preference
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {genderOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="furnishing" className="block text-sm font-medium text-gray-700 mb-1">
                    Furnishing Status
                  </label>
                  <select
                    id="furnishing"
                    value={formData.furnishing}
                    onChange={(e) => setFormData(prev => ({ ...prev, furnishing: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {furnishingOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="noticePeriod" className="block text-sm font-medium text-gray-700 mb-1">
                    Notice Period (days)
                  </label>
                  <input
                    type="number"
                    id="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={(e) => setFormData(prev => ({ ...prev, noticePeriod: e.target.value }))}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 30"
                  />
                </div>
              </div>
            </div>

            {/* Charges and Deposits */}
            <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                Charges and Deposits
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700 mb-1">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    id="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: e.target.value }))}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 10000"
                  />
                </div>

                <div>
                  <label htmlFor="maintenanceCharges" className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Charges (₹/month)
                  </label>
                  <input
                    type="number"
                    id="maintenanceCharges"
                    value={formData.maintenanceCharges}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCharges: e.target.value }))}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 1000"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.foodAvailable}
                        onChange={(e) => setFormData(prev => ({ ...prev, foodAvailable: e.target.checked }))}
                        className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2">Food Available</span>
                    </label>
                  </div>
                  {formData.foodAvailable && (
                    <div className="flex-1">
                      <input
                        type="number"
                        value={formData.foodPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, foodPrice: e.target.value }))}
                        placeholder="Monthly food charges"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.electricityIncluded}
                        onChange={(e) => setFormData(prev => ({ ...prev, electricityIncluded: e.target.checked }))}
                        className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2">Electricity Included in Rent</span>
                    </label>
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.waterIncluded}
                        onChange={(e) => setFormData(prev => ({ ...prev, waterIncluded: e.target.checked }))}
                        className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2">Water Included in Rent</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Map className="w-5 h-5 mr-2 text-green-600" />
                Location Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="mapLink" className="block text-sm font-medium text-gray-700 mb-1">
                    Google Maps Link
                  </label>
                  <input
                    type="url"
                    id="mapLink"
                    value={formData.mapLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, mapLink: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., https://goo.gl/maps/..."
                  />
                  <p className="mt-1 text-sm text-gray-500">Share your property's location on Google Maps</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={isLoading}
                className="min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Adding...
                  </>
                ) : (
                  'Add Accommodation'
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

export default AddAccommodationPage;
