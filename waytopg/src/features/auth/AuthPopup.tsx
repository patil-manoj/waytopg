import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthPopup: React.FC<AuthPopupProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Ensure phone number is exactly 10 digits
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      if (cleanPhoneNumber.length !== 10) {
        throw new Error('Phone number must be exactly 10 digits');
      }

      // Send OTP via backend API
      const response = await fetch('https://waytopg-backend.onrender.com/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanPhoneNumber })
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error('Server returned invalid response');
      }

      if (response.ok) {
        setStep('otp');
      } else {
        throw new Error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(error instanceof Error ? error.message : 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      const response = await fetch('https://waytopg-backend.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanPhoneNumber,
          otp: otp.trim()
        })
      });
      
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error('Server returned invalid response');
      }

      if (response.ok && data.verified) {
        setStep('details');
      } else {
        throw new Error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(error instanceof Error ? error.message : 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? 'login' : 'signup';
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      const body = isLogin 
        ? { phoneNumber: cleanPhoneNumber, password }
        : { 
            name, 
            phoneNumber: cleanPhoneNumber, 
            email, 
            password,
            role: 'student',
            isPhoneVerified: true
          };

      const response = await fetch(`https://waytopg-backend.onrender.com/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        onClose();
        window.location.reload();
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/95 w-full max-w-5xl rounded-2xl shadow-2xl ring-1 ring-black/5 backdrop-blur-sm transform transition-all duration-500 scale-100 flex overflow-hidden">
        {/* Left Column */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-500 p-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full text-white">
            {/* Brand Section */}
            <div className="mb-12">
              <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-1.5 text-sm backdrop-blur-sm mb-6">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="font-medium">Live Accommodation Updates</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
                Your Perfect PG <br />
                <span className="text-sky-200">Awaits You</span>
              </h2>
              <p className="text-lg text-white/90 leading-relaxed max-w-md">
                Find your ideal accommodation with verified PGs and hassle-free booking
              </p>
            </div>
            
            {/* Feature Cards */}
            <div className="space-y-6">
              <div className="group flex items-center space-x-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                <div className="flex-shrink-0 p-3 bg-white/20 rounded-xl">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white group-hover:text-sky-200 transition-colors">Prime Locations</h3>
                  <p className="text-sm text-white/75">Strategically located near colleges</p>
                </div>
              </div>

              <div className="group flex items-center space-x-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                <div className="flex-shrink-0 p-3 bg-white/20 rounded-xl">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white group-hover:text-sky-200 transition-colors">Verified & Safe</h3>
                  <p className="text-sm text-white/75">Every PG is personally verified</p>
                </div>
              </div>

              <div className="group flex items-center space-x-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                <div className="flex-shrink-0 p-3 bg-white/20 rounded-xl">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white group-hover:text-sky-200 transition-colors">Quick Process</h3>
                  <p className="text-sm text-white/75">Book your PG in minutes</p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-auto pt-12 grid grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold text-white">1000+</p>
                <p className="text-sm font-medium text-white/75">Verified PGs</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold text-white">5000+</p>
                <p className="text-sm font-medium text-white/75">Happy Students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Auth Form */}
        <div className="w-full md:w-1/2 p-8">
          {/* Close Button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="group bg-white hover:bg-gray-50 p-2.5 rounded-full text-gray-500 hover:text-gray-700 shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:scale-110"
              aria-label="Close"
            >
              <X className="h-5 w-5 transform group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-full mb-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
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
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
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

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
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
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setStep('phone');
                setError('');
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
