import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  console.log('ProtectedRoute Check:', {
    token: token ? 'exists' : 'missing',
    userRole,
    allowedRoles,
    hasAccess: allowedRoles.includes(userRole || '')
  });

  if (!token) {
    console.log('Redirecting to login: No token found');
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole || '')) {
    console.log('Redirecting to home: Role not allowed');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;