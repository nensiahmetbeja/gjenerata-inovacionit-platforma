import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Eye, Plus } from 'lucide-react';
import ApplicationCardBase from '@/components/ApplicationCardBase';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: string;
  titulli: string;
  pershkrimi: string;
  grupmosha: string;
  prototip_url?: string;
  created_at: string;
  user_id: string;
  fusha_id: string;
  bashkia_id: string;
  status_id: string;
  assigned_ekspert_id?: string;
  fusha?: { label: string };
  bashkia?: { label: string };
  status?: { label: string };
  dokumente?: any;
}

const AplikimeteMia = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchUserApplications();
    }
  }, [user, loading, navigate]);

  const fetchUserApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          fusha:fusha_id (label),
          bashkia:bashkia_id (label),
          status:status_id (label)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: "Gabim",
          description: "Nuk u arrit të ngarkohen aplikimet.",
          variant: "destructive",
        });
        return;
      }

      setApplications(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'i ri':
        return 'default';
      case 'në shqyrtim':
        return 'secondary';
      case 'miratuar':
        return 'default';
      case 'refuzuar':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailOpen(true);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
      <header className="border-b bg-primary text-primary-foreground sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl text-primary-foreground/80 font-bold">
              <a href="/">Gjenerata e Inovacionit</a>
            </h1>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/')}
            size="sm"
          >
            Kryefaqja
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Aplikimet e Mia</h1>
            <p className="text-muted-foreground mt-2">
              Këtu mund të shikoni të gjitha aplikimet që keni dorëzuar
            </p>
          </div>
          <Button onClick={() => navigate('/')} className="gap-2">
            <Plus className="h-4 w-4" />
            Aplikim i Ri
          </Button>
        </div>

        {applications.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-4">
              <div className="text-6xl">📄</div>
              <h3 className="text-xl font-semibold">Ende nuk keni dorëzuar asnjë ide</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Klikoni butonin më poshtë për të nisur një aplikim të ri dhe të ndani idenë tuaj inovative.
              </p>
              <Button onClick={() => navigate('/')} className="gap-2">
                <Plus className="h-4 w-4" />
                Aplikim i Ri
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Card>
                <CardHeader>
                  <CardTitle>Të Gjitha Aplikimet ({applications.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titulli i Projektit</TableHead>
                        <TableHead>Tema/Fusha</TableHead>
                        <TableHead>Bashkia</TableHead>
                        <TableHead>Data e Dorëzimit</TableHead>
                        <TableHead>Statusi</TableHead>
                        <TableHead>Veprime</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">
                            {application.titulli}
                          </TableCell>
                          <TableCell>{application.fusha?.label}</TableCell>
                          <TableCell>{application.bashkia?.label}</TableCell>
                          <TableCell>{formatDate(application.created_at)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(application.status?.label)}>
                              {application.status?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(application)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Shiko Detaje
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-sm leading-tight">
                          {application.titulli}
                        </h3>
                        <Badge 
                          variant={getStatusBadgeVariant(application.status?.label)}
                          className="text-xs"
                        >
                          {application.status?.label}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div><strong>Fusha:</strong> {application.fusha?.label}</div>
                        <div><strong>Bashkia:</strong> {application.bashkia?.label}</div>
                        <div><strong>Data:</strong> {formatDate(application.created_at)}</div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(application)}
                        className="w-full gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Shiko Detaje
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Application Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <ApplicationCardBase
              application={selectedApplication}
              commentPermissions={{
                canView: false,
                canWrite: false,
                role: 'user'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AplikimeteMia;