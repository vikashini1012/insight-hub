import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Sparkles,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Collect Feedback',
    description: 'Gather user feedback from multiple sources and channels in one place',
  },
  {
    icon: TrendingUp,
    title: 'Organize & Filter',
    description: 'Categorize feedback by source, sentiment, and topic for easy analysis',
  },
  {
    icon: Sparkles,
    title: 'AI Insights',
    description: 'Let AI analyze patterns and generate actionable recommendations',
  },
];

const benefits = [
  'Centralized feedback collection',
  'AI-powered sentiment analysis',
  'Actionable product insights',
  'Team collaboration tools',
];

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">cloneio</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Sign in
            </Button>
            <Button onClick={() => navigate('/auth')}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            AI-Powered Feedback Analysis
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-slide-up">
            Turn user feedback into{' '}
            <span className="gradient-text">product insights</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Collect, organize, and analyze user feedback with AI. Discover what your users really want and make data-driven product decisions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Button size="lg" onClick={() => navigate('/auth')} className="h-12 px-8 text-base gap-2">
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="h-12 px-8 text-base">
              See demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to understand your users
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From collection to insights, cloneio helps you make sense of user feedback
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="card-elevated p-8 text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Build products your users love
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Stop guessing what your users want. cloneio helps you understand their needs, identify patterns, and prioritize features that matter.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8 gap-2" onClick={() => navigate('/auth')}>
                Get started now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center">
                <div className="w-full max-w-sm space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-card rounded-xl p-4 shadow-sm border border-border animate-slide-in-right"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10" />
                        <div className="h-3 bg-muted rounded w-24" />
                      </div>
                      <div className="h-3 bg-muted rounded w-full mb-2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-3xl gradient-bg p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Ready to understand your users?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join teams who use cloneio to collect feedback and make smarter product decisions.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/auth')}
              className="h-12 px-8 text-base gap-2"
            >
              Start collecting feedback
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">cloneio</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 cloneio.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
