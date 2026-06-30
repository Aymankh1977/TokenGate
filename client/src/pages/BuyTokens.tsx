import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Zap, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useEffect } from "react";

export default function BuyTokens() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const { data: packages, isLoading } = trpc.payments.getPackages.useQuery();
  const { mutate: createCheckout, isPending } = trpc.payments.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
        toast.success('Redirecting to payment page...');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create checkout session');
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      toast.success('Payment successful! Your tokens have been added to your account.');
      navigate('/dashboard');
    } else if (params.get('payment') === 'cancelled') {
      toast.error('Payment was cancelled.');
    }
  }, [navigate]);

  const handlePurchase = (packageId: string) => {
    createCheckout({ packageId });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="h-5 w-5 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Token-Oasis</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Buy AI Tokens</h2>
            <p className="text-lg text-muted-foreground">
              Choose a package and add tokens to your account. Use them to access any AI provider.
            </p>
          </div>

          {/* Packages Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {isLoading ? (
              <>
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
              </>
            ) : packages && packages.length > 0 ? (
              packages.map((pkg) => (
                <Card key={pkg.id} className="border-border hover:border-accent/50 transition-colors flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <CardDescription>
                      ${pkg.grantUsd.toFixed(2)} credit for ${pkg.price.toFixed(2)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="text-4xl font-bold text-accent mb-2">
                          ${pkg.grantUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-sm text-muted-foreground">in API credit</p>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-2xl font-bold">${pkg.price.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground">
                          {pkg.bonusPct > 0 ? `+${pkg.bonusPct}% bonus credit` : "no bonus"}
                        </p>
                      </div>

                      <div className="space-y-2 pt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-accent" />
                          <span>Instant activation</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-accent" />
                          <span>Use across all AI providers</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-accent" />
                          <span>No expiration</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={isPending}
                      className="w-full bg-accent hover:bg-accent/90"
                    >
                      {isPending ? 'Processing...' : 'Buy Now'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No packages available</p>
            )}
          </div>

          {/* Info Section */}
          <Card className="mt-12 bg-muted/50 border-border">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-accent-foreground font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Purchase Tokens</h4>
                  <p className="text-sm text-muted-foreground">Select a package and complete payment</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-accent-foreground font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Tokens Added Instantly</h4>
                  <p className="text-sm text-muted-foreground">Your balance updates immediately after payment</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-accent-foreground font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Start Using</h4>
                  <p className="text-sm text-muted-foreground">Generate an API key and integrate with your app</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
