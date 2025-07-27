import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { X, Search, Check, ChevronDown } from "lucide-react";
import ApplicationCardBase from '@/components/ApplicationCardBase';
import AplikimeTable from '@/components/AplikimeTable';
import { EkzekutivLayout } from '@/components/EkzekutivLayout';
import { EkspertLayout } from '@/components/EkspertLayout';
import { GrupMoshaDropdown } from '@/components/filters/GrupMoshaDropdown';
import { BashkiaDropdown } from '@/components/filters/BashkiaDropdown';

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
  assigned_ekspert?: { emri: string; mbiemri: string } | null;
}

interface FilterOptions {
  fusha: Array<{ id: string; label: string }>;
  bashkia: Array<{ id: string; label: string }>;
  status: Array<{ id: string; label: string }>;
  ekspertë: Array<{ id: string; emri: string; mbiemri: string }>;
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
    status: [],
    ekspertë: []
  });
  const [filters, setFilters] = useState({
    titulli: '',
    fusha_ids: [] as string[],
    grupmosha: 'all',
    bashkia_id: 'all',
    status_ids: [] as string[],
    ekspert_id: 'all'
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
        
        // Fetch filter options for both roles
        await fetchFilterOptions();
        
        // Fetch applications based on role
        if (profile.role === 'ekzekutiv') {
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
          fusha:fusha_id (label),
          bashkia:bashkia_id (label),
          status:status_id (label)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        // Fetch expert info separately for each application
        const applicationsWithExperts = await Promise.all(
          data.map(async (app: any) => {
            if (app.assigned_ekspert_id) {
              const { data: expert } = await supabase
                .from('profiles')
                .select('emri, mbiemri')
                .eq('id', app.assigned_ekspert_id)
                .single();
              
              return { ...app, assigned_ekspert: expert };
            }
            return { ...app, assigned_ekspert: null };
          })
        );
        
        setApplications(applicationsWithExperts as any);
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
          fusha:fusha_id (label),
          bashkia:bashkia_id (label),
          status:status_id (label)
        `)
        .eq('assigned_ekspert_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        // Fetch expert info separately for each application
        const applicationsWithExperts = await Promise.all(
          data.map(async (app: any) => {
            if (app.assigned_ekspert_id) {
              const { data: expert } = await supabase
                .from('profiles')
                .select('emri, mbiemri')
                .eq('id', app.assigned_ekspert_id)
                .single();
              
              return { ...app, assigned_ekspert: expert };
            }
            return { ...app, assigned_ekspert: null };
          })
        );
        
        setApplications(applicationsWithExperts as any);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Search by title
    if (filters.titulli.trim()) {
      filtered = filtered.filter(app => 
        app.titulli.toLowerCase().includes(filters.titulli.toLowerCase())
      );
    }

    // Filter by age group
    if (filters.grupmosha !== 'all') {
      filtered = filtered.filter(app => app.grupmosha === filters.grupmosha);
    }

    // Filter by innovation fields (multi-select)
    if (filters.fusha_ids.length > 0) {
      filtered = filtered.filter(app => filters.fusha_ids.includes(app.fusha_id));
    }

    // Filter by municipality
    if (filters.bashkia_id !== 'all') {
      filtered = filtered.filter(app => app.bashkia_id === filters.bashkia_id);
    }

    // Filter by status (multi-select)
    if (filters.status_ids.length > 0) {
      filtered = filtered.filter(app => filters.status_ids.includes(app.status_id));
    }

    // Filter by assigned expert
    if (filters.ekspert_id !== 'all') {
      if (filters.ekspert_id === 'unassigned') {
        filtered = filtered.filter(app => !app.assigned_ekspert_id);
      } else {
        filtered = filtered.filter(app => app.assigned_ekspert_id === filters.ekspert_id);
      }
    }

    setFilteredApplications(filtered);
  };

  const fetchFilterOptions = async () => {
    try {
      const [fushaRes, bashkiaRes, statusRes, ekspertRes] = await Promise.all([
        supabase.from('fusha').select('id, label').order('label'),
        supabase.from('bashkia').select('id, label').order('label'),
        supabase.from('status').select('id, label').order('label'),
        supabase.from('profiles').select('id, emri, mbiemri').eq('role', 'ekspert').order('emri')
      ]);

      setFilterOptions({
        fusha: fushaRes.data || [],
        bashkia: bashkiaRes.data || [],
        status: statusRes.data || [],
        ekspertë: ekspertRes.data || []
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
      titulli: '',
      fusha_ids: [],
      grupmosha: 'all',
      bashkia_id: 'all',
      status_ids: [],
      ekspert_id: 'all'
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

  const content = (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Aplikimet</h1>
            <p className="text-sm text-muted-foreground">
              Roli: <span className="font-medium capitalize">{userRole}</span>
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Dil
          </Button>
        </div>
      </div>
      {/* Filters Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filtro Aplikimet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title Search */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Titulli i Projektit
            </label>
            <Input
              placeholder="Kërko sipas titullit..."
              value={filters.titulli}
              onChange={(e) => setFilters(prev => ({ ...prev, titulli: e.target.value }))}
              className="w-full"
            />
          </div>

          {/* Main Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Innovation Field - Multi-select Dropdown */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Fusha e Inovacionit
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {filters.fusha_ids.length > 0 
                      ? `${filters.fusha_ids.length} të zgjedhura`
                      : "Zgjedh fushat..."
                    }
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Kërko fushat..." />
                    <CommandList>
                      <CommandEmpty>Nuk u gjend asgjë.</CommandEmpty>
                      <CommandGroup>
                        {filterOptions.fusha.map((fusha) => (
                          <CommandItem
                            key={fusha.id}
                            onSelect={() => {
                              if (filters.fusha_ids.includes(fusha.id)) {
                                setFilters(prev => ({ 
                                  ...prev, 
                                  fusha_ids: prev.fusha_ids.filter(id => id !== fusha.id) 
                                }));
                              } else {
                                setFilters(prev => ({ 
                                  ...prev, 
                                  fusha_ids: [...prev.fusha_ids, fusha.id] 
                                }));
                              }
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                filters.fusha_ids.includes(fusha.id) ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {fusha.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {filters.fusha_ids.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.fusha_ids.map(id => {
                    const fusha = filterOptions.fusha.find(f => f.id === id);
                    return fusha ? (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {fusha.label}
                        <X 
                          className="ml-1 h-3 w-3 cursor-pointer" 
                          onClick={() => setFilters(prev => ({ 
                            ...prev, 
                            fusha_ids: prev.fusha_ids.filter(fid => fid !== id) 
                          }))}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Age Group */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Grupmosha
              </label>
              <GrupMoshaDropdown 
                value={filters.grupmosha} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, grupmosha: value }))} 
              />
            </div>

            {/* Municipality */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Bashkia
              </label>
              <BashkiaDropdown 
                value={filters.bashkia_id} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, bashkia_id: value }))} 
              />
            </div>

            {/* Status - Multi-select Dropdown */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Statusi
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {filters.status_ids.length > 0 
                      ? `${filters.status_ids.length} të zgjedhura`
                      : "Zgjedh statuset..."
                    }
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Kërko statuset..." />
                    <CommandList>
                      <CommandEmpty>Nuk u gjend asgjë.</CommandEmpty>
                      <CommandGroup>
                        {filterOptions.status.map((status) => (
                          <CommandItem
                            key={status.id}
                            onSelect={() => {
                              if (filters.status_ids.includes(status.id)) {
                                setFilters(prev => ({ 
                                  ...prev, 
                                  status_ids: prev.status_ids.filter(id => id !== status.id) 
                                }));
                              } else {
                                setFilters(prev => ({ 
                                  ...prev, 
                                  status_ids: [...prev.status_ids, status.id] 
                                }));
                              }
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                filters.status_ids.includes(status.id) ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {status.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {filters.status_ids.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.status_ids.map(id => {
                    const status = filterOptions.status.find(s => s.id === id);
                    return status ? (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {status.label}
                        <X 
                          className="ml-1 h-3 w-3 cursor-pointer" 
                          onClick={() => setFilters(prev => ({ 
                            ...prev, 
                            status_ids: prev.status_ids.filter(sid => sid !== id) 
                          }))}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Assigned Expert - Only show for ekzekutiv */}
            {userRole === 'ekzekutiv' && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Eksperti i caktuar
                </label>
                <Select value={filters.ekspert_id} onValueChange={(value) => setFilters(prev => ({ ...prev, ekspert_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Të gjithë" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Të gjithë</SelectItem>
                    <SelectItem value="unassigned">Pa u caktuar</SelectItem>
                    {filterOptions.ekspertë.map((ekspert) => (
                      <SelectItem key={ekspert.id} value={ekspert.id}>
                        {ekspert.emri} {ekspert.mbiemri}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {filteredApplications.length !== applications.length && (
                <span>
                  Shfaqen {filteredApplications.length} nga {applications.length} aplikime
                </span>
              )}
            </div>
            <Button variant="outline" onClick={clearFilters} size="sm">
              Pastro Filtrat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table/List */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {userRole === 'ekzekutiv' ? 'Menaxhimi i Aplikimeve' : 'Aplikimet e Caktuara'}
          </h2>
          <p className="text-muted-foreground">
            {userRole === 'ekzekutiv' 
              ? 'Menaxho statusin, cakto ekspertë dhe shto komente për aplikimet.'
              : 'Shqyrto dhe komento aplikimet që t\'i janë caktuar.'
            }
          </p>
        </div>
        
        {applications.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">
              {userRole === 'ekspert' 
                ? 'Asnjë aplikim i caktuar për ju ende.' 
                : 'Asnjë aplikim i gjetur.'
              }
            </p>
          </div>
        ) : (
          <AplikimeTable
            applications={filteredApplications}
            onUpdate={userRole === 'ekzekutiv' ? fetchApplications : fetchEkspertApplications}
            statusOptions={filterOptions.status}
            ekspertOptions={filterOptions.ekspertë}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );

  // Use appropriate layout for each role
  if (userRole === 'ekzekutiv') {
    return <EkzekutivLayout>{content}</EkzekutivLayout>;
  }

  // For ekspert, use EkspertLayout with sidebar
  return <EkspertLayout>{content}</EkspertLayout>;
}