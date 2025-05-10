import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, BookOpen, Plus, RefreshCw } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import type { User, DashboardStats } from '@/types';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingApprovals: 0,
    totalAccommodations: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'users' | 'analytics' | 'accommodations'>('users');
  const [filterRole, setFilterRole] = useState<'all' | 'owner' | 'student'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [accommodations, setAccommodations] = useState<Array<{
    _id: string;
    name: string;
    address: string;
    price: number;
    type: string;
    owner: { name: string; email: string };
  }>>([]);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDashboardData(), fetchAccommodations()]);
    setIsRefreshing(false);
  };

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch('https://waytopg-dev.onrender.com/api/admin/accommodations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch accommodations');
      }

      const data = await response.json();
      
      if (!data.accommodations || !Array.isArray(data.accommodations)) {
        throw new Error('Invalid accommodation data received');
      }
      
      setAccommodations(data.accommodations);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load accommodations');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccommodation = async (accommodationId: string) => {
    if (!window.confirm('Are you sure you want to delete this accommodation?')) return;
    
    try {
      setDeletingIds(prev => new Set(prev).add(accommodationId));
      const token = localStorage.getItem('token');
      const response = await fetch(`https://waytopg-dev.onrender.com/api/admin/accommodations/${accommodationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setAccommodations(prev => prev.filter(acc => acc._id !== accommodationId));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete accommodation');
      }
    } catch (error) {
      console.error('Error deleting accommodation:', error);
      setError('An error occurred while deleting the accommodation');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(accommodationId);
        return newSet;
      });
    }
  };

  const handleEditAccommodation = (_id: string) => {
    window.location.href = `/edit-accommodation/${_id}`;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      if (userRole !== 'admin') {
        setError('Unauthorized access. Please login as admin.');
        return;
      }
      
      // Fetch users and stats in parallel
      const [usersResponse, statsResponse] = await Promise.all([
        fetch('https://waytopg-dev.onrender.com/api/admin/users', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('https://waytopg-dev.onrender.com/api/admin/stats', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Handle response errors
      if (!usersResponse.ok || !statsResponse.ok) {
        const status = usersResponse.status || statsResponse.status;
        switch (status) {
          case 401:
            setError('Your session has expired. Please login again.');
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            return;
          case 403:
            setError('You do not have permission to access this data. Please login as admin.');
            return;
          case 404:
            setError('Required data not found. Please try again later.');
            return;
          case 500:
            setError('Server error. Please try again later.');
            return;
          default:
            setError('Failed to fetch dashboard data. Please try again.');
            return;
        }
      }

      // Parse response data
      try {
        const [usersData, statsData] = await Promise.all([
          usersResponse.json(),
          statsResponse.json()
        ]);
        
        if (!Array.isArray(usersData.users)) {
          throw new Error('Invalid users data received');
        }

        setUsers(usersData.users);
        setStats({
          totalUsers: statsData.totalUsers || 0,
          pendingApprovals: statsData.pendingApprovals || 0,
          totalAccommodations: statsData.totalAccommodations || 0,
          totalBookings: statsData.totalBookings || 0
        });
      } catch (error) {
        console.error('Error parsing response:', error);
        setError('Error processing server response. Please try again.');
        return;
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOwner = async (userId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://waytopg-dev.onrender.com/api/admin/approve-owner/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Update the user's status in the local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, isApproved: true } : user
          )
        );
        setStats(prev => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1
        }));
      } else {
        throw new Error('Failed to approve owner');
      }
    } catch (error) {
      console.error('Error approving owner:', error);
      setError('Failed to approve owner');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://waytopg-dev.onrender.com/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        setStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers - 1
        }));
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    if (selectedTab === 'accommodations') {
      fetchAccommodations();
    }
  }, [selectedTab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
          <button
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all ${
              loading || isRefreshing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard Overview</h3>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h4 className="text-gray-500 text-sm">Total Users</h4>
            </div>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-orange-500" />
              <h4 className="text-gray-500 text-sm">Pending Approvals</h4>
            </div>
            <p className="text-2xl font-bold text-orange-500">{stats.pendingApprovals}</p>
          </div>
          <div 
            className="bg-white p-6 rounded-xl shadow-md cursor-pointer transition-all hover:shadow-lg"
            onClick={() => {
              setSelectedTab('accommodations');
              fetchAccommodations();
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Home className="w-5 h-5 text-green-600" />
              <h4 className="text-gray-500 text-sm">Total Accommodations</h4>
            </div>
            <p className="text-2xl font-bold">{stats.totalAccommodations}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h4 className="text-gray-500 text-sm">Total Bookings</h4>
            </div>
            <p className="text-2xl font-bold">{stats.totalBookings}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setSelectedTab('users')}
            className={`px-4 py-2 rounded-md ${
              selectedTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setSelectedTab('accommodations')}
            className={`px-4 py-2 rounded-md ${
              selectedTab === 'accommodations'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Accommodations
          </button>
          <button
            onClick={() => setSelectedTab('analytics')}
            className={`px-4 py-2 rounded-md ${
              selectedTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Analytics
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : selectedTab === 'accommodations' ? (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Accommodation Management</h3>
              <div className="flex gap-4">
                <Link to="/add-accommodation">
                  <Button
                    variant="primary"
                    size="small"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Accommodation
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => fetchAccommodations()}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>

            {error ? (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading accommodations</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading accommodations...</p>
              </div>
            ) : accommodations.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Home className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No accommodations found</h3>
                <p className="text-gray-500">There are no accommodations in the system yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {accommodations.map((accommodation) => (
                      <tr key={accommodation._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{accommodation.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{accommodation.address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {accommodation.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${accommodation.price.toLocaleString()}<span className="text-gray-500 text-xs">/month</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{accommodation.owner.name}</div>
                            <div className="text-sm text-gray-500">{accommodation.owner.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handleEditAccommodation(accommodation._id)}
                            className="inline-flex items-center px-3 py-1.5 text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleDeleteAccommodation(accommodation._id)}
                            className="inline-flex items-center px-3 py-1.5 text-xs"
                            disabled={deletingIds.has(accommodation._id)}
                          >
                            {deletingIds.has(accommodation._id) ? 'Deleting...' : 'Delete'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : selectedTab === 'users' ? (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">User Management</h3>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as 'all' | 'owner' | 'student')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Users</option>
                <option value="owner">Owners</option>
                <option value="student">Students</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-left">Role</th>
                    <th className="py-2 px-4 text-left">Status</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b">
                      <td className="py-2 px-4">{user.name}</td>
                      <td className="py-2 px-4">{user.email}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'owner' ? 'bg-purple-100 text-purple-700' : 
                          user.role === 'admin' ? 'bg-red-100 text-red-700' : 
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        {user.role === 'owner' && (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.isApproved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {user.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 space-x-2">
                        {user.role === 'owner' && !user.isApproved && (
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handleApproveOwner(user._id)}
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Analytics Dashboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add charts and analytics components here */}
              <div className="border rounded-lg p-4">
                <h4 className="text-lg font-medium mb-2">User Growth</h4>
                <p className="text-gray-500">Chart coming soon...</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="text-lg font-medium mb-2">Booking Statistics</h4>
                <p className="text-gray-500">Chart coming soon...</p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;