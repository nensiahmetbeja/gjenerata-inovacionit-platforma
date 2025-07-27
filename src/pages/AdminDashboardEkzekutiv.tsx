import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { EkzekutivLayout } from '@/components/EkzekutivLayout';
import { GrupMoshaDropdown } from '@/components/filters/GrupMoshaDropdown';
import { FushaDropdown } from '@/components/filters/FushaDropdown';
import { BashkiaDropdown } from '@/components/filters/BashkiaDropdown';
import { StatusDropdown } from '@/components/filters/StatusDropdown';

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
          const fieldId = app.fusha_id;
          acc[fieldId] = (acc[fieldId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const applicationsByMunicipality = applications.reduce((acc, app) => {
          const municipalityId = app.bashkia_id;
          acc[municipalityId] = (acc[municipalityId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const applicationsByStatus = applications.reduce((acc, app) => {
          const statusId = app.status_id;
          acc[statusId] = (acc[statusId] || 0) + 1;
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

          {/* KPI Cards Section */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 mb-10">
            {/* Total Applications Card */}
            <div
              className="bg-white rounded-xl shadow-md p-6 relative group transition-transform duration-150 hover:scale-[1.03] hover:border hover:border-[#c6a14b] cursor-pointer outline-none focus:ring-2 focus:ring-[#c6a14b]"
              tabIndex={0}
              role="button"
              aria-label="Numri Total i Aplikimeve"
            >
              <div className="text-sm font-semibold text-[#142657] mb-2">Numri Total i Aplikimeve</div>
              <div className="text-4xl font-extrabold text-[#142657]">{kpiData.totalApplications}</div>
              <div className="text-xs text-muted-foreground mt-2">Të gjitha aplikimet</div>
            </div>
          </div>

          {/* Section Header for grouped KPIs */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#142657] tracking-wide">Aplikime sipas kategorisë</h2>
            <div className="h-px bg-muted/30 mt-2" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {/* Applications by Age Group */}
            <div
              className="bg-white rounded-xl shadow-md p-6 relative group transition-transform duration-150 hover:scale-[1.03] hover:border hover:border-[#c6a14b] cursor-pointer outline-none focus:ring-2 focus:ring-[#c6a14b]"
              tabIndex={0}
              role="button"
              aria-label="Aplikime sipas Grupmoshës"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-[#142657]">Aplikime sipas Grupmoshës</div>
                <GrupMoshaDropdown 
                  value={filters.ageGroup} 
                  onValueChange={(value) => setFilters({...filters, ageGroup: value})} 
                />
              </div>
              <div className="text-3xl font-extrabold text-[#142657]">{filters.ageGroup === 'all' ? kpiData.totalApplications : kpiData.applicationsByAgeGroup[filters.ageGroup] || 0}</div>
              <div className="text-xs text-muted-foreground mt-2">{filters.ageGroup === 'all' ? 'Të gjitha grupet' : filters.ageGroup}</div>
            </div>

            {/* Applications by Field */}
            <div
              className="bg-white rounded-xl shadow-md p-6 relative group transition-transform duration-150 hover:scale-[1.03] hover:border hover:border-[#c6a14b] cursor-pointer outline-none focus:ring-2 focus:ring-[#c6a14b]"
              tabIndex={0}
              role="button"
              aria-label="Aplikime sipas Fushës"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-[#142657]">Aplikime sipas Fushës</div>
                <FushaDropdown 
                  value={filters.field} 
                  onValueChange={(value) => setFilters({...filters, field: value})} 
                />
              </div>
              <div className="text-3xl font-extrabold text-[#142657]">{filters.field === 'all' ? kpiData.totalApplications : kpiData.applicationsByField[filters.field] || 0}</div>
              <div className="text-xs text-muted-foreground mt-2">{filters.field === 'all' ? 'Të gjitha fushat' : referenceData.fusha.find(f => f.id === filters.field)?.label || 'Unknown'}</div>
            </div>

            {/* Applications by Municipality */}
            <div
              className="bg-white rounded-xl shadow-md p-6 relative group transition-transform duration-150 hover:scale-[1.03] hover:border hover:border-[#c6a14b] cursor-pointer outline-none focus:ring-2 focus:ring-[#c6a14b]"
              tabIndex={0}
              role="button"
              aria-label="Aplikime sipas Bashkisë"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-[#142657]">Aplikime sipas Bashkisë</div>
                <BashkiaDropdown 
                  value={filters.municipality} 
                  onValueChange={(value) => setFilters({...filters, municipality: value})} 
                />
              </div>
              <div className="text-3xl font-extrabold text-[#142657]">{filters.municipality === 'all' ? kpiData.totalApplications : kpiData.applicationsByMunicipality[filters.municipality] || 0}</div>
              <div className="text-xs text-muted-foreground mt-2">{filters.municipality === 'all' ? 'Të gjitha bashkitë' : referenceData.bashkia.find(b => b.id === filters.municipality)?.label || 'Unknown'}</div>
            </div>

            {/* Applications by Status */}
            <div
              className="bg-white rounded-xl shadow-md p-6 relative group transition-transform duration-150 hover:scale-[1.03] hover:border hover:border-[#c6a14b] cursor-pointer outline-none focus:ring-2 focus:ring-[#c6a14b]"
              tabIndex={0}
              role="button"
              aria-label="Aplikime sipas Statusit"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-[#142657]">Aplikime sipas Statusit</div>
                <StatusDropdown 
                  value={filters.status} 
                  onValueChange={(value) => setFilters({...filters, status: value})} 
                />
              </div>
              <div className="text-3xl font-extrabold text-[#142657]">{filters.status === 'all' ? kpiData.totalApplications : kpiData.applicationsByStatus[filters.status] || 0}</div>
              <div className="text-xs text-muted-foreground mt-2">{filters.status === 'all' ? 'Të gjitha statuset' : referenceData.status.find(s => s.id === filters.status)?.label || 'Unknown'}</div>
            </div>
          </div>
        </div>
      </div>
    </EkzekutivLayout>
  );
}