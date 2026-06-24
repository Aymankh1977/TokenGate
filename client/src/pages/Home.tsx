import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Zap, Shield, TrendingUp, Wallet, Key, BarChart3, ArrowRight } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const features = [
    {
      icon: Zap,
      title: "Seamless Token Access",
      description: "Purchase and manage AI tokens with a single, elegant interface. Pay once, use everywhere.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with encrypted API keys and comprehensive audit logs.",
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Track your token usage, spending, and API performance with detailed analytics.",
    },
    {
      icon: Wallet,
      title: "Multi-Payment Support",
      description: "Purchase tokens via credit card or cryptocurrency for maximum flexibility.",
    },
    {
      icon: Key,
      title: "Developer-Friendly",
      description: "Simple REST API with comprehensive documentation and SDKs.",
    },
    {
      icon: BarChart3,
      title: "Usage Metering",
      description: "Automatic token deduction based on actual AI model consumption.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-semibold">TokenGate</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-accent hover:bg-accent/90"
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <Button asChild className="bg-accent hover:bg-accent/90">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32 lg:py-40">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              AI Tokens, Reimagined
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Access any AI provider through a unified, elegant gateway. Purchase tokens once, use them everywhere. 
              Built for developers who demand simplicity and control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button
                  onClick={() => navigate("/dashboard")}
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-lg h-12"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-lg h-12"
                  >
                    <a href={getLoginUrl()}>
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg h-12"
                  >
                    View Documentation
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-32 bg-card/50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground">
              A complete platform for managing AI access tokens with enterprise-grade features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="border-border hover:border-accent/50 transition-colors">
                  <CardHeader>
                    <div className="mb-4">
                      <div className="inline-flex p-3 bg-accent/10 rounded-lg">
                        <Icon className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center bg-card border border-border rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of developers using TokenGate to manage their AI API access.
            </p>
            {isAuthenticated ? (
              <Button
                onClick={() => navigate("/dashboard")}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-lg h-12"
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-lg h-12"
              >
                <a href={getLoginUrl()}>
                  Sign Up Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <div className="h-6 w-6 rounded-lg bg-accent flex items-center justify-center">
                <Zap className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-semibold">TokenGate</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 TokenGate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
