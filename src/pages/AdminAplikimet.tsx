import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApplicationCardEkzekutiv from '@/components/ApplicationCardEkzekutiv';
import ApplicationCardEkspert from '@/components/ApplicationCardEkspert';
import { ArrowLeft } from 'lucide-react';

interface FilterOptions {
  fusha: Array<{ id: string; label: string }>;
  bashkia: Array<{ id: string; label: string }>;
  status: Array<{ id: string; label: string }>;
}

export default function AdminAplikimet() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    fusha: [],
    bashkia: [],
    status: []
  });
  const [filters, setFilters] = useState({
    grupmosha: '',
    fusha_id: '',
    bashkia_id: '',
    status_id: ''
  });

  useEffect(() => {
    const checkUserRole = async () => {
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

        if (error) throw error;

        if (!profile || (profile.role !== 'ekzekutiv' && profile.role !== 'ekspert')) {
          navigate('/admin');
          return;
        }

        setUserRole(profile.role);
        
        // Fetch filter options for ekzekutiv users
        if (profile.role === 'ekzekutiv') {
          await fetchFilterOptions();
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user, navigate]);

  const fetchFilterOptions = async () => {
    try {
      const [fushaRes, bashkiaRes, statusRes] = await Promise.all([
        supabase.from('fusha').select('id, label').order('label'),
        supabase.from('bashkia').select('id, label').order('label'),
        supabase.from('status').select('id, label').order('label')
      ]);

      setFilterOptions({
        fusha: fushaRes.data || [],
        bashkia: bashkiaRes.data || [],
        status: statusRes.data || []
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  const clearFilters = () => {
    setFilters({
      grupmosha: '',
      fusha_id: '',
      bashkia_id: '',
      status_id: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Duke ngarkuar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Kthehu
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Aplikimet</h1>
                <p className="text-sm text-muted-foreground">
                  Roli: <span className="font-medium capitalize">{userRole}</span>
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Dil
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters for Ekzekutiv */}
        {userRole === 'ekzekutiv' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filtro Aplikimet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Grupmosha
                  </label>
                  <Select value={filters.grupmosha} onValueChange={(value) => setFilters(prev => ({ ...prev, grupmosha: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Të gjitha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Të gjitha</SelectItem>
                      <SelectItem value="15-18">15-18 vjeç</SelectItem>
                      <SelectItem value="19-25">19-25 vjeç</SelectItem>
                      <SelectItem value="26-35">26-35 vjeç</SelectItem>
                      <SelectItem value="36+">36+ vjeç</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Tema/Fusha
                  </label>
                  <Select value={filters.fusha_id} onValueChange={(value) => setFilters(prev => ({ ...prev, fusha_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Të gjitha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Të gjitha</SelectItem>
                      {filterOptions.fusha.map((fusha) => (
                        <SelectItem key={fusha.id} value={fusha.id}>
                          {fusha.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Bashkia
                  </label>
                  <Select value={filters.bashkia_id} onValueChange={(value) => setFilters(prev => ({ ...prev, bashkia_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Të gjitha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Të gjitha</SelectItem>
                      {filterOptions.bashkia.map((bashkia) => (
                        <SelectItem key={bashkia.id} value={bashkia.id}>
                          {bashkia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Statusi
                  </label>
                  <Select value={filters.status_id} onValueChange={(value) => setFilters(prev => ({ ...prev, status_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Të gjitha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Të gjitha</SelectItem>
                      {filterOptions.status.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button variant="outline" onClick={clearFilters} size="sm">
                Pastro Filtrat
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Applications List */}
        {userRole === 'ekzekutiv' && <ApplicationCardEkzekutiv />}
        {userRole === 'ekspert' && <ApplicationCardEkspert />}
      </div>
    </div>
  );
}