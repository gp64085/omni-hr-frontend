"use client";

import { useState } from "react";
import { Radio, CheckCircle2, XCircle, Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { integrationsApi } from "../api/integrations-api";
import { getApiErrorMessage } from "@/lib/error-utils";

interface ConnectionTesterCardProps {
  platform: string;
  platformName: string;
  credentialsSupplier?: () => Record<string, unknown>;
}

export function ConnectionTesterCard({
  platform,
  platformName,
  credentialsSupplier,
}: ConnectionTesterCardProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: Record<string, unknown>;
  } | null>(null);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    const creds = credentialsSupplier ? credentialsSupplier() : undefined;

    try {
      const res = await integrationsApi.testConnection(platform, creds);
      setTestResult(res);
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: getApiErrorMessage(err) || "Failed to reach service endpoint.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-emerald-400" />
          Live Connection Diagnostics
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Verify that OmniHR can authenticate with {platformName} using the configured credentials.
      </p>

      {testResult && (
        <div
          className={`p-3.5 rounded-xl border text-xs space-y-2 ${
            testResult.success
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}
        >
          <div className="flex items-start gap-2">
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span className="font-medium leading-snug">{testResult.message}</span>
          </div>
          {testResult.details && (
            <div className="pt-2 border-t border-emerald-500/20 text-[11px] font-mono text-emerald-400/90">
              {Object.entries(testResult.details).map(([k, v]) => (
                <div key={k}>
                  • {k}: {String(v)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleTest}
        isLoading={isTesting}
        className="w-full"
      >
        <Radio className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
        Test {platformName} Connection
      </Button>
    </Card>
  );
}
