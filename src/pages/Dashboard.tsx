import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  FolderOpen,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface DashboardStats {
  totalFeedback: number;
  totalSources: number;
  totalInsights: number;
  recentFeedback: Array<{
    id: string;
    content: string;
    created_at: string;
    source_name?: string;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFeedback: 0,
    totalSources: 0,
    totalInsights: 0,
    recentFeedback: [],
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [feedbackRes, sourcesRes, insightsRes, recentRes] = await Promise.all([
        supabase.from('feedback').select('id', { count: 'exact', head: true }),
        supabase.from('feedback_sources').select('id', { count: 'exact', head: true }),
        supabase.from('insights').select('id', { count: 'exact', head: true }),
        supabase
          .from('feedback')
          .select(`
            id,
            content,
            created_at,
            feedback_sources (name)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalFeedback: feedbackRes.count || 0,
        totalSources: sourcesRes.count || 0,
        totalInsights: insightsRes.count || 0,
        recentFeedback: recentRes.data?.map((f: any) => ({
          id: f.id,
          content: f.content,
          created_at: f.created_at,
          source_name: f.feedback_sources?.name,
        })) || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Feedback',
      value: stats.totalFeedback,
      icon: MessageSquare,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      href: '/feedback',
    },
    {
      title: 'Feedback Sources',
      value: stats.totalSources,
      icon: FolderOpen,
      color: 'text-info',
      bgColor: 'bg-info/10',
      href: '/sources',
    },
    {
      title: 'AI Insights',
      value: stats.totalInsights,
      icon: Sparkles,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      href: '/insights',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your feedback.
          </p>
        </div>
        <Button onClick={() => navigate('/feedback')} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Feedback
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="card-elevated cursor-pointer hover:shadow-md transition-all group"
            onClick={() => navigate(stat.href)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                View all
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Feedback & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Feedback */}
        <Card className="lg:col-span-2 card-elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Feedback</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/feedback')}
              className="text-muted-foreground hover:text-primary"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : stats.recentFeedback.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No feedback yet</p>
                <Button
                  variant="link"
                  onClick={() => navigate('/feedback')}
                  className="mt-2"
                >
                  Add your first feedback
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => navigate('/feedback')}
                  >
                    <p className="text-sm text-foreground line-clamp-2">
                      {feedback.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {feedback.source_name && (
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {feedback.source_name}
                        </span>
                      )}
                      <span>
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => navigate('/feedback')}
            >
              <MessageSquare className="w-5 h-5 text-primary" />
              Add New Feedback
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => navigate('/sources')}
            >
              <FolderOpen className="w-5 h-5 text-info" />
              Create Source
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => navigate('/insights')}
            >
              <Sparkles className="w-5 h-5 text-warning" />
              Generate Insights
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
