import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { ApplicationStatusBadge } from "@/components/ui/application-status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import ApplicationCardBase from './ApplicationCardBase';
import { useIsMobile } from '@/hooks/use-mobile';

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
  assigned_ekspert?: { emri: string; mbiemri: string };
}

interface StatusOption {
  id: string;
  label: string;
}

interface EkspertOption {
  id: string;
  emri: string;
  mbiemri: string;
}

interface AplikimeTableProps {
  applications: Application[];
  onUpdate: () => void;
  statusOptions: StatusOption[];
  ekspertOptions: EkspertOption[];
  userRole?: string;
}


export default function AplikimeTable({ applications, onUpdate, statusOptions, ekspertOptions, userRole = 'ekzekutiv' }: AplikimeTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Sort applications
  const sortedApplications = [...applications].sort((a, b) => {
    let aValue: any = a[sortField as keyof Application];
    let bValue: any = b[sortField as keyof Application];

    // Handle nested objects
    if (sortField === 'fusha') {
      aValue = a.fusha?.label || '';
      bValue = b.fusha?.label || '';
    } else if (sortField === 'bashkia') {
      aValue = a.bashkia?.label || '';
      bValue = b.bashkia?.label || '';
    } else if (sortField === 'status') {
      aValue = a.status?.label || '';
      bValue = b.status?.label || '';
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = sortedApplications.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleStatusChange = async (applicationId: string, newStatusId: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status_id: newStatusId })
        .eq('id', applicationId);

      if (error) throw error;

      // Log status change
      await supabase
        .from('status_history')
        .insert({
          application_id: applicationId,
          status_id: newStatusId,
          changed_by: (await supabase.auth.getUser()).data.user?.id
        });

      toast({
        title: "Statusi u ndryshua",
        description: "Statusi i aplikimit u përditësua me sukses.",
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Gabim",
        description: "Ka ndodhur një gabim gjatë ndryshimit të statusit.",
        variant: "destructive"
      });
    }
  };

  const handleEkspertAssignment = async (applicationId: string, ekspertId: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ assigned_ekspert_id: ekspertId === 'unassign' ? null : ekspertId })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Eksperti u caktua",
        description: "Eksperti u caktua me sukses në aplikim.",
      });

      onUpdate();
    } catch (error) {
      console.error('Error assigning expert:', error);
      toast({
        title: "Gabim",
        description: "Ka ndodhur një gabim gjatë caktimit të ekspertit.",
        variant: "destructive"
      });
    }
  };

  const openApplicationDetail = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailOpen(true);
  };

  if (applications.length === 0) {
    return (
      <div className="text-center p-12 border-2 border-dashed border-muted rounded-lg">
        <p className="text-muted-foreground text-lg">Nuk ka aplikime për t'u shfaqur.</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Mobile Cards View */}
        {paginatedApplications.map((application) => (
          <Card key={application.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base line-clamp-2">{application.titulli}</CardTitle>
                <ApplicationStatusBadge statusId={application.status_id} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <strong>Bashkia:</strong> {application.bashkia?.label}
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Grupmosha:</strong> {application.grupmosha}
              </div>
              {userRole === 'ekzekutiv' && (
                <div className="text-sm text-muted-foreground">
                  <strong>Eksperti:</strong> {application.assigned_ekspert 
                    ? `${application.assigned_ekspert.emri} ${application.assigned_ekspert.mbiemri}`
                    : '–'
                  }
                </div>
              )}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <Eye className="w-4 h-4 mr-2" />
                    Shiko Detaje
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Detajet e Aplikimit</SheetTitle>
                  <SheetDescription>
                    {userRole === 'ekzekutiv' 
                      ? 'Menaxho statusin dhe ekspertin e caktuar për këtë aplikim.'
                      : 'Shiqo detajet dhe komento për këtë aplikim.'
                    }
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <ApplicationCardBase
                    application={application}
                    canEditStatus={userRole === 'ekzekutiv'}
                    canAssignEkspert={userRole === 'ekzekutiv'}
                    commentPermissions={{ 
                      canView: true, 
                      canWrite: true, 
                      role: userRole === 'ekzekutiv' ? 'ekzekutiv' : 'ekspert'
                    }}
                    onUpdate={onUpdate}
                  />
                  </div>
                </SheetContent>
              </Sheet>
            </CardContent>
          </Card>
        ))}

        {/* Mobile Pagination */}
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Faqja {currentPage} nga {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('titulli')} className="h-auto p-0 font-semibold">
                  Titulli i projektit
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('fusha')} className="h-auto p-0 font-semibold">
                  Fusha
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('bashkia')} className="h-auto p-0 font-semibold">
                  Bashkia
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('grupmosha')} className="h-auto p-0 font-semibold">
                  Grupmosha
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('status')} className="h-auto p-0 font-semibold">
                  Statusi Aktual
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              {userRole === 'ekzekutiv' && <TableHead>Eksperti i Caktuar</TableHead>}
              <TableHead className="text-center">Veprime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedApplications.map((application) => (
              <TableRow key={application.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="max-w-xs">
                  <div className="font-medium line-clamp-2">{application.titulli}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{application.fusha?.label}</Badge>
                </TableCell>
                <TableCell>{application.bashkia?.label}</TableCell>
                <TableCell>{application.grupmosha}</TableCell>
                <TableCell>
                  <ApplicationStatusBadge statusId={application.status_id} />
                </TableCell>
                {userRole === 'ekzekutiv' && (
                  <TableCell>
                    {application.assigned_ekspert 
                      ? `${application.assigned_ekspert.emri} ${application.assigned_ekspert.mbiemri}`
                      : '–'
                    }
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {userRole === 'ekzekutiv' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openApplicationDetail(application)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Shiko
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openApplicationDetail(application)}>
                              Shiko Detaje
                            </DropdownMenuItem>
                            
                            {/* Quick Status Change */}
                            {statusOptions.map((status) => (
                              <DropdownMenuItem
                                key={status.id}
                                onClick={() => handleStatusChange(application.id, status.id)}
                              >
                                Ndrysho në: {status.label}
                              </DropdownMenuItem>
                            ))}
                            
                            {/* Quick Expert Assignment */}
                            <DropdownMenuItem onClick={() => handleEkspertAssignment(application.id, 'unassign')}>
                              Hiq ekspertin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openApplicationDetail(application)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Shiko
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Shfaq</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            nga {applications.length} aplikime
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Faqja {currentPage} nga {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detajet e Aplikimit</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <ApplicationCardBase
              application={selectedApplication}
              canEditStatus={userRole === 'ekzekutiv'}
              canAssignEkspert={userRole === 'ekzekutiv'}
              commentPermissions={{ 
                canView: true, 
                canWrite: true, 
                role: userRole === 'ekzekutiv' ? 'ekzekutiv' : 'ekspert'
              }}
              onUpdate={() => {
                onUpdate();
                setIsDetailOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}