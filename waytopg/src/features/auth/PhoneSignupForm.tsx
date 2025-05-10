import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/Button';
import { Loader } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface PhoneSignupFormProps {
  onVerificationComplete: (phoneNumber: string, isVerified: boolean) => void;
}

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const PhoneSignupForm: React.FC<PhoneSignupFormProps> = ({ onVerificationComplete }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<import('firebase/auth').ConfirmationResult | null>(null);

  useEffect(() => {
    // Clean up any existing reCAPTCHA
    if (verifierRef.current) {
      verifierRef.current.clear();
      verifierRef.current = null;
    }

    // Initialize reCAPTCHA verifier
    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          console.log('reCAPTCHA solved, enabling send OTP button');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          setError('reCAPTCHA expired. Please solve it again.');
          if (verifierRef.current) {
            verifierRef.current.clear();
            verifierRef.current = null;
          }
        }
      });

      verifierRef.current = verifier;
      verifier.render(); // Explicitly render the reCAPTCHA
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
      setError('Error initializing reCAPTCHA. Please refresh the page.');
    }

    return () => {
      if (verifierRef.current) {
        verifierRef.current.clear();
        verifierRef.current = null;
      }
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifierRef.current) {
      setError('Please wait for reCAPTCHA to load or refresh the page');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Format phone number to E.164 format
      let formattedPhoneNumber = phoneNumber.trim();
      if (!formattedPhoneNumber.startsWith('+')) {
        formattedPhoneNumber = '+91' + formattedPhoneNumber.replace(/^0/, '');
      }
      
      console.log('Sending OTP to:', formattedPhoneNumber);

      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, verifierRef.current);
      setConfirmationResult(confirmation);
      setStep('otp');
      console.log('OTP sent successfully');
    } catch (error) {
      console.error('Error sending OTP:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
      
      // Reinitialize reCAPTCHA on error
      if (verifierRef.current) {
        verifierRef.current.clear();
        verifierRef.current = null;
      }
      
      try {
        const newVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'normal',
          'callback': () => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please try again.');
          }
        });
        verifierRef.current = newVerifier;
        newVerifier.render();
      } catch (recaptchaError) {
        console.error('Error reinitializing reCAPTCHA:', recaptchaError);
        setError('Error reinitializing reCAPTCHA. Please refresh the page.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      setError('Please request OTP first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const credential = await confirmationResult.confirm(otp);
      if (credential.user) {
        onVerificationComplete(phoneNumber, true);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Invalid OTP. Please try again.');
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
              pattern="^\+?[\d\s-]{10,}$"
              placeholder="+91 1234567890"
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
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              size="large"
              onClick={() => setStep('phone')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="large"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="animate-spin h-5 w-5 mx-auto" />
              ) : (
                'Verify OTP'
              )}
            </Button>
          </div>
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isLoading}
            className="w-full text-sm text-blue-600 hover:text-blue-500 mt-2 disabled:text-gray-400 disabled:hover:text-gray-400"
          >
            Didn't receive OTP? Resend
          </button>
        </form>
      )}
      <div id="recaptcha-container" className="mt-4"></div>
    </div>
  );
};

export default PhoneSignupForm;
