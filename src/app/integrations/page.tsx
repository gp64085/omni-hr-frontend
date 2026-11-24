"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  MessageSquare,
  Sparkles,
  Layers,
  LayoutGrid,
  ShieldCheck,
  Zap,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { IntegrationCatalogCard } from "@/features/integrations/components/IntegrationCatalogCard";
import { ConnectionTesterCard } from "@/features/integrations/components/ConnectionTesterCard";
import { WebhookUrlCopy } from "@/features/integrations/components/WebhookUrlCopy";
import { DynamicCredentialsForm } from "@/features/integrations/forms/DynamicCredentialsForm";
import { integrationsApi } from "@/features/integrations/api/integrations-api";
import {
  IntegrationConfig,
  PlatformMetadata,
  SUPPORTED_PLATFORMS,
} from "@/features/integrations/types/integration-types";

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<string>("catalog");
  const [configs, setConfigs] = useState<Record<string, IntegrationConfig>>({});

  // References to get current form values for live testing
  const slackPayloadGetter = useRef<(() => Record<string, unknown>) | null>(null);
  const groqPayloadGetter = useRef<(() => Record<string, unknown>) | null>(null);
  const customPayloadGetter = useRef<(() => Record<string, unknown>) | null>(null);

  const reloadConfigs = useCallback(async () => {
    try {
      const list = await integrationsApi.listIntegrations();
      const map: Record<string, IntegrationConfig> = {};
      list.forEach((item) => {
        map[item.platform.toLowerCase()] = item;
      });
      setConfigs(map);
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchConfigs() {
      try {
        const list = await integrationsApi.listIntegrations();
        if (isMounted) {
          const map: Record<string, IntegrationConfig> = {};
          list.forEach((item) => {
            map[item.platform.toLowerCase()] = item;
          });
          setConfigs(map);
        }
      } catch {
        // Fallback
      }
    }
    fetchConfigs();
    return () => {
      isMounted = false;
    };
  }, []);

  const slackMeta = SUPPORTED_PLATFORMS.find((p) => p.id === "slack") as PlatformMetadata;
  const groqMeta = SUPPORTED_PLATFORMS.find((p) => p.id === "groq") as PlatformMetadata;
  const customMeta = SUPPORTED_PLATFORMS.find((p) => p.id === "custom") as PlatformMetadata;

  const isSlackActive = configs["slack"]?.is_enabled ?? false;
  const isGroqActive = configs["groq"]?.is_enabled ?? false;

  const activeCount = [isSlackActive, isGroqActive].filter(Boolean).length;

  const tabs: TabItem[] = [
    { id: "catalog", label: "Catalog & Overview", icon: LayoutGrid },
    { id: "slack", label: "Slack Assistant", icon: MessageSquare },
    { id: "groq", label: "Groq AI Engine", icon: Sparkles },
    { id: "custom", label: "Custom Connectors", icon: Layers },
  ];

  return (
    <AppShell
      title="Third-Party Integrations & Conversational AI"
      subtitle="Connect enterprise communication platforms and configure high-performance AI reasoning services"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Available Integrations
              </div>
              <div className="text-xl font-bold text-white mt-0.5">3 Connectors</div>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Connections
              </div>
              <div className="text-xl font-bold text-white mt-0.5 flex items-center gap-2">
                <span>{activeCount} Active</span>
                {activeCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Reasoning LLM
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                {isGroqActive ? "Llama 3.3 70B • Groq" : "Not Configured"}
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Tab 1: Catalog & Overview */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <IntegrationCatalogCard
                id="slack"
                name="Slack Bot Assistant"
                category="Enterprise Chat"
                description="Conversational self-service assistant allowing employees to query leave balances and draft applications directly in Slack."
                icon="slack"
                isConfigured={Boolean(configs["slack"])}
                isEnabled={isSlackActive}
                features={[
                  "Direct Messages for 1-on-1 leave queries & timesheets",
                  "@mentions in team channels for action triggers",
                  "2-Phase interactive review and confirmation cards",
                ]}
                onConfigure={() => setActiveTab("slack")}
              />

              <IntegrationCatalogCard
                id="groq"
                name="Groq AI Reasoning Engine"
                category="LLM Tool Calling"
                description="High-speed AI reasoning with native function calling, converting natural language into structured OmniHR operations."
                icon="groq"
                isConfigured={Boolean(configs["groq"])}
                isEnabled={isGroqActive}
                features={[
                  "Ultra low-latency Llama 3.3 70B inference",
                  "Structured parameter extraction with date arithmetic",
                  "Zero data leakage & strict domain validation",
                ]}
                onConfigure={() => setActiveTab("groq")}
              />

              <IntegrationCatalogCard
                id="custom"
                name="Custom Bot Connector"
                category="Extensible Platform"
                description="Pluggable connector architecture for future integrations like Microsoft Teams, Discord, or custom enterprise webhooks."
                icon="custom"
                isConfigured={false}
                isEnabled={false}
                features={[
                  "Pluggable BaseMessagingAdapter protocol",
                  "Configurable custom credential fields and tokens",
                  "Encrypted secret storage at rest",
                ]}
                onConfigure={() => setActiveTab("custom")}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Slack Assistant Configuration */}
        {activeTab === "slack" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <DynamicCredentialsForm
                platform={slackMeta}
                onSaved={reloadConfigs}
                getPayloadRef={(fn) => {
                  slackPayloadGetter.current = fn;
                }}
              />
            </div>

            <div className="space-y-6">
              <ConnectionTesterCard
                platform="slack"
                platformName="Slack"
                credentialsSupplier={() => slackPayloadGetter.current?.() || {}}
              />

              <Card className="p-5 space-y-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Slack App Endpoints
                </div>
                <div className="space-y-3">
                  <WebhookUrlCopy
                    label="Event Subscriptions URL"
                    path="/api/v1/integrations/slack/events"
                    description="DMs & @mentions"
                  />
                  <WebhookUrlCopy
                    label="Interactivity URL"
                    path="/api/v1/integrations/slack/interactions"
                    description="Confirmation cards"
                  />
                </div>
              </Card>

              <Card className="p-5 space-y-3 bg-slate-950/60 border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  Setup Checklist
                </div>
                <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                  <li>
                    Bot Scopes: <code className="text-indigo-300 font-mono text-[11px]">chat:write</code>,{" "}
                    <code className="text-indigo-300 font-mono text-[11px]">im:history</code>,{" "}
                    <code className="text-indigo-300 font-mono text-[11px]">app_mentions:read</code>,{" "}
                    <code className="text-indigo-300 font-mono text-[11px]">users:read.email</code>.
                  </li>
                  <li>Enable Event Subscriptions and subscribe to <code className="text-indigo-300 font-mono text-[11px]">message.im</code>.</li>
                  <li>Enable Interactivity with the Request URL above.</li>
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Groq AI Engine Configuration */}
        {activeTab === "groq" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <DynamicCredentialsForm
                platform={groqMeta}
                onSaved={reloadConfigs}
                getPayloadRef={(fn) => {
                  groqPayloadGetter.current = fn;
                }}
              />
            </div>

            <div className="space-y-6">
              <ConnectionTesterCard
                platform="groq"
                platformName="Groq AI"
                credentialsSupplier={() => groqPayloadGetter.current?.() || {}}
              />

              <Card className="p-5 space-y-3 bg-slate-950/60 border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    Groq Cloud API
                  </div>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Groq delivers sub-second inference speeds, enabling OmniBot to parse multi-date leave requests and function calls in real time.
                </p>
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Recommended Model:</span>{" "}
                  <code className="text-amber-400 font-mono text-[11px]">llama-3.3-70b-versatile</code>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 4: Custom Connectors Configuration */}
        {activeTab === "custom" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <DynamicCredentialsForm
                platform={customMeta}
                onSaved={reloadConfigs}
                getPayloadRef={(fn) => {
                  customPayloadGetter.current = fn;
                }}
              />
            </div>

            <div className="space-y-6">
              <ConnectionTesterCard
                platform="custom"
                platformName="Custom Platform"
                credentialsSupplier={() => customPayloadGetter.current?.() || {}}
              />

              <Card className="p-5 space-y-3 bg-slate-950/60 border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Extensible Architecture
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  OmniHR&apos;s backend implements the <code className="text-indigo-300 font-mono text-[11px]">BaseMessagingAdapter</code> protocol.
                  New platforms (such as Microsoft Teams or Discord) can be plugged in without altering the core AI reasoning loop.
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
