import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
// components
import LoadingScreen from "../components/loading-screen";
//
import { useAuthContext } from "./useAuthContext";
import LocationInstruction from "src/components/CustomFunction/LocationInstruction";

// ----------------------------------------------------------------------

type GuestGuardProps = {
  children: ReactNode;
};

export default function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isInitialized, location } = useAuthContext();

  if (!location) {
    return <LocationInstruction />;
  }

  if (isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
