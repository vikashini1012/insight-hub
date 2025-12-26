import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, ArrowRight, CheckCircle2 } from 'lucide-react';

const steps = [
  { id: 1, title: 'Company Details', description: 'Tell us about your organization' },
  { id: 2, title: 'First Source', description: 'Create your first feedback source' },
  { id: 3, title: 'All Set!', description: 'You\'re ready to collect feedback' },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sourceDescription, setSourceDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCompanySubmit = async () => {
    if (!companyName.trim()) return;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ company_name: companyName })
        .eq('user_id', user?.id);

      if (error) throw error;
      setCurrentStep(2);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSourceSubmit = async () => {
    if (!sourceName.trim()) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('feedback_sources')
        .insert({
          user_id: user?.id,
          name: sourceName,
          description: sourceDescription,
          source_type: 'product',
        });

      if (error) throw error;
      setCurrentStep(3);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarded: true })
        .eq('user_id', user?.id);

      if (error) throw error;
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted">
        <div
          className="h-full gradient-bg transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      <div className="container max-w-2xl mx-auto px-6 py-16">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentStep > step.id
                    ? 'bg-primary text-primary-foreground'
                    : currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 transition-colors ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="card-elevated p-8 animate-fade-in">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground">
                  {steps[0].title}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {steps[0].description}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company or Product Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Inc."
                  className="h-11 input-focus"
                />
              </div>

              <Button
                onClick={handleCompanySubmit}
                disabled={!companyName.trim() || loading}
                className="w-full h-11"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-foreground">
                  {steps[1].title}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {steps[1].description}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceName">Source Name</Label>
                  <Input
                    id="sourceName"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="e.g., Product Feedback, Feature Requests"
                    className="h-11 input-focus"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceDescription">Description (optional)</Label>
                  <Input
                    id="sourceDescription"
                    value={sourceDescription}
                    onChange={(e) => setSourceDescription(e.target.value)}
                    placeholder="What kind of feedback will this source collect?"
                    className="h-11 input-focus"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 h-11"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSourceSubmit}
                  disabled={!sourceName.trim() || loading}
                  className="flex-1 h-11"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  You're all set!
                </h1>
                <p className="text-muted-foreground mt-2">
                  Your workspace is ready. Start collecting feedback and generating insights.
                </p>
              </div>

              <Button
                onClick={completeOnboarding}
                disabled={loading}
                className="w-full h-11"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Go to Dashboard'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
