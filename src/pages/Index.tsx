import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-xl text-muted-foreground">Po ngarkohet...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold mb-4">Mirëseardhje në Aplikacion!</h1>
        <p className="text-xl text-muted-foreground">
          Mirëseardhje, {user.user_metadata?.emri} {user.user_metadata?.mbiemri}!
        </p>
        <Button onClick={signOut} variant="outline">
          Dil
        </Button>
      </div>
    </div>
  );
};

export default Index;
