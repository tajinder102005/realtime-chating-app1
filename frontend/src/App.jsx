import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatPage from "./pages/ChatPage";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return token ? children : <Navigate to="/login" />;
};

// Public Route wrapper (redirect to chat if already logged in)
const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return token ? <Navigate to="/chat" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
