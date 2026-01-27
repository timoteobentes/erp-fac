import { Navigate } from 'react-router-dom';
import { useAuth } from '../modules/Login/context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (token) {
    return <Navigate to="/inicio" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;