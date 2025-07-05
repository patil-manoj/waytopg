import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Navbar from '@/components/navbar';
import { Loader } from 'lucide-react';
import api from '@/utils/api/axios';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { authService } from '@/services/auth.service';

const LoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'phone' | 'otp' | 'newPassword'>('phone');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { phoneNumber, password });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      
      // Redirect based on role
      switch (data.role) {
        case 'student':
          navigate('/');
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
      console.error('Login error:', error);
      setError('Invalid credentials or an error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }

      const formattedPhoneNumber = '+91' + phoneNumber.trim().replace(/\D/g, '');
      
      if (phoneNumber.trim().replace(/\D/g, '').length !== 10) {
        throw new Error('Phone number must be exactly 10 digits');
      }

      // Check if phone number exists in our system using the auth service
      const checkResult = await authService.checkPhoneExists(formattedPhoneNumber);
      if (!checkResult.exists) {
        throw new Error('No account found with this phone number');
      }

      setupRecaptcha();
      
      const confirmation = await signInWithPhoneNumber(
        auth, 
        formattedPhoneNumber,
        window.recaptchaVerifier
      );
      
      setConfirmationResult(confirmation);
      setResetStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!confirmationResult) {
        throw new Error('Please request OTP first');
      }

      const credential = await confirmationResult.confirm(otp);
      if (credential.user) {
        setResetStep('newPassword');
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(error instanceof Error ? error.message : 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const formattedPhoneNumber = '+91' + phoneNumber.trim().replace(/\D/g, '');
      await api.post('/auth/reset-password', {
        phoneNumber: formattedPhoneNumber,
        newPassword
      });

      setShowForgotPassword(false);
      setError('');
      alert('Password reset successful. Please login with your new password.');
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Reset Password</h2>
            <div id="recaptcha-container"></div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {resetStep === 'phone' && (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder="1234567890"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                              focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <Button type="submit" variant="primary" size="large" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : 'Send OTP'}
                </Button>
              </form>
            )}

            {resetStep === 'otp' && (
              <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                              focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <Button type="submit" variant="primary" size="large" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : 'Verify OTP'}
                </Button>
              </form>
            )}

            {resetStep === 'newPassword' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                              focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                              focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <Button type="submit" variant="primary" size="large" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : 'Reset Password'}
                </Button>
              </form>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetStep('phone');
                  setError('');
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Back to Login
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login to Way2pg</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                pattern="^\+?[\d\s-]{10,}$"
                placeholder="+91 1234567890"
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            {/* <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">I am a:</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm
                          focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              >
                <option value="student">Student</option>
                <option value="owner">Accommodation Owner</option>
                <option value="admin">Administrator</option>
              </select>
            </div> */}
            <Button type="submit" variant="primary" size="large" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-800">Sign up</Link>
            </p>
            <button
              onClick={() => setShowForgotPassword(true)}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
