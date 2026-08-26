import { useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
// components
import LoadingScreen from "../components/loading-screen";
//
import Login from "../pages/Auth/LoginPage";
import { useAuthContext } from "./useAuthContext";
import LocationInstruction from "src/components/CustomFunction/LocationInstruction";

// ----------------------------------------------------------------------

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isInitialized, location } = useAuthContext();

  const { pathname } = useLocation();

  const [requestedLocation, setRequestedLocation] = useState<string | null>(
    null
  );

  if (!isInitialized) {
    return <LoadingScreen />;
  }
  if (!location) {
    return <LocationInstruction />;
  }

  if (!isAuthenticated) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return <Login />;
  }

  if (isAuthenticated) {
    if (!location) {
      return <LocationInstruction />;
    }
  }

  if (requestedLocation && pathname !== requestedLocation) {
    setRequestedLocation(null);

    return <Navigate to={requestedLocation} />;
  }

  return <>{children}</>;
}
