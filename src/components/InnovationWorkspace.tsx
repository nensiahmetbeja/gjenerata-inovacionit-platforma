import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FushaDropdown } from '@/components/filters/FushaDropdown';
import { BashkiaDropdown } from '@/components/filters/BashkiaDropdown';
import { 
  Upload, 
  X, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Send,
  Lightbulb,
  Users,
  MapPin,
  Sparkles
} from 'lucide-react';

const formSchema = z.object({
  titulli: z.string().min(10, 'Titulli duhet të ketë të paktën 10 karaktere'),
  pershkrimi: z.string().min(100, 'Përshkrimi duhet të ketë të paktën 100 karaktere'),
  fusha_id: z.string().min(1, 'Zgjidhni një fushë'),
  grupmosha: z.string().min(1, 'Zgjidhni grupmoshën'),
  bashkia_id: z.string().min(1, 'Zgjidhni bashkinë'),
  prototip_url: z.string().url('URL i pavlefshëm').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface FileUpload {
  file: File;
  id: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
}

interface InnovationWorkspaceProps {
  onSubmissionSuccess: (data: any) => void;
}

export const InnovationWorkspace = ({ onSubmissionSuccess }: InnovationWorkspaceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [fushaOptions, setFushaOptions] = useState<{ id: string; label: string }[]>([]);
  const [bashkiaOptions, setBashkiaOptions] = useState<{ id: string; label: string }[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulli: '',
      pershkrimi: '',
      fusha_id: '',
      grupmosha: '',
      bashkia_id: '',
      prototip_url: '',
    },
  });

  const grupmoshaOptions = [
    { value: 'Nxënës (15-18 vjeç)', label: 'Nxënës (15-18 vjeç)' },
    { value: 'Studentë (19-24 vjeç)', label: 'Studentë (19-24 vjeç)' },
    { value: 'Profesionistë (25-29 vjeç)', label: 'Profesionistë (25-29 vjeç)' },
  ];

  const steps = [
    { 
      id: 1, 
      title: 'Informacioni i Idese', 
      icon: Lightbulb,
      description: 'Tregoni për idenë tuaj' 
    },
    { 
      id: 2, 
      title: 'Detaje të Aplikantit dhe Ndikimi', 
      icon: Users,
      description: 'Kategoria dhe target grupet' 
    },
    { 
      id: 3, 
      title: 'Prezantimi dhe Dokumente', 
      icon: FileText,
      description: 'Materialet mbështetëse' 
    },
  ];

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [fushaData, bashkiaData] = await Promise.all([
          supabase.from('fusha').select('id, label'),
          supabase.from('bashkia').select('id, label')
        ]);

        if (fushaData.data) setFushaOptions(fushaData.data);
        if (bashkiaData.data) setBashkiaOptions(bashkiaData.data);
      } catch (error) {
        toast({
          title: 'Gabim',
          description: 'Nuk u arrit të ngarkohen të dhënat',
          variant: 'destructive',
        });
      }
    };

    fetchOptions();
  }, [toast]);

  const calculateProgress = () => {
    const watchedFields = form.watch();
    const step1Fields = ['titulli', 'pershkrimi'];
    const step2Fields = ['fusha_id', 'grupmosha', 'bashkia_id'];
    const step3Fields = ['prototip_url'];
    
    const step1Complete = step1Fields.every(field => watchedFields[field as keyof FormData] && watchedFields[field as keyof FormData].length > 0);
    const step2Complete = step2Fields.every(field => watchedFields[field as keyof FormData] && watchedFields[field as keyof FormData].length > 0);
    const step3Complete = uploadedFiles.some(f => f.uploaded) || (watchedFields.prototip_url && watchedFields.prototip_url.length > 0);
    
    let completedSteps = 0;
    if (step1Complete) completedSteps++;
    if (step2Complete) completedSteps++;
    if (step3Complete) completedSteps++;
    
    return (completedSteps / 3) * 100;
  };

  const handleFileUpload = async (files: FileList) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/quicktime',
      'video/mp4'
    ];

    for (let i = 0; i < files.length && uploadedFiles.length < 5; i++) {
      const file = files[i];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Tip dosje i papranuar',
          description: 'Lejohen vetëm DOC, DOCX, PPT, PPTX, PDF, MOV, MP4',
          variant: 'destructive',
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Dosja shumë e madhe',
          description: 'Madhësia maksimale është 10MB',
          variant: 'destructive',
        });
        continue;
      }

      const fileUpload: FileUpload = {
        file,
        id: Math.random().toString(36).substr(2, 9),
        uploading: true,
        uploaded: false,
      };

      setUploadedFiles(prev => [...prev, fileUpload]);

      try {
        const fileName = `${user?.id}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from('applications')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('applications')
          .getPublicUrl(fileName);

        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileUpload.id 
              ? { ...f, uploading: false, uploaded: true, url: publicUrl }
              : f
          )
        );

        toast({
          title: 'Sukses',
          description: 'Dokumenti u ngarkua me sukses',
        });
      } catch (error) {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileUpload.id));
        toast({
          title: 'Gabim',
          description: 'Dështoi ngarkimi i dokumentit',
          variant: 'destructive',
        });
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const saveDraft = async () => {
    setIsDraft(true);
    toast({
      title: 'Draft u ruajt',
      description: 'Mund të vazhdoni më vonë',
    });
    setTimeout(() => setIsDraft(false), 2000);
  };

  const nextStep = async () => {
    const currentStepFields = getCurrentStepFields();
    const isValid = await form.trigger(currentStepFields);
    
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentStepFields = () => {
    switch (currentStep) {
      case 1:
        return ['titulli', 'pershkrimi'] as (keyof FormData)[];
      case 2:
        return ['fusha_id', 'grupmosha', 'bashkia_id'] as (keyof FormData)[];
      case 3:
        return ['prototip_url'] as (keyof FormData)[];
      default:
        return [] as (keyof FormData)[];
    }
  };

  const isStepValid = () => {
    const currentStepFields = getCurrentStepFields();
    const watchedFields = form.watch();
    
    switch (currentStep) {
      case 1:
        return watchedFields.titulli?.length >= 10 && watchedFields.pershkrimi?.length >= 100;
      case 2:
        return watchedFields.fusha_id && watchedFields.grupmosha && watchedFields.bashkia_id;
      case 3:
        return uploadedFiles.some(f => f.uploaded) || (watchedFields.prototip_url && watchedFields.prototip_url.length > 0);
      default:
        return false;
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: 'Gabim',
        description: 'Duhet të jeni të kyçur',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: statusData } = await supabase
        .from('status')
        .select('id')
        .eq('label', 'I Ri')
        .single();

      if (!statusData) {
        throw new Error('Status not found');
      }

      const dokumente = uploadedFiles
        .filter(f => f.uploaded && f.url)
        .map(f => ({
          name: f.file.name,
          url: f.url,
          type: f.file.type,
          size: f.file.size,
        }));

      const { data: applicationData, error: applicationError } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          titulli: data.titulli,
          pershkrimi: data.pershkrimi,
          fusha_id: data.fusha_id,
          grupmosha: data.grupmosha,
          bashkia_id: data.bashkia_id,
          prototip_url: data.prototip_url || null,
          dokumente: dokumente.length > 0 ? dokumente : null,
          status_id: statusData.id,
        })
        .select()
        .single();

      if (applicationError) throw applicationError;

      const { error: historyError } = await supabase
        .from('status_history')
        .insert({
          application_id: applicationData.id,
          status_id: statusData.id,
          changed_by: user.id,
          comment: 'Aplikimi u dorëzua',
        });

      if (historyError) throw historyError;

      toast({
        title: 'Sukses!',
        description: 'Aplikimi juaj u dorëzua me sukses',
      });

      onSubmissionSuccess(applicationData);
      form.reset();
      setUploadedFiles([]);
      setCurrentStep(1);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Gabim',
        description: 'Dështoi dorëzimi i aplikimit',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Lightbulb className="mx-auto h-12 w-12 text-accent mb-3" />
              <h3 className="text-xl font-semibold text-primary mb-2">Informacioni i Idese</h3>
              <p className="text-muted-foreground">Tregoni për idenë tuaj inovative</p>
            </div>

            <FormField
              control={form.control}
              name="titulli"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Titulli i projektit * (min. 10 shkronja)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="P.sh. Aplikacion për të ndihmuar nxënësit në zgjedhjen e karrierës..." 
                      className="h-12 text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pershkrimi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Përshkrimi i projektit * (min. 100 fjalë)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Përshkruani idenë ose projektin tuaj me detaje. Tregoni problemin që zgjidhni, sesi funksionon ideja juaj dhe çfarë ndikimi do të ketë..." 
                      className="min-h-[150px] text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-sm text-muted-foreground">
                    {field.value.length}/100 karaktere (minimum)
                  </div>
                  {field.value.length >= 50 && field.value.length < 100 && (
                    <p className="text-sm text-accent">💡 Shto më shumë detaje për të kompletuar këtë hap</p>
                  )}
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Users className="mx-auto h-12 w-12 text-accent mb-3" />
              <h3 className="text-xl font-semibold text-primary mb-2">Detaje të aplikantit dhe ndikimi</h3>
              <p className="text-muted-foreground">Specifikoni kategorinë dhe target grupet</p>
            </div>

            <FormField
              control={form.control}
              name="fusha_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Tema/Fusha *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FushaDropdown 
                        value={field.value || ''} 
                        onValueChange={field.onChange}
                        placeholder="Zgjidhni fushën ku përshtatet ideja juaj"
                        showAll={false}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grupmosha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Grupmosha *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Zgjidhni grupmoshën tuaj" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nxënës (15-18 vjeç)">Nxënës (15-18 vjeç)</SelectItem>
                          <SelectItem value="Studentë (19-24 vjeç)">Studentë (19-24 vjeç)</SelectItem>
                          <SelectItem value="Profesionistë (25-29 vjeç)">Profesionistë (25-29 vjeç)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bashkia_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Bashkia *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <BashkiaDropdown 
                        value={field.value || ''} 
                        onValueChange={field.onChange}
                        placeholder="Zgjidhni bashkinë ku jetoni"
                        showAll={false}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="mx-auto h-12 w-12 text-accent mb-3" />
              <h3 className="text-xl font-semibold text-primary mb-2">Prezantimi dhe Dokumente</h3>
              <p className="text-muted-foreground">Ngarkoni materialet mbështetëse</p>
            </div>

            <FormField
              control={form.control}
              name="prototip_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">URL prezantimi/prototipi (opsionale)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://... (lidhje drejt prezantimit, video, prototip)" 
                      className="h-12 text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="text-base font-medium">Ngarkim Dokumentesh</h4>
              <div className="border-2 border-dashed border-accent/30 rounded-xl p-8 bg-accent/5">
                <div className="text-center">
                  <Upload className="mx-auto h-16 w-16 text-accent/60 mb-4" />
                  <p className="text-base font-medium text-foreground mb-2">
                    Ngarkoni deri në 5 dokumente
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    DOC, DOCX, PPT, PPTX, PDF, MOV, MP4 (max 10MB secili)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="btn-institutional text-black"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Zgjidhni dokumentet
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".doc,.docx,.ppt,.pptx,.pdf,.mov,.mp4"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  />
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-medium">Dokumentet e ngarkuara:</h5>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="institutional-card flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-medium">{file.file.name}</p>
                          <div className="flex items-center gap-2">
                            {file.uploading && <span className="text-sm text-muted-foreground">Po ngarkohet...</span>}
                            {file.uploaded && <Badge variant="secondary" className="status-badge status-miratuar">✓ U ngarkua</Badge>}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            Mirë se vini!
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Kjo platformë është krijuar për t’ju ndihmuar të sillni idetë tuaja më të mira në shërbim të publikut.
Aplikoni, informohuni dhe përdorni mjetet në dispozicion për ta zhvilluar më tej projektin tuaj.

        </p>
      </div>

      {/* Progress Section */}
      <Card className="institutional-card mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-muted-foreground">Përparimi i Aplikimit</span>
            <span className="text-sm font-medium text-primary">{Math.round(calculateProgress())}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-3 mb-6" />
          
          {/* Step Indicators */}
          <div className="flex justify-between">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep || (step.id === currentStep && isStepValid());
              
              return (
                <div key={step.id} className={`flex flex-col items-center ${isActive ? 'text-primary' : isCompleted ? 'text-accent' : 'text-muted-foreground'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2 transition-all duration-200 ${
                    isActive ? 'border-primary bg-primary/10' : 
                    isCompleted ? 'border-accent bg-accent/10' : 
                    'border-muted-foreground/30'
                  }`}>
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card className="institutional-card">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <div className="flex gap-2">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Kthehu
                    </Button>
                  )}
                </div>

                <div className="flex-1" />

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className="btn-institutional flex items-center gap-2"
                  >
                    Vazhdoni
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isStepValid()}
                    className="btn-institutional flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Po dorëzohet...' : 'Dërgo Aplikimin'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};