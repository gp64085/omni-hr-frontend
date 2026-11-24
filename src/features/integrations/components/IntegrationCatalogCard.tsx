"use client";

import { MessageSquare, Sparkles, Layers, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface IntegrationCatalogCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: "slack" | "groq" | "custom";
  isConfigured: boolean;
  isEnabled: boolean;
  features: string[];
  onConfigure: () => void;
}

export function IntegrationCatalogCard({
  name,
  category,
  description,
  icon,
  isConfigured,
  isEnabled,
  features,
  onConfigure,
}: IntegrationCatalogCardProps) {
  const renderIcon = () => {
    if (icon === "slack") {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#4A154B]/20 border border-[#4A154B]/40 flex items-center justify-center text-amber-300 shrink-0">
          <MessageSquare className="w-6 h-6" />
        </div>
      );
    }
    if (icon === "groq") {
      return (
        <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
        <Layers className="w-6 h-6" />
      </div>
    );
  };

  return (
    <Card className="p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-200">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          {renderIcon()}
          <div className="flex items-center gap-1.5">
            {isConfigured && isEnabled ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            ) : isConfigured && !isEnabled ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertCircle className="w-3 h-3" />
                Disabled
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
                Not Configured
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-400 mb-1 block">
            {category}
          </span>
          <h3 className="text-base font-bold text-white tracking-tight">{name}</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
        </div>

        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 mt-4 border-t border-slate-800/80">
        <Button
          onClick={onConfigure}
          variant={isConfigured ? "secondary" : "default"}
          size="sm"
          className="w-full justify-between"
        >
          <span>{isConfigured ? "Manage Settings" : "Configure Integration"}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
