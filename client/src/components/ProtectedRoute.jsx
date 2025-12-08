import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Loading...
      </div>
    );

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role if trying to access unauthorized page
    if (user.role === "superadmin") return <Navigate to="/super-admin" />;
    if (user.role === "supervisor") return <Navigate to="/supervisor" />;
    if (user.role === "validator") return <Navigate to="/validator" />;
    if (user.role === "admin") return <Navigate to="/admin" />;
    return <Navigate to="/" />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.array,
};
