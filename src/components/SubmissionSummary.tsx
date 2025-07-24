import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink, FileText, User, MapPin, Calendar } from 'lucide-react';

interface SubmissionData {
  id: string;
  titulli: string;
  pershkrimi: string;
  grupmosha: string;
  prototip_url?: string;
  dokumente?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  created_at: string;
}

export const SubmissionSummary = ({ submission }: { submission: SubmissionData | null }) => {
  if (!submission) {
    return null;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          Faleminderit! Aplikimi juaj u dorëzua me sukses.
        </h2>
        <p className="text-muted-foreground">
          Do të njoftoheni për hapat e mëtejshëm nëpërmjet email-it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Përmbledhja e Aplikimit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Informacioni Bazë
            </h3>
            <div className="space-y-3 pl-6">
              <div>
                <span className="font-medium">Titulli i Projektit:</span>
                <p className="text-muted-foreground mt-1">{submission.titulli}</p>
              </div>
              <div>
                <span className="font-medium">Përshkrimi:</span>
                <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{submission.pershkrimi}</p>
              </div>
              <div>
                <span className="font-medium">Grupmosha:</span>
                <Badge variant="secondary" className="ml-2">{submission.grupmosha}</Badge>
              </div>
            </div>
          </div>

          {/* Submission Details */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Detajet e Dorëzimit
            </h3>
            <div className="space-y-2 pl-6">
              <div>
                <span className="font-medium">ID e Aplikimit:</span>
                <code className="ml-2 px-2 py-1 bg-muted rounded text-sm">{submission.id}</code>
              </div>
              <div>
                <span className="font-medium">Data e Dorëzimit:</span>
                <span className="ml-2 text-muted-foreground">{formatDate(submission.created_at)}</span>
              </div>
              <div>
                <span className="font-medium">Statusi:</span>
                <Badge variant="outline" className="ml-2">I Ri</Badge>
              </div>
            </div>
          </div>

          {/* Prototype URL */}
          {submission.prototip_url && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Lidhje e Prototipoit
              </h3>
              <div className="pl-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(submission.prototip_url, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Shiko Prototipin
                </Button>
              </div>
            </div>
          )}

          {/* Documents */}
          {submission.dokumente && submission.dokumente.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Dokumentet e Ngarkuara
              </h3>
              <div className="space-y-2 pl-6">
                {submission.dokumente.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Shiko
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Hapat e Ardhshëm</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Do të merrni një email konfirmimi brenda 24 orëve</li>
              <li>• Ekipi ynë do të shqyrtojë aplikimin tuaj brenda 7 ditëve</li>
              <li>• Do të njoftoheni për statusin e aplikimit nëpërmjet email-it</li>
              <li>• Mund të kontaktoni me ne nëse keni pyetje shtesë</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};