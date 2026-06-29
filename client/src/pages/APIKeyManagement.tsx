import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { ArrowLeft, Key, Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";

export default function APIKeyManagement() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showKey, setShowKey] = useState<number | null>(null);
  const [keyName, setKeyName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: apiKeys, isLoading, refetch } = trpc.apiKeys.list.useQuery();
  const { mutate: generateKey, isPending: isGenerating } = trpc.apiKeys.generate.useMutation({
    onSuccess: (data) => {
      toast.success("API key generated successfully!");
      setKeyName("");
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: revokeKey, isPending: isRevoking } = trpc.apiKeys.revoke.useMutation({
    onSuccess: () => {
      toast.success("API key revoked successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleGenerateKey = () => {
    if (!keyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }
    generateKey({ name: keyName });
  };

  const handleCopyKey = (fullKey: string) => {
    navigator.clipboard.writeText(fullKey);
    toast.success("API key copied to clipboard!");
  };

  const handleRevokeKey = (keyId: number) => {
    if (confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      revokeKey({ keyId });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Key className="h-5 w-5 text-accent-foreground" />
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
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">API Keys</h2>
              <p className="text-muted-foreground mt-2">
                Generate and manage API keys for programmatic access to the Token-Oasis API
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90 gap-2">
                  <Plus className="h-4 w-4" />
                  Generate New Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate New API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key for programmatic access. Keep it secure!
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Key Name</label>
                    <Input
                      placeholder="e.g., Production API Key"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleGenerateKey}
                      disabled={isGenerating}
                      className="bg-accent hover:bg-accent/90"
                    >
                      {isGenerating ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Info Card */}
          <Card className="bg-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="text-base">How to Use API Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">1. Generate a Key</p>
                <p className="text-muted-foreground">Click "Generate New Key" and give it a descriptive name</p>
              </div>
              <div>
                <p className="font-medium mb-1">2. Copy the Key</p>
                <p className="text-muted-foreground">Click the copy icon to copy your key to clipboard</p>
              </div>
              <div>
                <p className="font-medium mb-1">3. Use in Your Application</p>
                <p className="text-muted-foreground font-mono text-xs bg-muted p-2 rounded">
                  Authorization: Bearer YOUR_API_KEY
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">4. Keep It Secret</p>
                <p className="text-muted-foreground">Never share your API key publicly. Revoke it if compromised.</p>
              </div>
            </CardContent>
          </Card>

          {/* API Keys List */}
          <Card>
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>All active and inactive API keys</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              ) : apiKeys && apiKeys.length > 0 ? (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{key.name}</h4>
                          {!key.isActive && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Revoked
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                              {showKey === key.id ? key.keyPrefix : key.keyPrefix.substring(0, 8)}...
                            </span>
                            {key.isActive && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                                className="h-6 w-6 p-0"
                              >
                                {showKey === key.id ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            {key.isActive && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyKey(key.keyPrefix)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p>Created {new Date(key.createdAt).toLocaleDateString()}</p>
                          {key.lastUsedAt && (
                            <p>Last used {new Date(key.lastUsedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeKey(key.id)}
                        disabled={!key.isActive || isRevoking}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {key.isActive ? "Revoke" : "Revoked"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No API keys yet</p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-accent hover:bg-accent/90 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Generate Your First Key
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Code Example */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Example Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm font-mono text-muted-foreground">
{`curl -X POST https://api.tokengate.io/gateway/call \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "openai",
    "model": "gpt-4",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ]
  }'`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
