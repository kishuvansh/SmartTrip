import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = () => {
    const { user, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#00050A] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orbit-700 border-t-accent-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
