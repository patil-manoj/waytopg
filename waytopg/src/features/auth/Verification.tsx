import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Loader } from 'lucide-react';
import { API_URL } from '@/constants';

interface VerificationFormProps {
  onClose: () => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const handleSendEmailCode = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/auth/send-email-verification`, {

        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setEmailSent(true);
        alert('Verification code sent to your email!'); // In production, remove the code from the alert
      } else {
        setError(data.message || 'Failed to send email verification code');
      }
    } catch (error: unknown) {
      console.error('Error sending email verification:', error);
      setError('An error occurred while sending email verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPhoneCode = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/auth/send-phone-verification`, {

        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setPhoneSent(true);
        alert('Verification code sent to your phone!'); // In production, remove the code from the alert
      } else {
        setError(data.message || 'Failed to send phone verification code');
      }
    } catch (error: unknown) {
      console.error('Error sending phone verification:', error);
      setError('An error occurred while sending phone verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/auth/verify-email`, {

        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: emailCode })
      });
      
      const data = await response.json();
      if (response.ok) {
        setEmailVerified(true);
        alert('Email verified successfully!');
      } else {
        setError(data.message || 'Failed to verify email');
      }
    } catch (error: unknown) {
      console.error('Error verifying email:', error);
      setError('An error occurred while verifying email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/auth/verify-phone`, {

        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: phoneCode })
      });
      
      const data = await response.json();
      if (response.ok) {
        setPhoneVerified(true);
        alert('Phone number verified successfully!');
      } else {
        setError(data.message || 'Failed to verify phone number');
      }
    } catch (error: unknown) {
      console.error('Error verifying phone number:', error);
      setError('An error occurred while verifying phone number');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Verify Contact Information</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Email Verification */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Email Verification</h3>
            {!emailVerified ? (
              <>
                {!emailSent ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSendEmailCode}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? <Loader className="animate-spin h-5 w-5" /> : 'Send Email Code'}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value)}
                      placeholder="Enter email verification code"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleVerifyEmail}
                      disabled={isLoading || !emailCode}
                      className="w-full"
                    >
                      {isLoading ? <Loader className="animate-spin h-5 w-5" /> : 'Verify Email'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-green-600">Email verified successfully!</div>
            )}
          </div>

          {/* Phone Verification */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Phone Verification</h3>
            {!phoneVerified ? (
              <>
                {!phoneSent ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSendPhoneCode}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? <Loader className="animate-spin h-5 w-5" /> : 'Send Phone Code'}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      placeholder="Enter phone verification code"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleVerifyPhone}
                      disabled={isLoading || !phoneCode}
                      className="w-full"
                    >
                      {isLoading ? <Loader className="animate-spin h-5 w-5" /> : 'Verify Phone'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-green-600">Phone number verified successfully!</div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;

