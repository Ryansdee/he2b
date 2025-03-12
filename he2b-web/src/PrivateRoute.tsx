import React from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  isAuthenticated: boolean;
  element: React.ReactElement;  // Déclaration correcte du type pour element
}

const PrivateRoute = ({ isAuthenticated, element }: PrivateRouteProps) => {
  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
