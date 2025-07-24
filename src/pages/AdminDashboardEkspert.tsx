import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboardEkspert() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const checkAccess = async () => {
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
          navigate('/admin');
          return;
        }

        setUserRole(profile.role);
      } catch (err) {
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Duke ngarkuar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Ekspert</h1>
            <p className="text-muted-foreground mt-2">Mirë se erdhe, {userRole}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Dil
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Aplikimet për Vlerësim</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">7</p>
              <p className="text-muted-foreground">Në pritje të vlerësimit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vlerësimet e Përfunduara</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">15</p>
              <p className="text-muted-foreground">Këtë javë</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raportet Teknike</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">22</p>
              <p className="text-muted-foreground">Raporte të dorëzuara</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fushës së Specializimit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Teknologji dhe Inovacion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aktiviteti i Fundit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Vlerësimi i fundit u dorëzua më {new Date().toLocaleDateString('sq-AL')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}