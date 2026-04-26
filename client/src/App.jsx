import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import BuyerHome from "./pages/buyer/BuyerHome";
import Checkout from "./pages/buyer/Checkout";
import SellerDashboard from "./pages/seller/SellerDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Auth pages — we'll build these next */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/register"
            element={<div>Register page coming soon</div>}
          />

          {/* Buyer routes */}
          <Route
            path="/buyer/home"
            element={
              <ProtectedRoute role="buyer">
                <BuyerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/checkout"
            element={
              <ProtectedRoute role="buyer">
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* Seller routes — coming next */}

          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute role="seller">
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
