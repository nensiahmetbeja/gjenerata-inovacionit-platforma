import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, User, Download, Edit2, Trash2, Check, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/hooks/use-toast";

interface ApplicationData {
  id: string;
  titulli: string;
  pershkrimi: string;
  grupmosha: string;
  prototip_url?: string;
  dokumente?: any[];
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

interface CommentPermissions {
  canView: boolean;
  canWrite: boolean;
  role: string;
}

interface ApplicationCardBaseProps {
  application: ApplicationData;
  canEditStatus?: boolean;
  canAssignEkspert?: boolean;
  commentPermissions?: CommentPermissions;
  onUpdate?: () => void;
}

interface ApplicationNote {
  id: string;
  content: string;
  note_type: string;
  role: string;
  created_by: string;
  created_at: string;
  profiles?: { emri: string; mbiemri: string };
}

export default function ApplicationCardBase({
  application,
  canEditStatus = false,
  canAssignEkspert = false,
  commentPermissions = { canView: false, canWrite: false, role: '' },
  onUpdate
}: ApplicationCardBaseProps) {
  const { user } = useAuth();
  const [statusOptions, setStatusOptions] = useState<any[]>([]);
  const [ekspertOptions, setEkspertOptions] = useState<any[]>([]);
  const [comments, setComments] = useState<ApplicationNote[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  // Fetch status options
  useEffect(() => {
    const fetchStatusOptions = async () => {
      const { data } = await supabase
        .from('status')
        .select('*')
        .order('label');
      if (data) setStatusOptions(data);
    };
    if (canEditStatus) fetchStatusOptions();
  }, [canEditStatus]);

  // Fetch ekspert options
  useEffect(() => {
    const fetchEkspertOptions = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, emri, mbiemri')
        .eq('role', 'ekspert')
        .order('emri');
      if (data) setEkspertOptions(data);
    };
    if (canAssignEkspert) fetchEkspertOptions();
  }, [canAssignEkspert]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!commentPermissions.canView) return;
      
      const { data: notesData, error } = await supabase
        .from('application_notes' as any)
        .select('*')
        .eq('application_id', application.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for each note separately
      const commentsWithProfiles = await Promise.all(
        (notesData || []).map(async (note: any) => {
          if (note.created_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('emri, mbiemri')
              .eq('id', note.created_by)
              .single();
            
            return { ...note, profiles: profile };
          }
          return { ...note, profiles: null };
        })
      );

      setComments(commentsWithProfiles as unknown as ApplicationNote[]);
    };
    fetchComments();
  }, [application.id, commentPermissions.canView]);

  const handleStatusChange = async (newStatusId: string) => {
    setIsUpdatingStatus(true);
    try {
      // Update application status
      const { error: appError } = await supabase
        .from('applications')
        .update({ status_id: newStatusId } as any)
        .eq('id', application.id);

      if (appError) throw appError;

      // Add status history entry
      const { error: historyError } = await supabase
        .from('status_history')
        .insert({
          application_id: application.id,
          status_id: newStatusId,
          changed_by: user?.id,
          comment: `Statusi u ndryshua nga ${commentPermissions.role}`
        });

      if (historyError) throw historyError;

      toast({
        title: "Përditësuar me sukses",
        description: "Statusi u ndryshua me sukses"
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Gabim gjatë përditësimit",
        description: "Ka ndodhur një gabim gjatë përditësimit të statusit",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEkspertAssignment = async (ekspertId: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ assigned_ekspert_id: ekspertId } as any)
        .eq('id', application.id);

      if (error) throw error;

      toast({
        title: "Përditësuar me sukses",
        description: "Eksperti u caktua me sukses"
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error assigning ekspert:', error);
      toast({
        title: "Gabim gjatë përditësimit",
        description: "Ka ndodhur një gabim gjatë caktimit të ekspertit",
        variant: "destructive"
      });
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !commentPermissions.canWrite) return;
    
    setIsSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('application_notes' as any)
        .insert({
          application_id: application.id,
          content: newComment,
          note_type: 'internal',
          role: commentPermissions.role,
          created_by: user?.id
        });

      if (error) throw error;

      setNewComment('');
      toast({
        title: "Përditësuar me sukses",
        description: "Komenti u shtua me sukses"
      });

      // Refresh comments  
      const { data: notesData, error: fetchError } = await supabase
        .from('application_notes' as any)
        .select('*')
        .eq('application_id', application.id)
        .order('created_at', { ascending: false });
      
      if (!fetchError && notesData) {
        const commentsWithProfiles = await Promise.all(
          notesData.map(async (note: any) => {
            if (note.created_by) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('emri, mbiemri')
                .eq('id', note.created_by)
                .single();
              
              return { ...note, profiles: profile };
            }
            return { ...note, profiles: null };
          })
        );
        setComments(commentsWithProfiles as unknown as ApplicationNote[]);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Gabim gjatë përditësimit",
        description: "Ka ndodhur një gabim gjatë shtimit të komentit",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingCommentContent.trim()) return;
    
    try {
      const { error } = await supabase
        .from('application_notes' as any)
        .update({ content: editingCommentContent })
        .eq('id', commentId);

      if (error) throw error;

      setEditingCommentId(null);
      setEditingCommentContent('');
      
      toast({
        title: "Përditësuar me sukses",
        description: "Komenti u përditësua me sukses"
      });

      // Refresh comments
      const { data: notesData, error: fetchError } = await supabase
        .from('application_notes' as any)
        .select('*')
        .eq('application_id', application.id)
        .order('created_at', { ascending: false });
      
      if (!fetchError && notesData) {
        const commentsWithProfiles = await Promise.all(
          notesData.map(async (note: any) => {
            if (note.created_by) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('emri, mbiemri')
                .eq('id', note.created_by)
                .single();
              
              return { ...note, profiles: profile };
            }
            return { ...note, profiles: null };
          })
        );
        setComments(commentsWithProfiles as unknown as ApplicationNote[]);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Gabim gjatë përditësimit",
        description: "Ka ndodhur një gabim gjatë përditësimit të komentit",
        variant: "destructive"
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('application_notes' as any)
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Fshirë me sukses",
        description: "Komenti u fshi me sukses"
      });

      // Refresh comments
      const { data: notesData, error: fetchError } = await supabase
        .from('application_notes' as any)
        .select('*')
        .eq('application_id', application.id)
        .order('created_at', { ascending: false });
      
      if (!fetchError && notesData) {
        const commentsWithProfiles = await Promise.all(
          notesData.map(async (note: any) => {
            if (note.created_by) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('emri, mbiemri')
                .eq('id', note.created_by)
                .single();
              
              return { ...note, profiles: profile };
            }
            return { ...note, profiles: null };
          })
        );
        setComments(commentsWithProfiles as unknown as ApplicationNote[]);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Gabim gjatë fshirjes",
        description: "Ka ndodhur një gabim gjatë fshirjes së komentit",
        variant: "destructive"
      });
    }
  };

  const startEditingComment = (comment: ApplicationNote) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDocumentDownload = async (document: any) => {
    try {
      // Extract the path from the URL for Supabase storage download
      const urlParts = document.url.split('/object/public/applications/');
      if (urlParts.length !== 2) {
        throw new Error('Invalid document URL format');
      }
      
      const filePath = urlParts[1];
      
      const { data, error } = await supabase.storage
        .from('applications')
        .download(filePath);

      if (error) throw error;

      // Create a blob URL and trigger download
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Dokumenti u shkarkua",
        description: `${document.name} u shkarkua me sukses.`
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Gabim gjatë shkarkimit",
        description: "Ka ndodhur një gabim gjatë shkarkimit të dokumentit.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{application.titulli}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Përshkrimi i Idesë</h4>
            <p className="text-sm leading-relaxed">{application.pershkrimi}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Tema/Fusha e Inovacionit</h4>
              <Badge variant="secondary">{application.fusha?.label}</Badge>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Grupmosha</h4>
              <Badge variant="outline">{application.grupmosha}</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Bashkia</h4>
            <p className="text-sm">{application.bashkia?.label}</p>
          </div>

          {application.prototip_url && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">URL Prototipi</h4>
              <a 
                href={application.prototip_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Shiko Prototipin
              </a>
            </div>
          )}

          {application.dokumente && application.dokumente.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Dokumente</h4>
              <div className="space-y-2">
                {application.dokumente.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDocumentDownload(doc)}
                      className="shrink-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Status Section */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Statusi Aktual</h4>
            {canEditStatus ? (
              <Select 
                value={application.status_id} 
                onValueChange={handleStatusChange}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge>{application.status?.label}</Badge>
            )}
          </div>

          {canAssignEkspert && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Cakto Ekspert</h4>
              <Select 
                value={application.assigned_ekspert_id || ''} 
                onValueChange={handleEkspertAssignment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Zgjedh ekspertin" />
                </SelectTrigger>
                <SelectContent>
                  {ekspertOptions.map((ekspert) => (
                    <SelectItem key={ekspert.id} value={ekspert.id}>
                      {ekspert.emri} {ekspert.mbiemri}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Comments Section */}
        {commentPermissions.canView && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Komente</h4>
              
              {commentPermissions.canWrite && (
                <div className="space-y-2">
                  <Textarea
                    placeholder={`Shkruaj një koment si ${commentPermissions.role}...`}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button 
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim() || isSubmittingComment}
                    size="sm"
                  >
                    {isSubmittingComment ? "Duke shtuar..." : "Shto Koment"}
                  </Button>
                </div>
              )}

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 border rounded-md space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        {comment.profiles?.emri} {comment.profiles?.mbiemri}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {comment.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(comment.created_at).toLocaleDateString('sq-AL')} {new Date(comment.created_at).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {/* Edit/Delete buttons for own comments */}
                      {comment.created_by === user?.id && (
                        <div className="flex items-center gap-1 ml-2">
                          {editingCommentId === comment.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditComment(comment.id)}
                                disabled={!editingCommentContent.trim()}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEditingComment}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditingComment(comment)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <Textarea
                        value={editingCommentContent}
                        onChange={(e) => setEditingCommentContent(e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{comment.content}</p>
                    )}
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nuk ka komente ende.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}