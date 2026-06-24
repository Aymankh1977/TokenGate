import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { BarChart3, Users, TrendingUp, DollarSign, LogOut, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You do not have permission to access the admin panel.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: allUsers, isLoading: usersLoading } = trpc.admin.getAllUsers.useQuery();
  const { data: revenueStats, isLoading: revenueLoading } = trpc.admin.getRevenueStats.useQuery();
  const { data: platformStats, isLoading: statsLoading } = trpc.admin.getPlatformStats.useQuery();

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
              <BarChart3 className="h-5 w-5 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
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
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{platformStats?.totalUsers || 0}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  Total Tokens Sold
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{(platformStats?.totalTokensSold || 0).toLocaleString()}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-accent" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">${(revenueStats?.totalRevenue || 0).toFixed(2)}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  Avg User Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{(platformStats?.averageUserBalance || 0).toFixed(2)}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>User accounts and token balances</CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <Skeleton className="h-96" />
                  ) : allUsers && allUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Token Balance</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Role</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allUsers.map((u) => (
                            <TableRow key={u.id}>
                              <TableCell className="font-medium">{u.name || 'N/A'}</TableCell>
                              <TableCell>{u.email}</TableCell>
                              <TableCell className="font-mono">{u.tokenBalance}</TableCell>
                              <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {u.role}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No users found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Revenue Tab */}
            <TabsContent value="revenue">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Payment and revenue metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {revenueLoading ? (
                    <>
                      <Skeleton className="h-20" />
                      <Skeleton className="h-20" />
                    </>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border border-border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
                          <p className="text-3xl font-bold">${(revenueStats?.totalRevenue || 0).toFixed(2)}</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Total Transactions</p>
                          <p className="text-3xl font-bold">{revenueStats?.totalTransactions || 0}</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Average Transaction</p>
                          <p className="text-3xl font-bold">${(revenueStats?.averageTransaction || 0).toFixed(2)}</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Largest Transaction</p>
                          <p className="text-3xl font-bold">${(revenueStats?.largestTransaction || 0).toFixed(2)}</p>
                        </div>
                      </div>

                      {revenueStats?.topPackages && revenueStats.topPackages.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Top Selling Packages</h4>
                          <div className="space-y-2">
                            {revenueStats.topPackages.map((pkg: any, idx: number) => (
                              <div key={idx} className="flex justify-between p-3 border border-border rounded-lg">
                                <span>{pkg.packageName}</span>
                                <span className="font-semibold">{pkg.count} sales</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Metrics</CardTitle>
                  <CardDescription>System-wide statistics and usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {statsLoading ? (
                    <>
                      <Skeleton className="h-20" />
                      <Skeleton className="h-20" />
                    </>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border border-border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Total Users</p>
                          <p className="text-3xl font-bold">{platformStats?.totalUsers || 0}</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Active Users (30d)</p>
                          <p className="text-3xl font-bold">{platformStats?.activeUsers || 0}</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Total Tokens Sold</p>
                          <p className="text-3xl font-bold">{(platformStats?.totalTokensSold || 0).toLocaleString()}</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Total Tokens Used</p>
                          <p className="text-3xl font-bold">{(platformStats?.totalTokensUsed || 0).toLocaleString()}</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Avg User Balance</p>
                          <p className="text-3xl font-bold">{(platformStats?.averageUserBalance || 0).toFixed(2)}</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Total API Calls</p>
                          <p className="text-3xl font-bold">{platformStats?.totalAPIcalls || 0}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
