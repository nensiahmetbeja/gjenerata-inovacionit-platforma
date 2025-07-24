import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboardEkzekutiv() {
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

        if (error || !profile || profile.role !== 'ekzekutiv') {
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
            <h1 className="text-2xl font-bold">Paneli i Ekzekutivit</h1>
            <p className="text-sm text-muted-foreground">
              Mirë se erdhe, Ekzekutiv
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
              <CardTitle>Menaxhimi i Plotë</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Qasje e plotë në të gjitha aplikimet dhe funksionet administrative.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aprovimi Final</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Aprovo ose refuzo aplikimet pas vlerësimit nga ekspertët.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raportet Executive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Shiko raportet e përgjithshme dhe statistikat e platformës.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Vështrim i Përgjithshëm</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Këtu do të shfaqen informacionet kryesore të platformës dhe aktivitetet e fundit.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}