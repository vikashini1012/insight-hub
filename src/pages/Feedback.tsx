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
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Filter,
  MessageSquare,
  Trash2,
  Loader2,
} from 'lucide-react';

interface Feedback {
  id: string;
  content: string;
  sentiment: string | null;
  category: string | null;
  created_at: string;
  source_id: string | null;
  feedback_sources?: { name: string } | null;
}

interface FeedbackSource {
  id: string;
  name: string;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [sources, setSources] = useState<FeedbackSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');

  // Form state
  const [newContent, setNewContent] = useState('');
  const [newSourceId, setNewSourceId] = useState<string>('');
  const [newCategory, setNewCategory] = useState('');

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchFeedback();
      fetchSources();
    }
  }, [user]);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          feedback_sources (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_sources')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setSources(data || []);
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  };

  const handleSubmit = async () => {
    if (!newContent.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter feedback content',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user?.id,
        content: newContent,
        source_id: newSourceId || null,
        category: newCategory || null,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Feedback added successfully',
      });

      setNewContent('');
      setNewSourceId('');
      setNewCategory('');
      setIsDialogOpen(false);
      fetchFeedback();
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
      const { error } = await supabase.from('feedback').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Feedback removed successfully',
      });
      fetchFeedback();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch = item.content
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSource =
      filterSource === 'all' || item.source_id === filterSource;
    return matchesSearch && matchesSource;
  });

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-success/10 text-success';
      case 'negative':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feedback</h1>
          <p className="text-muted-foreground mt-1">
            Collect and manage user feedback
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Feedback Content</Label>
                <Textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Enter the feedback..."
                  rows={4}
                  className="input-focus"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source (optional)</Label>
                  <Select value={newSourceId} onValueChange={setNewSourceId}>
                    <SelectTrigger className="input-focus">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category (optional)</Label>
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g., UI, Performance"
                    className="input-focus"
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Add Feedback'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feedback..."
            className="pl-10 input-focus"
          />
        </div>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-full sm:w-48 input-focus">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((source) => (
              <SelectItem key={source.id} value={source.id}>
                {source.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredFeedback.length === 0 ? (
        <Card className="card-elevated">
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No feedback found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterSource !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your first feedback'}
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Feedback
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFeedback.map((item, index) => (
            <Card
              key={item.id}
              className="card-elevated animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">{item.content}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {item.feedback_sources?.name && (
                        <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                          {item.feedback_sources.name}
                        </span>
                      )}
                      {item.category && (
                        <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                          {item.category}
                        </span>
                      )}
                      {item.sentiment && (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                            item.sentiment
                          )}`}
                        >
                          {item.sentiment}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
