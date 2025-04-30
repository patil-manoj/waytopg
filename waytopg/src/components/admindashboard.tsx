import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import Header from '../components/Header';
import Footer from './Footer';
import Button from './Button';
import Navbar from './navbar';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://waytopg-backend.onrender.com/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Admin Dashboard</h2>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4">User Management</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">Role</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-2 px-4">{user.name}</td>
                    <td className="py-2 px-4">{user.email}</td>
                    <td className="py-2 px-4">{user.role}</td>
                    <td className="py-2 px-4">
                      <Button variant="secondary" size="small">Edit</Button>
                      <Button variant="secondary" size="small" className="ml-2">Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/admin/reports" className="text-green-600 hover:text-green-700 font-medium">
            View Reports
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;