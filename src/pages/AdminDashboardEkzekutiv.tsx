import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { EkzekutivLayout } from '@/components/EkzekutivLayout';

interface KPIData {
  totalApplications: number;
  applicationsByAgeGroup: Record<string, number>;
  applicationsByField: Record<string, number>;
  applicationsByMunicipality: Record<string, number>;
  applicationsByStatus: Record<string, number>;
}

export default function AdminDashboardEkzekutiv() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState<KPIData>({
    totalApplications: 0,
    applicationsByAgeGroup: {},
    applicationsByField: {},
    applicationsByMunicipality: {},
    applicationsByStatus: {}
  });
  const [referenceData, setReferenceData] = useState({
    fusha: [] as Array<{id: string, label: string}>,
    bashkia: [] as Array<{id: string, label: string}>,
    status: [] as Array<{id: string, label: string}>
  });
  const [filters, setFilters] = useState({
    ageGroup: 'all',
    field: 'all',
    municipality: 'all',
    status: 'all'
  });
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const fetchKPIData = async () => {
    try {
      // Fetch applications with related data
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          fusha (label),
          bashkia (label),
          status (label)
        `);

      if (appsError) throw appsError;

      if (applications) {
        // Calculate KPIs
        const totalApplications = applications.length;
        
        const applicationsByAgeGroup = applications.reduce((acc, app) => {
          acc[app.grupmosha] = (acc[app.grupmosha] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const applicationsByField = applications.reduce((acc, app) => {
          const fieldLabel = app.fusha?.label || 'Unknown';
          acc[fieldLabel] = (acc[fieldLabel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const applicationsByMunicipality = applications.reduce((acc, app) => {
          const municipalityLabel = app.bashkia?.label || 'Unknown';
          acc[municipalityLabel] = (acc[municipalityLabel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const applicationsByStatus = applications.reduce((acc, app) => {
          const statusLabel = app.status?.label || 'Unknown';
          acc[statusLabel] = (acc[statusLabel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setKpiData({
          totalApplications,
          applicationsByAgeGroup,
          applicationsByField,
          applicationsByMunicipality,
          applicationsByStatus
        });
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [fushaRes, bashkiaRes, statusRes] = await Promise.all([
        supabase.from('fusha').select('id, label'),
        supabase.from('bashkia').select('id, label'),
        supabase.from('status').select('id, label')
      ]);

      setReferenceData({
        fusha: fushaRes.data || [],
        bashkia: bashkiaRes.data || [],
        status: statusRes.data || []
      });
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

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

        if (error || !profile || profile.role !== 'ekzekutiv') {
          navigate('/admin');
          return;
        }

        setUserRole(profile.role);
        
        // Fetch data after access is confirmed
        await Promise.all([fetchKPIData(), fetchReferenceData()]);
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
    <EkzekutivLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Ekzekutiv</h1>
              <p className="text-muted-foreground mt-2">Mirë se erdhe, {userRole}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Dil
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Total Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Numri Total i Aplikimeve</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{kpiData.totalApplications}</p>
                <p className="text-muted-foreground">Të gjitha aplikimet</p>
              </CardContent>
            </Card>

            {/* Applications by Age Group */}
            <Card>
              <CardHeader>
                <CardTitle>Aplikimet për Grupmoshë</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Select value={filters.ageGroup} onValueChange={(value) => setFilters({...filters, ageGroup: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Zgjidhni grupmoshën" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Të gjitha grupet</SelectItem>
                      {Object.keys(kpiData.applicationsByAgeGroup).map((ageGroup) => (
                        <SelectItem key={ageGroup} value={ageGroup}>{ageGroup}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-2xl font-bold">
                    {filters.ageGroup === 'all' 
                      ? kpiData.totalApplications 
                      : kpiData.applicationsByAgeGroup[filters.ageGroup] || 0}
                  </p>
                  <p className="text-muted-foreground">
                    {filters.ageGroup === 'all' ? 'Të gjitha grupet' : filters.ageGroup}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Applications by Field */}
            <Card>
              <CardHeader>
                <CardTitle>Aplikimet për Fushë</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Select value={filters.field} onValueChange={(value) => setFilters({...filters, field: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Zgjidhni fushën" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Të gjitha fushat</SelectItem>
                      {Object.keys(kpiData.applicationsByField).map((field) => (
                        <SelectItem key={field} value={field}>{field}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-2xl font-bold">
                    {filters.field === 'all' 
                      ? kpiData.totalApplications 
                      : kpiData.applicationsByField[filters.field] || 0}
                  </p>
                  <p className="text-muted-foreground">
                    {filters.field === 'all' ? 'Të gjitha fushat' : filters.field}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Applications by Municipality */}
            <Card>
              <CardHeader>
                <CardTitle>Aplikimet për Bashki</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Select value={filters.municipality} onValueChange={(value) => setFilters({...filters, municipality: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Zgjidhni bashkinë" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Të gjitha bashkitë</SelectItem>
                      {Object.keys(kpiData.applicationsByMunicipality).map((municipality) => (
                        <SelectItem key={municipality} value={municipality}>{municipality}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-2xl font-bold">
                    {filters.municipality === 'all' 
                      ? kpiData.totalApplications 
                      : kpiData.applicationsByMunicipality[filters.municipality] || 0}
                  </p>
                  <p className="text-muted-foreground">
                    {filters.municipality === 'all' ? 'Të gjitha bashkitë' : filters.municipality}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Applications by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Aplikimet për Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Zgjidhni statusin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Të gjitha statuset</SelectItem>
                      {Object.keys(kpiData.applicationsByStatus).map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-2xl font-bold">
                    {filters.status === 'all' 
                      ? kpiData.totalApplications 
                      : kpiData.applicationsByStatus[filters.status] || 0}
                  </p>
                  <p className="text-muted-foreground">
                    {filters.status === 'all' ? 'Të gjitha statuset' : filters.status}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </EkzekutivLayout>
  );
}