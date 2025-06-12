import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authService } from '@/services/auth.service';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserRole = 'student' | 'owner' | 'admin';

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

const AuthPopup: React.FC<AuthPopupProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
    companyName: '',
    businessRegistration: '',
    adminCode: '',
    otp: '',
    isPhoneVerified: false,
    isEmailVerified: false
  });

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier && auth) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      });
    }
  };
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear general error
    setErrors(prev => ({ ...prev, [name]: '', form: '' })); // Clear specific field error
  };
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (isLogin) {
      if (!formData.phoneNumber.trim() || formData.phoneNumber.length !== 10) {
        newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
      }
      if (!formData.password) {
        newErrors.password = 'Please enter your password';
      }
    } else {
      switch (step) {
        case 'phone':
          if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
          else if (!/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Please enter a valid phone number';
          break;
        
        case 'otp':
          if (!formData.otp || formData.otp.length !== 6) {
            newErrors.form = 'Please enter a valid 6-digit OTP';
          }
          break;
        
        case 'details':
          if (!formData.name.trim()) newErrors.name = 'Name is required';
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
          break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {

      if (!auth) {
        throw new Error('Firebase auth is not initialized');

      }

      setupRecaptcha();
      const formattedPhoneNumber = '+91' + formData.phoneNumber.trim().replace(/\D/g, '');
      
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        window.recaptchaVerifier
      );
      
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {

      if (!confirmationResult) {
        throw new Error('No OTP confirmation pending');
      }

      await confirmationResult.confirm(formData.otp);
      setFormData(prev => ({ ...prev, isPhoneVerified: true }));
      
      if (isLogin) {
        // For login, attempt to sign in with the credentials
        const response = await authService.login(formData.phoneNumber, formData.password);
        
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          onClose();
          window.location.reload(); // Refresh to update auth state
        }
      } else {
        // For signup, move to details step
        setStep('details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    
    try {
      if (!isLogin && !formData.isPhoneVerified) {
        setErrors({ form: 'Phone number must be verified before creating account' });
        return;
      }

      if (isLogin) {
        const response = await authService.login(formData.phoneNumber, formData.password);
        
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          onClose();
          window.location.reload();
        }
      } else {
        try {
          const response = await fetch('https://waytopg-backend.onrender.com/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.name,
              phoneNumber: formData.phoneNumber,
              email: formData.email || undefined,
              password: formData.password,
              role: formData.role,
              isPhoneVerified: formData.isPhoneVerified,
              isEmailVerified: false,
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
          
          localStorage.setItem('token', data.token);
          localStorage.setItem('userRole', data.role);
          
          onClose();

          // Navigate based on role
          switch (data.role) {
            case 'student':
              window.location.href = '/accommodations';
              break;
            case 'owner':
              window.location.href = '/owner-dashboard';
              break;
            case 'admin':
              window.location.href = '/admin-dashboard';
              break;
            default:
              window.location.href = '/';
          }
        } catch (error) {
          console.error('Signup error:', error);
          setErrors({ form: error instanceof Error ? error.message : 'An error occurred during signup' });
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrors({ form: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/30 to-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/95 w-full max-w-5xl rounded-2xl shadow-2xl ring-1 ring-black/5 backdrop-blur-sm transform transition-all duration-500 scale-100 flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        {/* Left Column - Features and Stats */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-500 p-6 lg:p-8 relative overflow-y-auto max-h-[90vh]">
          <div className="relative z-10 flex flex-col min-h-full text-white">
            {/* Brand Section */}
            <div className="flex-shrink-0 mb-8 md:mb-12">
              <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm backdrop-blur-sm mb-4 md:mb-6">
                <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="font-medium">Live Accommodation Updates</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 md:mb-4 leading-tight">
                Your Perfect PG <br />
                <span className="text-sky-200">Awaits You</span>
              </h2>
              <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-md">
                Find your ideal accommodation with verified PGs and hassle-free booking
              </p>
            </div>
            
            {/* Feature Cards */}
            <div className="flex-shrink-0 space-y-4 md:space-y-6">
              <div className="group flex items-center space-x-3 md:space-x-4 bg-white/10 p-3 md:p-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                <div className="flex-shrink-0 p-2 md:p-3 bg-white/20 rounded-xl">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-semibold text-white group-hover:text-sky-200 transition-colors">Prime Locations</h3>
                  <p className="text-xs md:text-sm text-white/75">Strategically located near colleges</p>
                </div>
              </div>

              <div className="group flex items-center space-x-3 md:space-x-4 bg-white/10 p-3 md:p-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                <div className="flex-shrink-0 p-2 md:p-3 bg-white/20 rounded-xl">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-semibold text-white group-hover:text-sky-200 transition-colors">Verified & Safe</h3>
                  <p className="text-xs md:text-sm text-white/75">Every PG is personally verified</p>
                </div>
              </div>

              <div className="group flex items-center space-x-3 md:space-x-4 bg-white/10 p-3 md:p-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                <div className="flex-shrink-0 p-2 md:p-3 bg-white/20 rounded-xl">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-semibold text-white group-hover:text-sky-200 transition-colors">Quick Process</h3>
                  <p className="text-xs md:text-sm text-white/75">Book your PG in minutes</p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="flex-shrink-0 mt-8 md:mt-12 grid grid-cols-2 gap-4 md:gap-6 mb-6">
              <div className="bg-white/10 rounded-xl p-3 md:p-4 backdrop-blur-sm">
                <p className="text-2xl md:text-3xl font-bold text-white">1000+</p>
                <p className="text-xs md:text-sm font-medium text-white/75">Verified PGs</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 md:p-4 backdrop-blur-sm">
                <p className="text-2xl md:text-3xl font-bold text-white">5000+</p>
                <p className="text-xs md:text-sm font-medium text-white/75">Happy Students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Auth Form */}
        <div className="w-full md:w-1/2 p-6 lg:p-8 relative overflow-y-auto max-h-[90vh]">
          {/* Close Button */}
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={onClose}
              className="group bg-white/90 hover:bg-gray-50 p-2 rounded-full text-gray-500 hover:text-gray-700 shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:scale-110"
              aria-label="Close"
            >
              <X className="h-5 w-5 transform group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          <div id="recaptcha-container"></div>

          <div className="text-center mb-6 lg:mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-sky-500 mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to access your account' : 'Register to get started'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {step === 'phone' && (
            <>              {isLogin ? (
                // Direct login form with phone and password
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInput}
                      pattern="[0-9]{10}"
                      placeholder="1234567890"
                      maxLength={10}
                      minLength={10}
                      required
                      className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInput}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-md hover:from-indigo-600 hover:to-blue-600 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              ) : (
                // Signup form with phone verification
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInput}
                      pattern="[0-9]{10}"
                      placeholder="1234567890"
                      maxLength={10}
                      minLength={10}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-md hover:from-indigo-600 hover:to-blue-600 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        <span>Sending OTP...</span>
                      </div>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </form>
              )}
            </>
          )}          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInput}
                  pattern="[0-9]{6}"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  minLength={6}
                  required
                  className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500 ${errors.form ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.form && (
                  <p className="mt-1 text-sm text-red-500">{errors.form}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-md hover:from-indigo-600 hover:to-blue-600 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </form>
          )}

          {step === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInput}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInput}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">I am a</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInput}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="student">Student</option>
                  <option value="owner">Accommodation Owner</option>
                </select>
              </div>

              {formData.role === 'owner' && (
                <>
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInput}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="businessRegistration" className="block text-sm font-medium text-gray-700">Business Registration Number</label>
                    <input
                      type="text"
                      id="businessRegistration"
                      name="businessRegistration"
                      value={formData.businessRegistration}
                      onChange={handleInput}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInput}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInput}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-md hover:from-indigo-600 hover:to-blue-600 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          )}

          {/* Toggle between login and signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setStep('phone');
                setError('');
                setFormData({
                  phoneNumber: '',
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  role: 'student',
                  companyName: '',
                  businessRegistration: '',
                  adminCode: '',
                  otp: '',
                  isPhoneVerified: false,
                  isEmailVerified: false
                });
              }}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;

