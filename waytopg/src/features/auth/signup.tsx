import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader } from 'lucide-react';
import PhoneSignupForm from './PhoneSignupForm';
// import UserDetailsForm from './UserDetailsForm';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
// import type { User } from '@/types';

interface FormData {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'owner' | 'admin';
  companyName?: string;
  businessRegistration?: string;
  adminCode?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
}

interface FormErrors {
  name?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  companyName?: string;
  businessRegistration?: string;
  adminCode?: string;
  form?: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'details'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    isPhoneVerified: false,
    isEmailVerified: false
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '', form: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    else if (!/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Please enter a valid phone number';
    
    // Email is optional during signup
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'If provided, email must be valid';
    }
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (formData.role === 'owner') {
      if (!formData.companyName?.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.businessRegistration?.trim()) newErrors.businessRegistration = 'Business registration number is required';
    }

    if (formData.role === 'admin' && !formData.adminCode?.trim()) newErrors.adminCode = 'Admin code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Check if phone is verified
    if (!formData.isPhoneVerified) {
      setErrors({ form: 'Phone number must be verified before creating account' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('https://waytopg-dev.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          email: formData.email || undefined, // Make email optional
          password: formData.password,
          role: formData.role,
          isPhoneVerified: formData.isPhoneVerified,
          isEmailVerified: false, // Email verification can be done later
          companyName: formData.role === 'owner' ? formData.companyName : undefined,
          businessRegistration: formData.role === 'owner' ? formData.businessRegistration : undefined,
          adminCode: formData.role === 'admin' ? formData.adminCode : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account');
      }

      const data = await response.json();
      
      // Store the user token and role
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      
      // Navigate based on role
      switch (data.role) {
        case 'student':
          navigate('/accommodations');
          break;
        case 'owner':
          navigate('/owner-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ form: error instanceof Error ? error.message : 'An error occurred during signup' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneVerified = (verifiedNumber: string, isVerified: boolean) => {
    if (!isVerified) {
      setErrors({ form: 'Phone number must be verified before proceeding' });
      return;
    }
    setFormData(prev => ({ 
      ...prev, 
      phoneNumber: verifiedNumber,
      isPhoneVerified: true 
    }));
    setStep('details');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Or{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  sign in to your account
                </Link>
              </p>
            </div>

            {step === 'phone' ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900">Verify Your Phone Number</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    We'll send you a verification code to confirm your number
                  </p>
                </div>
                <PhoneSignupForm onVerificationComplete={handlePhoneVerified} />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.form && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{errors.form}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500
                      ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500
                      ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500
                      ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500
                      ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm 
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="student">Student</option>
                    <option value="owner">Property Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {formData.role === 'owner' && (
                  <>
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500
                          ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.companyName && (
                        <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="businessRegistration" className="block text-sm font-medium text-gray-700">
                        Business Registration Number
                      </label>
                      <input
                        type="text"
                        id="businessRegistration"
                        name="businessRegistration"
                        value={formData.businessRegistration}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500
                          ${errors.businessRegistration ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.businessRegistration && (
                        <p className="mt-1 text-sm text-red-500">{errors.businessRegistration}</p>
                      )}
                    </div>
                  </>
                )}

                {formData.role === 'admin' && (
                  <div>
                    <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700">
                      Admin Code
                    </label>
                    <input
                      type="text"
                      id="adminCode"
                      name="adminCode"
                      value={formData.adminCode}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
                        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500
                        ${errors.adminCode ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.adminCode && (
                      <p className="mt-1 text-sm text-red-500">{errors.adminCode}</p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}