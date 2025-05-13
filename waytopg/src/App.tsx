// External imports
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from "@/components/ScrollToTop";

// Page components
import HomePage from "@/components/home";
const LoginPage = lazy(() => import("@/features/auth/login"));
const SignupPage = lazy(() => import("@/features/auth/signup"));
const AdminLoginPage = lazy(() => import("@/features/admin/adminloginpage"));
const OwnerLoginPage = lazy(() => import("@/features/owner/ownerloginpage"));
const AdminDashboard = lazy(() => import("@/features/admin/admindashboard"));
const OwnerDashboard = lazy(() => import("@/features/owner/ownerdashboard"));
const UserDashboard = lazy(() => import("@/features/user/userdashboard"));

// Feature components
const AccommodationListPage = lazy(() => import("@/features/accommodation/accommodationlistpage"));
const AccommodationDetailPage = lazy(() => import("@/features/accommodation/accommodationdetailpage"));
const AddAccommodationPage = lazy(() => import("@/features/accommodation/addaccommodation"));
const EditAccommodationPage = lazy(() => import("@/features/accommodation/editaccommodation"));
const OwnerBookings = lazy(() => import("@/features/owner/ownerbookings"));

// Other components
const AboutPage = lazy(() => import("@/components/about"));
const ProtectedRoute = lazy(() => import("@/components/ProtectedRoute"));
const NotFoundPage = lazy(() => import("@/components/NotFound"));

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* All other routes with Suspense */}
          <Route
            path="/*"
            element={
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-lg font-semibold text-gray-700">Loading...</p>
                  </div>
                </div>
              }>
                <Routes>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />
                  <Route path="admin-login" element={<AdminLoginPage />} />
                  <Route path="owner-login" element={<OwnerLoginPage />} />
                  <Route
                    path="add-accommodation"
                    element={
                      <ProtectedRoute allowedRoles={["owner","admin"]}>
                        <AddAccommodationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="owner-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["owner"]}>
                        <OwnerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="student-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["student"]}>
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="accommodations" element={<AccommodationListPage />} />
                  <Route
                    path="accommodation/:id"
                    element={
                      <ProtectedRoute allowedRoles={["student", "owner", "admin"]}>
                        <AccommodationDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="ownerbookings"
                    element={
                      <ProtectedRoute allowedRoles={["owner"]}>
                        <OwnerBookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="about" element={<AboutPage />} />
                  <Route
                    path="edit-accommodation/:id"
                    element={
                      <ProtectedRoute allowedRoles={["owner","admin"]}>
                        <EditAccommodationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="owner/bookings"
                    element={
                      <ProtectedRoute allowedRoles={["owner"]}>
                        <OwnerBookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            }
          />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
