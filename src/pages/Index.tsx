import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { InnovationWorkspace } from '@/components/InnovationWorkspace';
import { ResourcesSidebar } from '@/components/ResourcesSidebar';
import { SubmissionSummary } from '@/components/SubmissionSummary';
import { LogOut } from 'lucide-react';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [submissionData, setSubmissionData] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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

  if (loading) {
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
      {/* Header */}
      <header className="border-b bg-primary text-primary-foreground sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl text-primary-foreground/80 font-bold">        
            <a href="/">
            Gjenerata e Inovacionit</a></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium">
                {user.user_metadata?.emri} {user.user_metadata?.mbiemri}
              </span>
              <span className="text-xs text-primary-foreground/80">Aplikant</span>
            </div>
            <Button 
              onClick={signOut} 
              variant="secondary" 
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Dil</span>
            </Button>
          </div>
        </div>
      </header>

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
            <p>© 2025x Gjenerata e Inovacionit. Një nismë për të ndryshuar të ardhmen.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
