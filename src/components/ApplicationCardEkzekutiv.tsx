import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ApplicationCardBase from './ApplicationCardBase';
import { toast } from "@/hooks/use-toast";

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

export default function ApplicationCardEkzekutiv() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

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
      toast({
        title: "Gabim gjatë ngarkimit",
        description: "Ka ndodhur një gabim gjatë ngarkimit të aplikimeve",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Duke ngarkuar aplikimet...</p>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Nuk ka aplikime për të shfaqur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Menaxhimi i Aplikimeve</h2>
        <p className="text-muted-foreground">
          Menaxho statusin, cakto ekspertë dhe shto komente për aplikimet.
        </p>
      </div>
      
      {applications.map((application) => (
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
          onUpdate={fetchApplications}
        />
      ))}
    </div>
  );
}