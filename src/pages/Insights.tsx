import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  Trash2,
  Loader2,
  Lightbulb,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface Insight {
  id: string;
  title: string;
  summary: string;
  key_themes: string[];
  recommendations: string[];
  feedback_count: number;
  created_at: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(0);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchInsights();
      fetchFeedbackCount();
    }
  }, [user]);

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const parsedInsights: Insight[] = (data || []).map(insight => ({
        id: insight.id,
        title: insight.title,
        summary: insight.summary,
        feedback_count: insight.feedback_count || 0,
        created_at: insight.created_at,
        key_themes: Array.isArray(insight.key_themes) 
          ? (insight.key_themes as string[]) 
          : [],
        recommendations: Array.isArray(insight.recommendations) 
          ? (insight.recommendations as string[]) 
          : [],
      }));
        ...insight,
        key_themes: Array.isArray(insight.key_themes) ? insight.key_themes : [],
        recommendations: Array.isArray(insight.recommendations) ? insight.recommendations : [],
      }));
      
      setInsights(parsedInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackCount = async () => {
    const { count } = await supabase
      .from('feedback')
      .select('id', { count: 'exact', head: true });
    setFeedbackCount(count || 0);
  };

  const generateInsights = async () => {
    if (feedbackCount === 0) {
      toast({
        title: 'No feedback available',
        description: 'Add some feedback first to generate insights',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    try {
      // Fetch all feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('content, category, sentiment')
        .limit(100);

      if (feedbackError) throw feedbackError;

      // Call the AI edge function
      const response = await supabase.functions.invoke('generate-insights', {
        body: { feedback: feedbackData },
      });

      if (response.error) throw response.error;

      const { title, summary, key_themes, recommendations } = response.data;

      // Save the insight
      const { error: insertError } = await supabase.from('insights').insert({
        user_id: user?.id,
        title,
        summary,
        key_themes,
        recommendations,
        feedback_count: feedbackData?.length || 0,
      });

      if (insertError) throw insertError;

      toast({
        title: 'Insights generated!',
        description: 'AI has analyzed your feedback and generated new insights',
      });

      fetchInsights();
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: 'Error generating insights',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('insights').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Insight removed successfully',
      });
      fetchInsights();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Insights</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered analysis of your feedback
          </p>
        </div>
        <Button
          onClick={generateInsights}
          disabled={generating || feedbackCount === 0}
          className="gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Insights
            </>
          )}
        </Button>
      </div>

      {/* Info banner */}
      {feedbackCount === 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-warning" />
            <p className="text-sm text-foreground">
              Add feedback to enable AI insights generation
            </p>
          </CardContent>
        </Card>
      )}

      {/* Insights List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : insights.length === 0 ? (
        <Card className="card-elevated">
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No insights yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Generate AI-powered insights from your feedback
            </p>
            <Button
              onClick={generateInsights}
              disabled={generating || feedbackCount === 0}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Insights
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {insights.map((insight, index) => (
            <Card
              key={insight.id}
              className="card-elevated animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mt-1">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{insight.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on {insight.feedback_count} feedback items •{' '}
                        {new Date(insight.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(insight.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div>
                  <p className="text-foreground leading-relaxed">
                    {insight.summary}
                  </p>
                </div>

                {/* Key Themes */}
                {insight.key_themes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-warning" />
                      <h4 className="font-medium text-foreground">Key Themes</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {insight.key_themes.map((theme, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {insight.recommendations.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <h4 className="font-medium text-foreground">
                        Recommendations
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {insight.recommendations.map((rec, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-muted-foreground"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
