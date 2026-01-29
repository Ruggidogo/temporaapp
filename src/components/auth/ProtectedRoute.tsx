import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const isTrialExpired = (trialEndsAt: string | null, plan: string): boolean => {
  if (plan === 'pro') return false;
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt) < new Date();
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, profile, subscription } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if not completed
  if (profile && !profile.onboarding_completed && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to trial expired page if trial has ended and not subscribed
  if (
    profile && 
    profile.onboarding_completed &&
    !subscription.subscribed &&
    isTrialExpired(profile.trial_ends_at, profile.plan) &&
    location.pathname !== '/trial-expired'
  ) {
    return <Navigate to="/trial-expired" replace />;
  }

  // If user became Pro (or has an active subscription), don't let them stay on /trial-expired
  if (
    location.pathname === '/trial-expired' &&
    (subscription.subscribed || profile?.plan === 'pro')
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
