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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Upload, X, FileText } from 'lucide-react';

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

export const SubmissionForm = ({ onSubmissionSuccess }: { onSubmissionSuccess: (data: any) => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    const watchedFields = form.watch();
    const filledFields = Object.values(watchedFields).filter(value => value && value.length > 0).length;
    const totalFields = Object.keys(watchedFields).length;
    setProgress((filledFields / totalFields) * 100);
  }, [form.watch()]);

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

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
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
      // Get "I Ri" status ID
      const { data: statusData } = await supabase
        .from('status')
        .select('id')
        .eq('label', 'I Ri')
        .single();

      if (!statusData) {
        throw new Error('Status not found');
      }

      // Prepare documents data
      const dokumente = uploadedFiles
        .filter(f => f.uploaded && f.url)
        .map(f => ({
          name: f.file.name,
          url: f.url,
          type: f.file.type,
          size: f.file.size,
        }));

      // Create application
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

      // Create initial status history entry
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
      setProgress(0);
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

  return (
    <section className="mb-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Dorëzoni Aplikimin Tuaj</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Përparimi</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informacioni Bazë</h3>
                
                <FormField
                  control={form.control}
                  name="titulli"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titulli i Projektit *</FormLabel>
                      <FormControl>
                        <Input placeholder="Shkruani titullin e projektit tuaj..." {...field} />
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
                      <FormLabel>Përshkrimi i Idese/Projektit * (min. 100 karaktere)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Përshkruani idenë ose projektin tuaj me detaje..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="text-sm text-muted-foreground">
                        {field.value.length}/100 karaktere (minimum)
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Categories and Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Detajet e Aplikimit</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fusha_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tema/Fusha e Inovacionit *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Zgjidhni fushën" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fushaOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="grupmosha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grupmosha e Aplikantit *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Zgjidhni grupmoshën" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {grupmoshaOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bashkia_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bashkia *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Zgjidhni bashkinë" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bashkiaOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prototip_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL prezantimi/prototipi (opsionale)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ngarkim Dokumentesh</h3>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-2">
                      Ngarkoni deri në 5 dokumente (DOC, DOCX, PPT, PPTX, PDF, MOV, MP4)
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Madhësia maksimale për çdo dokument: 10MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
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
                  <div className="space-y-2">
                    <h4 className="font-medium">Dokumentet e ngarkuara:</h4>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.file.name}</span>
                          {file.uploading && <span className="text-xs text-muted-foreground">Po ngarkohet...</span>}
                          {file.uploaded && <span className="text-xs text-green-600">✓ U ngarkua</span>}
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

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Po dorëzohet...' : 'Dorëzoni Aplikimin'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
};