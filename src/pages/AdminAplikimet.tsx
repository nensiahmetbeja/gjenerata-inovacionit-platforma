import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApplicationCardBase from '@/components/ApplicationCardBase';
import { ArrowLeft } from 'lucide-react';

interface Application {
  id: string;
  titulli: string;
  pershkrimi: string;
  grupmosha: string;
  prototip_url?: string;
  dokumente?: any;
  created_at: string;
  user_id: string;
  fusha_id: string;
  bashkia_id: string;
  status_id: string;
  assigned_ekspert_id?: string;
  fusha?: { label: string };
  bashkia?: { label: string };
  status?: { label: string };
}

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
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    fusha: [],
    bashkia: [],
    status: []
  });
  const [filters, setFilters] = useState({
    grupmosha: 'all',
    fusha_id: 'all',
    bashkia_id: 'all',
    status_id: 'all'
  });

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setLoading(false);
          return;
        }

        if (!profile || (profile.role !== 'ekzekutiv' && profile.role !== 'ekspert')) {
          console.warn('User does not have required role:', profile?.role);
          setLoading(false);
          return;
        }

        setUserRole(profile.role);
        
        // Fetch filter options and applications for ekzekutiv users
        if (profile.role === 'ekzekutiv') {
          await fetchFilterOptions();
          await fetchApplications();
        } else if (profile.role === 'ekspert') {
          await fetchEkspertApplications();
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  // Apply filters whenever filters or applications change
  useEffect(() => {
    applyFilters();
  }, [filters, applications]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          fusha (label),
          bashkia (label),
          status (label)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setApplications(data as Application[]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchEkspertApplications = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          fusha (label),
          bashkia (label),
          status (label)
        `)
        .eq('assigned_ekspert_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setApplications(data as Application[]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    if (filters.grupmosha !== 'all') {
      filtered = filtered.filter(app => app.grupmosha === filters.grupmosha);
    }

    if (filters.fusha_id !== 'all') {
      filtered = filtered.filter(app => app.fusha_id === filters.fusha_id);
    }

    if (filters.bashkia_id !== 'all') {
      filtered = filtered.filter(app => app.bashkia_id === filters.bashkia_id);
    }

    if (filters.status_id !== 'all') {
      filtered = filtered.filter(app => app.status_id === filters.status_id);
    }

    setFilteredApplications(filtered);
  };

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
      grupmosha: 'all',
      fusha_id: 'all',
      bashkia_id: 'all',
      status_id: 'all'
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Duhet të jeni të kyçur për të hyrë në këtë faqe.</p>
            <Button onClick={() => navigate('/admin?redirect=' + encodeURIComponent('/admin/aplikimet'))}>
              Kthehu tek Hyrja
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userRole || (userRole !== 'ekzekutiv' && userRole !== 'ekspert')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Nuk keni të drejta të mjaftueshme për të hyrë në këtë faqe.</p>
            <Button onClick={() => navigate('/admin?redirect=' + encodeURIComponent('/admin/aplikimet'))}>
              Kthehu tek Hyrja
            </Button>
          </CardContent>
        </Card>
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
                      <SelectItem value="all">Të gjitha</SelectItem>
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
                      <SelectItem value="all">Të gjitha</SelectItem>
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
                      <SelectItem value="all">Të gjitha</SelectItem>
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
                      <SelectItem value="all">Të gjitha</SelectItem>
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
        {userRole === 'ekzekutiv' && (
          <div className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Menaxhimi i Aplikimeve</h2>
              <p className="text-muted-foreground">
                Menaxho statusin, cakto ekspertë dhe shto komente për aplikimet.
                {filteredApplications.length !== applications.length && (
                  <span className="ml-2 text-sm">
                    ({filteredApplications.length} nga {applications.length} aplikime)
                  </span>
                )}
              </p>
            </div>
            
            {filteredApplications.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-muted-foreground">
                  {applications.length === 0 
                    ? "Nuk ka aplikime për të shfaqur." 
                    : "Asnjë aplikim i disponueshëm për filtrat e zgjedhur."}
                </p>
              </div>
            ) : (
              filteredApplications.map((application) => (
                <ApplicationCardBase
                  key={application.id}
                  application={application}
                  canEditStatus={true}
                  canAssignEkspert={true}
                  commentPermissions={{ 
                    canView: true, 
                    canWrite: true, 
                    role: 'ekzekutiv' 
                  }}
                  onUpdate={() => {
                    fetchApplications();
                  }}
                />
              ))
            )}
          </div>
        )}
        {userRole === 'ekspert' && (
          <div className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Aplikimet e Caktuara</h2>
              <p className="text-muted-foreground">
                Shqyrto dhe komento aplikimet që t'i janë caktuar.
              </p>
            </div>
            
            {applications.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-muted-foreground">Asnjë aplikim i caktuar për ju ende.</p>
              </div>
            ) : (
              applications.map((application) => (
                <ApplicationCardBase
                  key={application.id}
                  application={application}
                  canEditStatus={false}
                  canAssignEkspert={false}
                  commentPermissions={{ 
                    canView: true, 
                    canWrite: true, 
                    role: 'ekspert' 
                  }}
                  onUpdate={() => {
                    fetchEkspertApplications();
                  }}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}