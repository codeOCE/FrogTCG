import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";


import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Binder from "./pages/Binder";

export default function App() {
  const { user, loading } = useAuth();

  // While we check session state:
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Routes>

        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            user ? <Dashboard /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/binder"
          element={
            user ? <Binder /> : <Navigate to="/" replace />
          }
        />

        {/* Catch-all → back home */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </div>
  );
}
