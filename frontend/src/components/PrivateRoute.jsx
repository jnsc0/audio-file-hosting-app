import { Navigate, Outlet } from "react-router-dom";

// PrivateRoute component that checks user role
const PrivateRoute = ({ requiredRole }) => {
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("role");  // Assuming role is stored in localStorage

  if (!token) {
    // Redirect to login page if not authenticated
    return <Navigate to="/" />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  // Check if the user has the required role
  if (requiredRole && userRole !== requiredRole) {
    // If the user doesn't have the required role, redirect to a default route (could be home or dashboard)
    return <Navigate to={userRole === "admin" ? "/admin-dashboard" : "/dashboard"} />;
  }

  // If the user is authenticated and has the right role, allow access to the route
  return <Outlet />;
};

export default PrivateRoute;
