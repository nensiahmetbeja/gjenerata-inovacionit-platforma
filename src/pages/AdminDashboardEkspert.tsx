import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboardEkspert() {
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/admin');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || !profile || profile.role !== 'ekspert') {
          await signOut();
          navigate('/admin');
          return;
        }
      } catch (err) {
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, navigate, signOut]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Duke ngarkuar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Paneli i Ekspertit</h1>
            <p className="text-sm text-muted-foreground">
              Mirë se erdhe, Ekspert
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Dil nga sistemi
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Vlerësimi i Aplikimeve</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Rishiko dhe vlerëso aplikimet e reja të dorëzuara nga përdoruesit.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Komente dhe Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Jep komente dhe sugjerime për përmirësimin e aplikimeve.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aplikimet në Proces</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Shiko aplikimet që janë në proces vlerësimi nga ju.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Aktiviteti im</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Këtu do të shfaqen aplikimet që keni vlerësuar së fundmi dhe aktivitetet tuaja.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}