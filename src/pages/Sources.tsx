import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  FolderOpen,
  Trash2,
  Edit2,
  Loader2,
  MessageSquare,
} from 'lucide-react';

interface FeedbackSource {
  id: string;
  name: string;
  description: string | null;
  source_type: string;
  created_at: string;
  feedback_count?: number;
}

const sourceTypes = [
  { value: 'product', label: 'Product' },
  { value: 'feature', label: 'Feature' },
  { value: 'page', label: 'Page' },
  { value: 'support', label: 'Support' },
  { value: 'survey', label: 'Survey' },
  { value: 'other', label: 'Other' },
];

export default function SourcesPage() {
  const [sources, setSources] = useState<FeedbackSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<FeedbackSource | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceType, setSourceType] = useState('product');

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSources();
    }
  }, [user]);

  const fetchSources = async () => {
    try {
      const { data: sourcesData, error: sourcesError } = await supabase
        .from('feedback_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (sourcesError) throw sourcesError;

      // Get feedback counts for each source
      const sourcesWithCounts = await Promise.all(
        (sourcesData || []).map(async (source) => {
          const { count } = await supabase
            .from('feedback')
            .select('id', { count: 'exact', head: true })
            .eq('source_id', source.id);
          return { ...source, feedback_count: count || 0 };
        })
      );

      setSources(sourcesWithCounts);
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setSourceType('product');
    setEditingSource(null);
  };

  const openEditDialog = (source: FeedbackSource) => {
    setEditingSource(source);
    setName(source.name);
    setDescription(source.description || '');
    setSourceType(source.source_type);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a source name',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingSource) {
        const { error } = await supabase
          .from('feedback_sources')
          .update({
            name,
            description: description || null,
            source_type: sourceType,
          })
          .eq('id', editingSource.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Source updated successfully',
        });
      } else {
        const { error } = await supabase.from('feedback_sources').insert({
          user_id: user?.id,
          name,
          description: description || null,
          source_type: sourceType,
        });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Source created successfully',
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchSources();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feedback_sources')
        .delete()
        .eq('id', id);
      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Source removed successfully',
      });
      fetchSources();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getSourceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      product: 'bg-primary/10 text-primary',
      feature: 'bg-info/10 text-info',
      page: 'bg-warning/10 text-warning',
      support: 'bg-success/10 text-success',
      survey: 'bg-secondary text-secondary-foreground',
      other: 'bg-muted text-muted-foreground',
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sources</h1>
          <p className="text-muted-foreground mt-1">
            Organize feedback by product areas, features, or pages
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSource ? 'Edit Source' : 'Create New Source'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Source Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Product Feedback"
                  className="input-focus"
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={sourceType} onValueChange={setSourceType}>
                  <SelectTrigger className="input-focus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What kind of feedback will this source collect?"
                  rows={3}
                  className="input-focus"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingSource ? (
                  'Update Source'
                ) : (
                  'Create Source'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sources Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-5 bg-muted rounded w-1/2 mb-3" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sources.length === 0 ? (
        <Card className="card-elevated">
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No sources yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create sources to organize your feedback
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((source, index) => (
            <Card
              key={source.id}
              className="card-elevated animate-slide-up group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">
                      {source.name}
                    </CardTitle>
                    <span
                      className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${getSourceTypeColor(
                        source.source_type
                      )}`}
                    >
                      {source.source_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(source)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(source.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {source.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {source.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span>{source.feedback_count} feedback items</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
