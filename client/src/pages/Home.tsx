import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Zap, Shield, TrendingUp, Wallet, Key, BarChart3, ArrowRight, Check } from "lucide-react";

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

  const providers = [
    { name: "OpenAI", emoji: "🤖" },
    { name: "Anthropic", emoji: "🧠" },
    { name: "Cohere", emoji: "✨" },
    { name: "Mistral", emoji: "🌟" },
    { name: "Together", emoji: "🤝" },
    { name: "Replicate", emoji: "🔄" },
  ];

  const pricingTiers = [
    {
      name: "Starter",
      tokens: "10,000",
      price: "$100",
      pricePerToken: "$0.01",
      features: ["10,000 tokens", "Basic analytics", "Email support", "API access"],
    },
    {
      name: "Growth",
      tokens: "20,000",
      price: "$180",
      pricePerToken: "$0.009",
      features: ["20,000 tokens", "Advanced analytics", "Priority support", "API access", "10% discount"],
      popular: true,
    },
    {
      name: "Professional",
      tokens: "50,000",
      price: "$400",
      pricePerToken: "$0.008",
      features: ["50,000 tokens", "Custom analytics", "24/7 support", "API access", "20% discount"],
    },
    {
      name: "Enterprise",
      tokens: "100,000",
      price: "$700",
      pricePerToken: "$0.007",
      features: ["100,000 tokens", "Dedicated account manager", "24/7 priority support", "API access", "30% discount"],
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

      {/* Supported Providers Section */}
      <section className="py-20 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Supported AI Providers
            </h2>
            <p className="text-lg text-muted-foreground">
              Access leading AI models through a single, unified gateway. More providers coming soon.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {providers.map((provider) => (
              <div key={provider.name} className="flex flex-col items-center gap-3 p-6 bg-card rounded-lg border border-border hover:border-accent/50 transition-colors">
                <div className="text-5xl">{provider.emoji}</div>
                <p className="font-semibold text-center text-sm">{provider.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 sm:py-32 bg-card/50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the perfect plan for your AI needs. Volume discounts available for all tiers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier) => (
              <Card key={tier.name} className={`relative flex flex-col ${tier.popular ? 'border-accent md:scale-105' : 'border-border'}`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground ml-2">/ {tier.tokens} tokens</span>
                  </CardDescription>
                  <p className="text-sm text-accent font-semibold mt-2">{tier.pricePerToken} per token</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-6 flex-1">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className={`w-full ${tier.popular ? 'bg-accent hover:bg-accent/90' : ''}`}>
                    <a href={getLoginUrl()}>
                      Get Started
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
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
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded-lg bg-accent flex items-center justify-center">
                  <Zap className="h-4 w-4 text-accent-foreground" />
                </div>
                <span className="font-semibold">TokenGate</span>
              </div>
              <p className="text-sm text-muted-foreground">AI Token Gateway Platform</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">API Docs</a></li>
                <li><a href="#" className="hover:text-foreground transition">Integration Guides</a></li>
                <li><a href="#" className="hover:text-foreground transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2026 TokenGate. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-4 sm:mt-0">
              Made with <span className="text-accent">♥</span> for developers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
