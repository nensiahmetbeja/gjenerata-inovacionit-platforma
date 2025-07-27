import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { InnovationWorkspace } from '@/components/InnovationWorkspace';
import { ResourcesSidebar } from '@/components/ResourcesSidebar';
import { SubmissionSummary } from '@/components/SubmissionSummary';
import { UserNavbar } from '@/components/UserNavbar';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const checkUserRoleAndRedirect = async () => {
      if (!loading && !user) {
        navigate('/auth');
        return;
      }

      if (user && !userRole) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
            setRoleLoading(false);
            return;
          }

          setUserRole(profile?.role);

          // Redirect admin users to their appropriate dashboards
          if (profile?.role === 'ekzekutiv') {
            navigate('/admin/dashboard-ekzekutiv');
            return;
          } else if (profile?.role === 'ekspert') {
            navigate('/admin/aplikimet');
            return;
          } else if (profile?.role === 'admin') {
            navigate('/admin/dashboard');
            return;
          }
          // If role is 'user' or null, allow access to this page
        } catch (error) {
          console.error('Error checking user role:', error);
        } finally {
          setRoleLoading(false);
        }
      }
    };

    checkUserRoleAndRedirect();
  }, [user, loading, navigate, userRole]);

  const handleSubmissionSuccess = (data: any) => {
    setSubmissionData(data);
    setShowSummary(true);
    // Scroll to summary
    setTimeout(() => {
      document.getElementById('submission-summary')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const handleNewSubmission = () => {
    setShowSummary(false);
    setSubmissionData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded-lg mx-auto"></div>
            <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
          </div>
          <p className="text-xl text-muted-foreground mt-4">Po ngarkohet...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <UserNavbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!showSummary ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <InnovationWorkspace onSubmissionSuccess={handleSubmissionSuccess} />
            </div>
            
            {/* Resources Sidebar */}
            <div className="lg:col-span-1">
              <ResourcesSidebar />
            </div>
          </div>
        ) : (
          <div id="submission-summary" className="max-w-4xl mx-auto">
            <SubmissionSummary submission={submissionData} />
            <div className="text-center mt-8">
              <Button 
                onClick={handleNewSubmission} 
                variant="outline" 
                size="lg"
                className="btn-institutional"
              >
                Dorëzoni një aplikim të ri
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center  text-sm text-muted-foreground">
            <p>© 2025 Gjenerata e Inovacionit. Një nismë për të ndryshuar të ardhmen.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
