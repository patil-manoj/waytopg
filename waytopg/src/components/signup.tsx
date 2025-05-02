import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Navbar from './navbar';
import { AlertCircle, Loader } from 'lucide-react';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    companyName: '',
    businessRegistration: '',
    adminCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (formData.role === 'owner') {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.businessRegistration.trim()) newErrors.businessRegistration = 'Business registration number is required';
    }
    if (formData.role === 'admin' && !formData.adminCode.trim()) newErrors.adminCode = 'Admin code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch('https://waytopg-backend.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
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
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Sign up for Way2pg</h2>
          {errors.form && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center" role="alert">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{errors.form}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:ring-1 focus:ring-purple-500 ${errors.name ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && <p id="name-error" className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:ring-1 focus:ring-purple-500 ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <p id="email-error" className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:ring-1 focus:ring-purple-500 ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && <p id="password-error" className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:ring-1 focus:ring-purple-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              />
              {errors.confirmPassword && <p id="confirmPassword-error" className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">I am a:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm
                          focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="student">Student</option>
                <option value="owner">Accommodation Owner</option>
                <option value="admin">Administrator</option>
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
                    onChange={handleChange}
                    required
                    className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
                              focus:outline-none focus:ring-1 focus:ring-purple-500 ${errors.companyName ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    aria-invalid={errors.companyName ? 'true' : 'false'}
                    aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                  />
                  {errors.companyName && <p id="companyName-error" className="mt-1 text-xs text-red-500">{errors.companyName}</p>}
                </div>
                <div>
                  <label htmlFor="businessRegistration" className="block text-sm font-medium text-gray-700">Business Registration Number</label>
                  <input
                    type="text"
                    id="businessRegistration"
                    name="businessRegistration"
                    value={formData.businessRegistration}
                    onChange={handleChange}
                    required
                    className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
                              focus:outline-none focus:ring-1 focus:ring-purple-500 ${errors.businessRegistration ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    aria-invalid={errors.businessRegistration ? 'true' : 'false'}
                    aria-describedby={errors.businessRegistration ? 'businessRegistration-error' : undefined}
                  />
                  {errors.businessRegistration && <p id="businessRegistration-error" className="mt-1 text-xs text-red-500">{errors.businessRegistration}</p>}
                </div>
              </>
            )}
            {formData.role === 'admin' && (
              <div>
                <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700">Admin Access Code</label>
                <input
                  type="text"
                  id="adminCode"
                  name="adminCode"
                  value={formData.adminCode}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
                            focus:outline-none focus:ring-1 focus:ring-purple-500 ${errors.adminCode ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                  aria-invalid={errors.adminCode ? 'true' : 'false'}
                  aria-describedby={errors.adminCode ? 'adminCode-error' : undefined}
                />
                {errors.adminCode && <p id="adminCode-error" className="mt-1 text-xs text-red-500">{errors.adminCode}</p>}
              </div>
            )}
            <Button type="submit" variant="primary" size="large" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Signing Up...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
              Log in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignupPage;