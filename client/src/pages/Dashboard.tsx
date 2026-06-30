import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Wallet, TrendingUp, Settings, LogOut, Plus, Key, History, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: balanceData, isLoading: balanceLoading } = trpc.wallet.getBalance.useQuery();
  const { data: statsData, isLoading: statsLoading } = trpc.wallet.getUsageStats.useQuery();
  const { data: apiKeysData, isLoading: apiKeysLoading } = trpc.apiKeys.list.useQuery();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Wallet className="h-5 w-5 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Token-Oasis</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid gap-8">
          {/* Token Balance Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Token Balance</span>
                <Button 
                  onClick={() => navigate('/buy-tokens')}
                  className="bg-accent hover:bg-accent/90 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Buy Tokens
                </Button>
              </CardTitle>
              <CardDescription>Your current AI token balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                {balanceLoading ? (
                  <Skeleton className="h-12 w-32" />
                ) : (
                  <>
                    <span className="text-5xl font-bold">{balanceData?.balance || "0.00"}</span>
                    <span className="text-lg text-muted-foreground">tokens</span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Tokens are automatically deducted based on your AI API usage.
              </p>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="flex gap-4 mb-4">
                <Button 
                  onClick={() => navigate('/api-gateway')}
                  className="bg-accent hover:bg-accent/90 gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Test API Gateway
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-accent" />
                      Usage This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <>
                        <div className="text-3xl font-bold">
                          ${Number(statsData?.totalUsed ?? 0).toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">in API usage</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-accent" />
                      Total Spent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ${Number(statsData?.totalChargedUsd ?? statsData?.totalUsed ?? 0).toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">all time</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Usage by Service</CardTitle>
                  <CardDescription>Token consumption breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statsLoading ? (
                      <Skeleton className="h-24" />
                    ) : statsData?.byService && statsData.byService.length > 0 ? (
                      statsData.byService.map((item: any) => {
                        const total = statsData.byService.reduce((a: number, b: any) => a + parseFloat(b.amount), 0);
                        const percentage = total > 0 ? ((parseFloat(item.amount) / total) * 100) : 0;
                        return (
                          <div key={item.provider}>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">{item.provider}</span>
                              <span className="text-sm text-muted-foreground">{item.amount} tokens</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-accent h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground">No usage data yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-accent" />
                    Transaction History
                  </CardTitle>
                  <CardDescription>All your token purchases and usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statsLoading ? (
                      <Skeleton className="h-32" />
                    ) : statsData?.byService && statsData.byService.length > 0 ? (
                      statsData.byService.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div>
                            <p className="font-medium">{item.provider}</p>
                            <p className="text-sm text-muted-foreground">Usage breakdown</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-red-600">{item.amount}</p>
                            <p className="text-sm text-muted-foreground"></p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No transaction history yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api-keys">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-accent" />
                      API Keys
                    </span>
                    <Button className="bg-accent hover:bg-accent/90 gap-2" size="sm">
                      <Plus className="h-4 w-4" />
                      Generate Key
                    </Button>
                  </CardTitle>
                  <CardDescription>Manage your API keys for integration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2 mb-4">
                      <Button 
                        onClick={() => navigate('/api-keys')}
                        className="bg-accent hover:bg-accent/90 gap-2"
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                        Manage API Keys
                      </Button>
                    </div>
                    {apiKeysLoading ? (
                      <Skeleton className="h-32" />
                    ) : apiKeysData && apiKeysData.length > 0 ? (
                      apiKeysData.map((key) => (
                        <div key={key.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div>
                            <p className="font-medium">{key.name}</p>
                            <p className="text-sm text-muted-foreground font-mono text-xs">{key.keyPrefix}...</p>
                            <p className="text-sm text-muted-foreground">Created {new Date(key.createdAt).toLocaleDateString()}</p>
                            {key.lastUsedAt && <p className="text-sm text-muted-foreground">Last used {new Date(key.lastUsedAt).toLocaleDateString()}</p>}
                          </div>
                          <Button variant="outline" size="sm" disabled={!key.isActive}>
                            {key.isActive ? "Revoke" : "Revoked"}
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No API keys yet. Generate one to get started.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-accent" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-muted-foreground mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-muted-foreground mt-1">{user?.name}</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
