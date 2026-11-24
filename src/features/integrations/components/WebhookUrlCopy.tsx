"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface WebhookUrlCopyProps {
  label: string;
  path: string;
  description?: string;
}

export function WebhookUrlCopy({ label, path, description }: WebhookUrlCopyProps) {
  const [copied, setCopied] = useState(false);

  // In production / browser, combine origin with the path
  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin.replace(":3000", ":8000")}${path}`
      : `http://localhost:8000${path}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300">{label}</span>
        {description && <span className="text-slate-500">{description}</span>}
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 truncate">
          {fullUrl}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
          title="Copy URL to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
