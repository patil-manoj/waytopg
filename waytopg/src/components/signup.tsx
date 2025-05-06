import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { Button } from './ui/Button';

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
    role: 'student'
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
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
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

    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          companyName: formData.role === 'owner' ? formData.companyName : undefined,
          businessRegistration: formData.role === 'owner' ? formData.businessRegistration : undefined,
          adminCode: formData.role === 'admin' ? formData.adminCode : undefined,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        navigate(data.role === 'student' ? '/accommodations' : data.role === 'owner' ? '/owner-dashboard' : '/admin-dashboard');
      } else {
        setErrors({ form: data.message });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ form: 'An error occurred during signup' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneVerified = (verifiedNumber: string) => {
    setFormData(prev => ({ ...prev, phoneNumber: verifiedNumber }));
    setStep('details');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Sign Up</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          {step === 'phone' ? (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">Verify Your Phone Number</h2>
                <p className="mt-2 text-sm text-gray-600">
                  We'll send you a verification code to confirm your number
                </p>
              </div>
              <div className="mt-4">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
                <Button
                  type="button"
                  variant="primary"
                  className="w-full mt-4"
                  onClick={() => handlePhoneVerified(formData.phoneNumber)}
                >
                  Verify Phone Number
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.form && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {errors.form}
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
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
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
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
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
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
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
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.companyName ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.businessRegistration ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.adminCode ? 'border-red-500' : 'border-gray-300'
                    }`}
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
                className="w-full"
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

              <div className="text-sm text-center">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}