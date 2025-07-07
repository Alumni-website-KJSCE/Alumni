import React from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import Home from "./Pages/Home/Home";
import Careers from "./Pages/Careers/career";
import PostJob from "./Pages/Careers/PostJob";
import Layout from "./components/Layout/Layout";
import Alumni from "./Pages/Alumni/Alumni";
import Newsletter from "./Pages/Newsletter/Newsletter";
import Events from "./Pages/Events/Events";
import AlumniVisits from "./Pages/AlumniVisits/AlumniVisits";
import Auth from "./Pages/Auth/Auth";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminLogin from "./Pages/Admin/AdminLogin";
import CreateEvent from "./Pages/Admin/CreateEvent";
import EditEvent from "./Pages/Admin/EditEvent";
import PendingApproval from "./Pages/PendingApproval/PendingApproval";
import Profile from "./Pages/Profile/Profile";
import PageTransition from "./components/PageTransition/PageTransition";
import CompleteProfile from "./Pages/CompleteProfile";
import AuthCallback from "./components/AuthCallback/AuthCallback";
import NotFound from "./Pages/NotFound/NotFound";
import "./styles/darkTheme.css";

// Protected route wrapper for admin routes
function AdminRoute({ children }) {
  const { user } = useAuth();

  if (user === null) {
    return <Navigate to="/kjsce-admin-login" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

// Protected route wrapper for user routes
function UserRoute({ children }) {
  const { user, hasCompletedProfile } = useAuth();
  const currentPath = window.location.pathname;

  // If no user, redirect to login
  if (user === null) {
    return <Navigate to="/auth" replace />;
  }

  // Admin users can access user routes too
  if (user.isAdmin) {
    return children;
  }

  // For non-admin users: require profile completion for protected routes
  if (!hasCompletedProfile && currentPath !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  // If profile is complete but user is not approved, show pending approval page
  if (
    hasCompletedProfile &&
    !user.isApproved &&
    currentPath !== "/pending-approval"
  ) {
    return <Navigate to="/pending-approval" replace />;
  }

  return children;
}

// Protected route wrapper for profile completion
function ProfileRoute({ children }) {
  const { user, hasCompletedProfile } = useAuth();

  if (user === null) {
    return <Navigate to="/auth" replace />;
  }

  // Admin users should not access complete-profile
  if (user.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // If profile is already complete, redirect to home
  if (hasCompletedProfile) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      {" "}
      <div className="App">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route element={<Layout />}>
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/kjsce-admin-login" element={<AdminLogin />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route
                path="/signup"
                element={<Navigate to="/auth?signup=true" replace />}
              />
              {/* Handle unauthorized route - redirect to appropriate login */}
              <Route path="/unauthorized" element={<Navigate to="/auth" replace />} />
              {/* Main routes */}
              <Route
                index
                element={
                  <PageTransition>
                    <Home />
                  </PageTransition>
                }
              />{" "}
              <Route
                path="careers"
                element={
                  <PageTransition>
                    <UserRoute>
                      <Careers />
                    </UserRoute>
                  </PageTransition>
                }
              />
              <Route
                path="careers/post-job"
                element={
                  <PageTransition>
                    <UserRoute>
                      <PostJob />
                    </UserRoute>
                  </PageTransition>
                }
              />
              <Route
                path="alumni"
                element={
                  <PageTransition>
                    <Alumni />
                  </PageTransition>
                }
              />
              <Route
                path="newsletter"
                element={
                  <PageTransition>
                    <Newsletter />
                  </PageTransition>
                }
              />
              <Route
                path="alumni-visits"
                element={
                  <PageTransition>
                    <AlumniVisits />
                  </PageTransition>
                }
              />
              <Route
                path="events"
                element={
                  <PageTransition>
                    <UserRoute>
                      <Events />
                    </UserRoute>
                  </PageTransition>
                }
              />{" "}
              <Route
                path="admin"
                element={
                  <PageTransition>
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  </PageTransition>
                }
              />
              <Route
                path="admin/events/create"
                element={
                  <PageTransition>
                    <AdminRoute>
                      <CreateEvent />
                    </AdminRoute>
                  </PageTransition>
                }
              />
              <Route
                path="admin/events/edit"
                element={
                  <PageTransition>
                    <AdminRoute>
                      <EditEvent />
                    </AdminRoute>
                  </PageTransition>
                }
              />
              <Route
                path="pending-approval"
                element={
                  <PageTransition>
                    <UserRoute>
                      <PendingApproval />
                    </UserRoute>
                  </PageTransition>
                }
              />
              <Route
                path="profile"
                element={
                  <PageTransition>
                    <UserRoute>
                      <Profile />
                    </UserRoute>
                  </PageTransition>
                }
              />
              <Route
                path="complete-profile"
                element={
                  <PageTransition>
                    <ProfileRoute>
                      {" "}
                      <CompleteProfile />
                    </ProfileRoute>
                  </PageTransition>
                }
              />
              {/* Catch-all route for 404 errors */}
              <Route
                path="*"
                element={
                  <PageTransition>
                    <NotFound />
                  </PageTransition>
                }
              />
            </Route>
          </Routes>{" "}
        </AnimatePresence>
      </div>
    </AuthProvider>
  );
}

// Wrap App with ThemeProvider
function AppWithTheme() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

export default AppWithTheme;
