import React, { useEffect, useState } from 'react';
import { RefreshCw, Users, Home, BookOpen } from 'lucide-react';
import Footer from './Footer';
import Button from './Button';
import Navbar from './navbar';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  companyName?: string;
  businessRegistration?: string;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  pendingApprovals: number;
  totalAccommodations: number;
  totalBookings: number;
}

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDashboardData(), fetchAccommodations()]);
    setIsRefreshing(false);
  };

  const fetchAccommodations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://waytopg-dev.onrender.com/api/admin/accommodations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch accommodations');
      }

      const data = await response.json();
      setAccommodations(data.accommodations || []);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      setError('Failed to load accommodations');
    }
  };

  const handleDeleteAccommodation = async (accommodationId: string) => {
    if (!window.confirm('Are you sure you want to delete this accommodation?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://waytopg-dev.onrender.com/api/admin/accommodations/${accommodationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setAccommodations(prevAccommodations => 
          prevAccommodations.filter(acc => acc._id !== accommodationId)
        );
        setStats(prev => ({
          ...prev,
          totalAccommodations: prev.totalAccommodations - 1
        }));
      } else {
        throw new Error('Failed to delete accommodation');
      }
    } catch (error) {
      console.error('Error deleting accommodation:', error);
      setError('Failed to delete accommodation');
    } finally {
      setLoading(false);
    }
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
          <Button
            variant="secondary"
            size="small"
            onClick={() => fetchDashboardData()}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Dashboard'}
          </Button>
        </div>
        
        {/* Header with Refresh */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Accommodation Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-left">Address</th>
                    <th className="py-2 px-4 text-left">Type</th>
                    <th className="py-2 px-4 text-left">Price</th>
                    <th className="py-2 px-4 text-left">Owner</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accommodations.map((accommodation) => (
                    <tr key={accommodation._id} className="border-b">
                      <td className="py-2 px-4">{accommodation.name}</td>
                      <td className="py-2 px-4">{accommodation.address}</td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          {accommodation.type}
                        </span>
                      </td>
                      <td className="py-2 px-4">${accommodation.price}/month</td>
                      <td className="py-2 px-4">
                        <div>
                          <div className="font-medium">{accommodation.owner.name}</div>
                          <div className="text-sm text-gray-500">{accommodation.owner.email}</div>
                        </div>
                      </td>
                      <td className="py-2 px-4 space-x-2">
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => {
                            window.location.href = `/accommodation/${accommodation._id}/edit`;
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleDeleteAccommodation(accommodation._id)}
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