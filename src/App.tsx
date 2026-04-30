import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
import { OrbitDashboard } from './components/orbit/OrbitDashboard';
import { LandingPage } from './components/pages/LandingPage';
import { LoginPage } from './components/pages/LoginPage';
import { SignupPage } from './components/pages/SignupPage';
import { ForgotPasswordPage } from './components/pages/ForgotPasswordPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { PreferencesPage } from './components/pages/PreferencesPage';
import { TripHistoryPage } from './components/pages/TripHistoryPage';
import { ProtectedRoute } from './router/ProtectedRoute';
import { OrbitLayout } from './components/orbit/OrbitLayout';

const LandingPageWrapper = () => {
  const navigate = useNavigate();
  const handleSearch = (_query: string) => {
    navigate('/login');
  };
  return <LandingPage onSearch={handleSearch} />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPageWrapper />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/signup',
    element: <SignupPage />
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <OrbitDashboard />
      },
      {
        path: '/profile',
        element: <ProfilePage />
      },
      {
        path: '/preferences',
        element: <OrbitLayout dashboardPanel={<PreferencesPage />} />
      },
      {
        path: '/trips',
        element: <OrbitLayout dashboardPanel={<TripHistoryPage />} />
      }
    ]
  }
]);

function App() {
  return (
    <div className="font-sans antialiased text-text-primary bg-orbit-950 min-h-screen">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
