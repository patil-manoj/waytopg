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
      // Format phone number to E.164 format
      let formattedPhoneNumber = phoneNumber.trim();
      if (!formattedPhoneNumber.startsWith('+')) {
        formattedPhoneNumber = '+91' + formattedPhoneNumber.replace(/^0/, '');
      }
      
      // Send OTP via backend API
      const response = await fetch('https://waytopg-backend.onrender.com/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhoneNumber })
      });

      const data = await response.json();
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
      const response = await fetch('https://waytopg-backend.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          otp
        })
      });
      
      const data = await response.json();
      if (response.ok && data.verified) {
        if (isLogin) {
          // If logging in, submit the form
          handleSubmit(e);
        } else {
          // If signing up, move to details form
          setStep('details');
        }
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Invalid OTP. Please try again.');
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
      const body = isLogin 
        ? { phoneNumber, password }
        : { name, phoneNumber, email, password, role: 'student' };

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
        window.location.reload(); // Reload to update auth state
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch {
      setError('An error occurred. Please try again.');
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
              {isLogin ? 'Welcome back!' : 'Join WayToPG'}
            </h2>
            <p className="text-gray-600">
              {step === 'phone'
                ? 'Enter your phone number to continue'
                : step === 'otp'
                ? 'Enter the verification code'
                : isLogin
                ? 'Sign in to find your perfect PG accommodation'
                : 'Create an account to start your PG journey'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="group">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    pattern="^\+?[\d\s-]{10,}$"
                    placeholder="+91 1234567890"
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                            transition-all duration-200 ease-in-out
                            placeholder:text-gray-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                className="w-full bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Sending OTP...
                  </div>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="group">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    pattern="[0-9]{6}"
                    placeholder="Enter 6-digit code"
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                            transition-all duration-200 ease-in-out
                            placeholder:text-gray-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                className="w-full bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Verifying...
                  </div>
                ) : (
                  'Verify Code'
                )}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Try again
                </button>
              </p>
            </form>
          )}

          {step === 'details' && !isLogin && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                            transition-all duration-200 ease-in-out
                            placeholder:text-gray-400"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                            transition-all duration-200 ease-in-out
                            placeholder:text-gray-400"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                            transition-all duration-200 ease-in-out
                            placeholder:text-gray-400"
                    placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                className="w-full bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Please wait...
                  </div>
                ) : (
                  isLogin ? 'Sign in' : 'Create account'
                )}
              </Button>
            </form>
          )}

          {step === 'details' && isLogin && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                            transition-all duration-200 ease-in-out
                            placeholder:text-gray-400"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                className="w-full bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Please wait...
                  </div>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setError('');
                setIsLogin(!isLogin);
                setStep('phone');
              }}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;
