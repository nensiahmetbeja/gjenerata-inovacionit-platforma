import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { InfoSection } from '@/components/InfoSection';
import { SubmissionForm } from '@/components/SubmissionForm';
import { SubmissionSummary } from '@/components/SubmissionSummary';

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
        <p className="text-xl text-muted-foreground">Po ngarkohet...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-primary">Gjenerata e Inovacionit</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Mirëseardhje, {user.user_metadata?.emri} {user.user_metadata?.mbiemri}
            </span>
            <Button onClick={signOut} variant="outline" size="sm">
              Dil
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!showSummary ? (
          <>
            <InfoSection />
            <SubmissionForm onSubmissionSuccess={handleSubmissionSuccess} />
          </>
        ) : (
          <div id="submission-summary">
            <SubmissionSummary submission={submissionData} />
            <div className="text-center">
              <Button onClick={handleNewSubmission} variant="outline" size="lg">
                Dorëzoni një aplikim të ri
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
