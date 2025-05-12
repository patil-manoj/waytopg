import React, { useState } from 'react';
import Button from '@/components/Button';
import { Loader } from 'lucide-react';

interface PhoneSignupFormProps {
  onVerificationComplete: (phoneNumber: string, isVerified: boolean) => void;
}

const PhoneSignupForm: React.FC<PhoneSignupFormProps> = ({ onVerificationComplete }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Starting OTP send process...');
      const formattedPhoneNumber = phoneNumber.trim().replace(/\D/g, '');
      console.log('Formatted phone number:', formattedPhoneNumber);
      
      if (formattedPhoneNumber.length !== 10) {
        console.error('Phone number validation failed:', formattedPhoneNumber.length, 'digits');
        throw new Error('Phone number must be exactly 10 digits');
      }

      console.log('Sending OTP request to backend...');
      const response = await fetch('https://waytopg-dev.onrender.com/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhoneNumber })
      });

      console.log('Backend response status:', response.status);
      const data = await response.json();
      console.log('Backend response data:', data);

      if (!response.ok) {
        console.error('Backend error response:', data);
        throw new Error(data.message || 'Failed to send OTP');
      }

      console.log('OTP sent successfully, moving to verification step');
      setStep('otp');
    } catch (error) {
      console.error('Detailed error in OTP send:', {
        error,
        type: error instanceof Error ? 'Error instance' : typeof error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Starting OTP verification process...');
      const formattedPhoneNumber = phoneNumber.trim().replace(/\D/g, '');
      const trimmedOtp = otp.trim();
      console.log('Verification details:', {
        phoneNumber: formattedPhoneNumber,
        otpLength: trimmedOtp.length
      });

      console.log('Sending verification request to backend...');
      const response = await fetch('https://waytopg-dev.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formattedPhoneNumber,
          otp: trimmedOtp
        })
      });
      
      console.log('Verification response status:', response.status);
      const data = await response.json();
      console.log('Verification response data:', data);

      if (!response.ok) {
        console.error('Backend verification error:', data);
        throw new Error(data.message || 'Invalid OTP');
      }

      if (data.verified) {
        console.log('OTP verification successful');
        onVerificationComplete(formattedPhoneNumber, true);
      } else {
        console.error('Verification failed without error response');
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('Detailed error in OTP verification:', {
        error,
        type: error instanceof Error ? 'Error instance' : typeof error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              pattern="[0-9]{10}"
              maxLength={10}
              minLength={10}
              placeholder="1234567890"
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          <Button
            type="submit"
            variant="primary"
            size="large"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="animate-spin h-5 w-5 mx-auto" />
            ) : (
              'Send OTP'
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Enter OTP sent to {phoneNumber}
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              pattern="[0-9]{6}"
              placeholder="Enter 6-digit OTP"
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          <Button
            type="submit"
            variant="primary"
            size="large"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="animate-spin h-5 w-5 mx-auto" />
            ) : (
              'Verify OTP'
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

export default PhoneSignupForm;
