import React, { useState } from 'react';
import Button from '@/components/Button';
import { Loader } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInWithPhoneNumber } from 'firebase/auth';

interface PhoneSignupFormProps {
  onVerificationComplete: (phoneNumber: string, isVerified: boolean) => void;
}

const PhoneSignupForm: React.FC<PhoneSignupFormProps> = ({ onVerificationComplete }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<import('firebase/auth').ConfirmationResult | null>(null);

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

      // Send OTP via Firebase
      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber);
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
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
      if (!confirmationResult) {
        throw new Error('No verification code was sent');
      }

      // Verify OTP
      await confirmationResult.confirm(otp);
      
      // Successfully verified
      onVerificationComplete(phoneNumber, true);
    } catch (error) {
      console.error('Error verifying OTP:', error);
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
