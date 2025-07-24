import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, sign in the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Qasja e kufizuar: Ky përdorues nuk ka të drejta administrimi.');
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Qasja e kufizuar: Ky përdorues nuk ka të drejta administrimi.');
        setLoading(false);
        return;
      }

      // Check user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError('Qasja e kufizuar: Ky përdorues nuk ka të drejta administrimi.');
        setLoading(false);
        return;
      }

      // Check if user has admin role
      if (profile.role !== 'ekzekutiv' && profile.role !== 'ekspert') {
        await supabase.auth.signOut();
        setError('Qasja e kufizuar: Ky përdorues nuk ka të drejta administrimi.');
        setLoading(false);
        return;
      }

      // Success - redirect based on role
      toast({
        title: "Mirë se erdhe!",
        description: "Jeni futur me sukses si administrator.",
      });
      
      if (profile.role === 'ekzekutiv') {
        navigate('/admin/dashboard-ekzekutiv');
      } else if (profile.role === 'ekspert') {
        navigate('/admin/dashboard-ekspert');
      }
    } catch (err) {
      setError('Qasja e kufizuar: Ky përdorues nuk ka të drejta administrimi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Administratori</CardTitle>
          <CardDescription>
            Hyrje për administratorët e platformës
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Fjalëkalimi</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Duke u futur...' : 'Hyr si Administrator'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}