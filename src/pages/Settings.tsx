import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Key, Eye, EyeOff, Save, Trash2, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { encryptApiKey, decryptApiKey } from "@/lib/cryptoUtils";

type ApiProvider = "deepseek" | "openai" | "anthropic";

interface ApiKeyConfig {
  id: ApiProvider;
  name: string;
  description: string;
  placeholder: string;
  docsUrl: string;
}

const API_PROVIDERS: ApiKeyConfig[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "Powers text generation, thesis creation, and content writing",
    placeholder: "sk-...",
    docsUrl: "https://platform.deepseek.com/api_keys",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Alternative provider for GPT-4 powered content generation",
    placeholder: "sk-...",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    description: "Alternative provider for Claude-powered content generation",
    placeholder: "sk-ant-...",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
];

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<Record<ApiProvider, string>>({
    deepseek: "",
    openai: "",
    anthropic: "",
  });
  const [showKeys, setShowKeys] = useState<Record<ApiProvider, boolean>>({
    deepseek: false,
    openai: false,
    anthropic: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<ApiProvider | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadApiKeys();
  }, [user, navigate]);

  const loadApiKeys = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("api_keys")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data?.api_keys && typeof data.api_keys === 'object') {
        const keys = data.api_keys as Record<string, string>;
        // Decrypt keys for display
        const decrypted: Record<string, string> = {};
        for (const provider of ['deepseek', 'openai', 'anthropic'] as ApiProvider[]) {
          decrypted[provider] = keys[provider] ? await decryptApiKey(keys[provider], user.id) : "";
        }
        setApiKeys({
          deepseek: decrypted.deepseek || "",
          openai: decrypted.openai || "",
          anthropic: decrypted.anthropic || "",
        });
      }
    } catch (error) {
      console.error("Error loading API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async (provider: ApiProvider) => {
    if (!user) return;
    
    setSaving(provider);
    try {
      // Get current keys first
      const { data: current } = await supabase
        .from("profiles")
        .select("api_keys")
        .eq("id", user.id)
        .single();

      const currentKeys = (current?.api_keys as Record<string, string>) || {};
      // Encrypt the key before storing
      const encryptedKey = await encryptApiKey(apiKeys[provider], user.id);
      const updatedKeys = {
        ...currentKeys,
        [provider]: encryptedKey,
      };

      const { error } = await supabase
        .from("profiles")
        .update({ api_keys: updatedKeys })
        .eq("id", user.id);

      if (error) throw error;

      toast.success(`${API_PROVIDERS.find(p => p.id === provider)?.name} API key saved`);
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key");
    } finally {
      setSaving(null);
    }
  };

  const deleteApiKey = async (provider: ApiProvider) => {
    if (!user) return;
    
    setSaving(provider);
    try {
      const { data: current } = await supabase
        .from("profiles")
        .select("api_keys")
        .eq("id", user.id)
        .single();

      const currentKeys = (current?.api_keys as Record<string, string>) || {};
      delete currentKeys[provider];

      const { error } = await supabase
        .from("profiles")
        .update({ api_keys: currentKeys })
        .eq("id", user.id);

      if (error) throw error;

      setApiKeys(prev => ({ ...prev, [provider]: "" }));
      toast.success(`${API_PROVIDERS.find(p => p.id === provider)?.name} API key removed`);
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Failed to delete API key");
    } finally {
      setSaving(null);
    }
  };

  const toggleShowKey = (provider: ApiProvider) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const maskKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 8) return "••••••••";
    return key.slice(0, 4) + "••••••••" + key.slice(-4);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your API keys and preferences</p>
            </div>
          </div>
        </motion.div>

        {/* BYOK Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                <CardTitle>Bring Your Own Key (BYOK)</CardTitle>
              </div>
              <CardDescription>
                Use your own API keys for AI-powered features. Your keys are stored securely and never shared.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info Alert */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">How BYOK works</p>
                  <p className="text-muted-foreground mt-1">
                    When you add your own API key, it will be used instead of the app's default key for AI features. 
                    This gives you more control and potentially higher rate limits.
                  </p>
                </div>
              </div>

              {/* API Key Forms */}
              <div className="space-y-4">
                {API_PROVIDERS.map((provider) => (
                  <div
                    key={provider.id}
                    className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{provider.name}</span>
                          {apiKeys[provider.id] && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Configured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {provider.description}
                        </p>
                      </div>
                      <a
                        href={provider.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Get API Key →
                      </a>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={showKeys[provider.id] ? "text" : "password"}
                          placeholder={provider.placeholder}
                          value={showKeys[provider.id] ? apiKeys[provider.id] : maskKey(apiKeys[provider.id])}
                          onChange={(e) => {
                            if (showKeys[provider.id]) {
                              setApiKeys(prev => ({ ...prev, [provider.id]: e.target.value }));
                            }
                          }}
                          onFocus={() => {
                            if (!showKeys[provider.id]) {
                              setShowKeys(prev => ({ ...prev, [provider.id]: true }));
                            }
                          }}
                          className="pr-10 font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShowKey(provider.id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showKeys[provider.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => saveApiKey(provider.id)}
                        disabled={saving === provider.id || !apiKeys[provider.id]}
                      >
                        {saving === provider.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                      {apiKeys[provider.id] && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => deleteApiKey(provider.id)}
                          disabled={saving === provider.id}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
