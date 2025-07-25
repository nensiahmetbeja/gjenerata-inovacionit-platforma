import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, LogOut } from "lucide-react";
import ApplicationCardEkspert from '@/components/ApplicationCardEkspert';

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

interface FilterOption {
  id: string;
  label: string;
}

export default function EkspertAplikimet() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Filter states
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedFusha, setSelectedFusha] = useState<string[]>([]);
  const [selectedBashkia, setSelectedBashkia] = useState('');
  const [selectedGrupmosha, setSelectedGrupmosha] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Options for filters
  const [fushaOptions, setFushaOptions] = useState<FilterOption[]>([]);
  const [bashkiaOptions, setBashkiaOptions] = useState<FilterOption[]>([]);
  const [statusOptions, setStatusOptions] = useState<FilterOption[]>([]);

  const grupMoshaOptions = [
    '6-10 vjeç',
    '11-14 vjeç', 
    '15-18 vjeç',
    '19+ vjeç'
  ];

  useEffect(() => {
    checkUserRole();
    fetchFilterOptions();
  }, [user]);

  useEffect(() => {
    if (userRole === 'ekspert') {
      fetchApplications();
    }
  }, [userRole, user]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTitle, selectedFusha, selectedBashkia, selectedGrupmosha, selectedStatus]);

  const checkUserRole = async () => {
    if (!user?.id) {
      navigate('/admin');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.role !== 'ekspert') {
        navigate('/admin');
        return;
      }

      setUserRole(data.role);
    } catch (error) {
      console.error('Error checking user role:', error);
      navigate('/admin');
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [fushaResponse, bashkiaResponse, statusResponse] = await Promise.all([
        supabase.from('fusha').select('id, label').order('label'),
        supabase.from('bashkia').select('id, label').order('label'),
        supabase.from('status').select('id, label').order('label')
      ]);

      if (fushaResponse.data) setFushaOptions(fushaResponse.data);
      if (bashkiaResponse.data) setBashkiaOptions(bashkiaResponse.data);
      if (statusResponse.data) setStatusOptions(statusResponse.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchApplications = async () => {
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
      toast({
        title: "Gabim gjatë ngarkimit",
        description: "Ka ndodhur një gabim gjatë ngarkimit të aplikimeve",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTitle) {
      filtered = filtered.filter(app => 
        app.titulli.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    if (selectedFusha.length > 0) {
      filtered = filtered.filter(app => 
        selectedFusha.includes(app.fusha_id)
      );
    }

    if (selectedBashkia) {
      filtered = filtered.filter(app => app.bashkia_id === selectedBashkia);
    }

    if (selectedGrupmosha) {
      filtered = filtered.filter(app => app.grupmosha === selectedGrupmosha);
    }

    if (selectedStatus) {
      filtered = filtered.filter(app => app.status_id === selectedStatus);
    }

    setFilteredApplications(filtered);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
      case 'në pritje':
        return 'secondary';
      case 'në shqyrtim':
        return 'default';
      case 'pranuar':
        return 'default';
      case 'refuzuar':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Duke ngarkuar aplikimet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Aplikimet për Ekspertin</h1>
              <p className="text-muted-foreground">Shqyrto dhe komento aplikimet e caktuara</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Dil
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtro Aplikimet</CardTitle>
            <CardDescription>Përdor filtrat për të gjetur aplikimet specifike</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Titulli i Projektit</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Kërko sipas titullit..."
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Bashkia Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Bashkia</label>
                <Select value={selectedBashkia} onValueChange={setSelectedBashkia}>
                  <SelectTrigger>
                    <SelectValue placeholder="Zgjedh bashkinë" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Të gjitha</SelectItem>
                    {bashkiaOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Grupmosha Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Grupmosha</label>
                <Select value={selectedGrupmosha} onValueChange={setSelectedGrupmosha}>
                  <SelectTrigger>
                    <SelectValue placeholder="Zgjedh grupmoshën" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Të gjitha</SelectItem>
                    {grupMoshaOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Statusi</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Zgjedh statusin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Të gjitha</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        <Badge variant={getStatusBadgeVariant(option.label)} className="ml-2">
                          {option.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            {filteredApplications.length} aplikime të gjetura
            {filteredApplications.length !== applications.length && ` nga ${applications.length} totale`}
          </p>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground">
                  {applications.length === 0 
                    ? "Asnjë aplikim i caktuar për ju ende."
                    : "Asnjë aplikim nuk përputhet me filtrat e zgjedhur."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <ApplicationCardEkspert key={application.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}