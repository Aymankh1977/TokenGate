import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { ArrowLeft, Zap, Send, Code2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";

export default function APIGateway() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [messages, setMessages] = useState([{ role: "user", content: "Hello, how are you?" }]);
  const [temperature, setTemperature] = useState("0.7");
  const [maxTokens, setMaxTokens] = useState("500");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { data: models } = trpc.gateway.getModels.useQuery();
  const { data: stats } = trpc.gateway.getStats.useQuery();
  const { mutate: callAPI } = trpc.gateway.callAPI.useMutation({
    onSuccess: (data) => {
      setResponse(data);
      toast.success("API call successful!");
      setLoading(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setLoading(false);
    },
  });

  const handleSendMessage = () => {
    if (!messages.length || !messages[messages.length - 1].content) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    callAPI({
      provider,
      model,
      messages,
      temperature: parseFloat(temperature),
      maxTokens: parseInt(maxTokens),
    });
  };

  const handleAddMessage = () => {
    setMessages([...messages, { role: "assistant", content: "" }]);
  };

  const handleUpdateMessage = (index: number, field: string, value: string) => {
    const newMessages = [...messages];
    (newMessages[index] as any)[field] = value;
    setMessages(newMessages);
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
      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Request Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-accent" />
                  API Gateway Test
                </CardTitle>
                <CardDescription>Test AI API calls and see token deductions in real-time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Provider and Model Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Provider</label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="cohere">Cohere</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Model</label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {models?.models
                          ?.filter(m => m.provider === provider)
                          .map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Temperature and Max Tokens */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Temperature</label>
                    <Input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Tokens</label>
                    <Input
                      type="number"
                      min="1"
                      max="4096"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(e.target.value)}
                    />
                  </div>
                </div>

                {/* Messages */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Messages</label>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {messages.map((msg, idx) => (
                      <div key={idx} className="space-y-2">
                        <Select value={msg.role} onValueChange={(value) => handleUpdateMessage(idx, 'role', value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="system">System</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="assistant">Assistant</SelectItem>
                          </SelectContent>
                        </Select>
                        <Textarea
                          placeholder="Enter message content..."
                          value={msg.content}
                          onChange={(e) => handleUpdateMessage(idx, 'content', e.target.value)}
                          className="min-h-20"
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddMessage}
                    className="mt-3"
                  >
                    Add Message
                  </Button>
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendMessage}
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90 gap-2"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Sending..." : "Send Request"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gateway Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                      <p className="text-2xl font-bold">{stats.totalRequests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Successful</p>
                      <p className="text-2xl font-bold text-green-600">{stats.successfulRequests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="text-2xl font-bold text-red-600">{stats.failedRequests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tokens Used</p>
                      <p className="text-2xl font-bold">{stats.totalTokensUsed.toFixed(2)}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Response Card */}
            {response && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Response</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tokens Deducted</p>
                    <p className="text-lg font-bold text-red-600">
                      {response.tokenUsage?.totalTokensDeducted}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">New Balance</p>
                    <p className="text-lg font-bold">{response.newBalance}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <p className="text-xs font-mono text-muted-foreground">
                      {JSON.stringify(response.response, null, 2).substring(0, 500)}...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
