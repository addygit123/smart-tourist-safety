import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
    <Router>
      <Routes>
        {/* <Route path="/" element={<LandingPage />} /> */}
        <Route path="/login" element={<LoginPage />} />
        <Route 
        path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
        />
      </Routes>
    </Router>
    </SocketProvider>
  );
}

export default App;

