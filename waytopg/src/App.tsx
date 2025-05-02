import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
// const HomePage = lazy(() => import("./components/home"));
import HomePage from "./components/home";
const LoginPage = lazy(() => import("./components/login"));
const SignupPage = lazy(() => import("./components/signup"));
const AdminLoginPage = lazy(() => import("./components/adminloginpage"));
const OwnerLoginPage = lazy(() => import("./components/ownerloginpage"));
const AdminDashboard = lazy(() => import("./components/admindashboard"));
const OwnerDashboard = lazy(() => import("./components/ownerdashboard"));
const UserDashboard = lazy(() => import("./components/userdashboard"));
const AccommodationListPage = lazy(() => import("./components/accommodationlistpage"));
const AccommodationDetailPage = lazy(() => import("./components/accommodationdetailpage"));
const AboutPage = lazy(() => import("./components/about"));
const AddAccommodationPage = lazy(() => import("./components/addaccommodation"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const EditAccommodationPage = lazy(() => import("./components/editaccommodation"));
const NotFoundPage = lazy(() => import("./components/NotFound"));

function App() {
  return (
    <>
      <Router>
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
                  <Route path="accommodation/:id" element={<AccommodationDetailPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route
                    path="edit-accommodation/:id"
                    element={
                      <ProtectedRoute allowedRoles={["owner","admin"]}>
                        <EditAccommodationPage />
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
    </>
  );
}

export default App;
