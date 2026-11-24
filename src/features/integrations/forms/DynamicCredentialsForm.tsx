"use client";

import { useEffect, useState } from "react";
import {
  KeyRound,
  Shield,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { integrationsApi } from "../api/integrations-api";
import { PlatformMetadata } from "../types/integration-types";
import { getApiErrorMessage } from "@/lib/error-utils";

interface CustomField {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
}

interface DynamicCredentialsFormProps {
  platform: PlatformMetadata;
  onSaved?: () => void;
  getPayloadRef?: (fn: () => Record<string, unknown>) => void;
}

export function DynamicCredentialsForm({
  platform,
  onSaved,
  getPayloadRef,
}: DynamicCredentialsFormProps) {
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [showCustomFields, setShowCustomFields] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync current form state to parent getter ref for connection testing
  useEffect(() => {
    if (getPayloadRef) {
      getPayloadRef(() => {
        const creds: Record<string, unknown> = { ...formFields };
        customFields.forEach((cf) => {
          if (cf.key.trim()) {
            creds[cf.key.trim()] = cf.value.trim();
          }
        });
        return creds;
      });
    }
  }, [formFields, customFields, getPayloadRef]);

  // Load existing credentials
  useEffect(() => {
    async function load() {
      setErrorMsg(null);
      setSuccessMsg(null);

      try {
        const config = await integrationsApi.getIntegration(platform.id);
        if (config) {
          setIsEnabled(config.is_enabled);
          const creds = config.credentials || {};

          const standardKeys = new Set(platform.defaultFields.map((f) => f.key));
          const standardVals: Record<string, string> = {};
          const customVals: CustomField[] = [];

          for (const [k, v] of Object.entries(creds)) {
            if (standardKeys.has(k)) {
              standardVals[k] = String(v);
            } else {
              const isSecret =
                k.toLowerCase().includes("token") ||
                k.toLowerCase().includes("secret") ||
                k.toLowerCase().includes("key") ||
                k.toLowerCase().includes("password");
              customVals.push({
                id: Math.random().toString(36).slice(2, 9),
                key: k,
                value: String(v),
                isSecret,
              });
            }
          }

          setFormFields(standardVals);
          setCustomFields(customVals);
          if (customVals.length > 0) {
            setShowCustomFields(true);
          }
        } else {
          // Initialize defaults
          const initial: Record<string, string> = {};
          platform.defaultFields.forEach((f) => {
            if (f.options && f.options.length > 0) {
              initial[f.key] = f.options[0].value;
            } else {
              initial[f.key] = "";
            }
          });
          setFormFields(initial);
          setCustomFields([]);
          setIsEnabled(true);
        }
      } catch {
        const initial: Record<string, string> = {};
        platform.defaultFields.forEach((f) => {
          if (f.options && f.options.length > 0) {
            initial[f.key] = f.options[0].value;
          } else {
            initial[f.key] = "";
          }
        });
        setFormFields(initial);
        setCustomFields([]);
        setIsEnabled(true);
      }
    }

    load();
  }, [platform]);

  const handleFieldChange = (key: string, value: string) => {
    setFormFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddCustomField = () => {
    setShowCustomFields(true);
    setCustomFields((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        key: "",
        value: "",
        isSecret: true,
      },
    ]);
  };

  const handleUpdateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const creds: Record<string, unknown> = { ...formFields };
    customFields.forEach((cf) => {
      const trimmedKey = cf.key.trim();
      if (trimmedKey) {
        creds[trimmedKey] = cf.value.trim();
      }
    });

    const targetPlatform =
      platform.id === "custom"
        ? String(formFields["platform_name"] || "").trim().toLowerCase()
        : platform.id;

    if (!targetPlatform) {
      setErrorMsg("Please specify a platform identifier.");
      setIsLoading(false);
      return;
    }

    try {
      await integrationsApi.saveIntegration(targetPlatform, {
        is_enabled: isEnabled,
        credentials: creds,
      });
      setSuccessMsg(`${platform.name} credentials updated and encrypted successfully.`);
      if (onSaved) onSaved();
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err) || `Failed to save ${platform.name} settings.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start justify-between border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">{platform.name} Configuration</h3>
          <p className="text-xs text-slate-400 mt-0.5">{platform.description}</p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0"
          />
          <span
            className={`text-xs font-semibold ${
              isEnabled ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            {isEnabled ? "Enabled" : "Disabled"}
          </span>
        </label>
      </div>

      {successMsg && <Alert variant="success">{successMsg}</Alert>}
      {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Standard Fields */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            Core Credentials
          </div>

          {platform.defaultFields.map((field) => {
            if (field.type === "select" && field.options) {
              return (
                <div key={field.key} className="w-full">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    {field.label}
                  </label>
                  <select
                    value={formFields[field.key] || ""}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {field.description && (
                    <p className="text-xs text-slate-500 mt-1">{field.description}</p>
                  )}
                </div>
              );
            }

            return (
              <Input
                key={field.key}
                label={field.label}
                type={field.type}
                icon={field.type === "password" ? Shield : KeyRound}
                placeholder={field.placeholder || ""}
                value={formFields[field.key] || ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                required={field.required}
              />
            );
          })}
        </div>

        {/* Collapsible / Clean Custom Fields Section */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowCustomFields(!showCustomFields)}
              className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider hover:text-white transition-colors"
            >
              <span>Custom & Dynamic Fields</span>
              {customFields.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300">
                  {customFields.length}
                </span>
              )}
              {showCustomFields ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleAddCustomField}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Custom Field
            </Button>
          </div>

          {showCustomFields && (
            <div className="space-y-2.5 pt-2">
              <p className="text-[11px] text-slate-500">
                Configure additional environment headers, client IDs, tenant keys, or OAuth metadata.
              </p>

              {customFields.length === 0 ? (
                <div className="p-3 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
                  No custom fields configured. Click &quot;Add Custom Field&quot; to define a custom credential.
                </div>
              ) : (
                <div className="space-y-2">
                  {customFields.map((cf) => (
                    <div
                      key={cf.id}
                      className="flex items-center gap-2 p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl"
                    >
                      <input
                        type="text"
                        placeholder="Key (e.g. client_id)"
                        value={cf.key}
                        onChange={(e) =>
                          handleUpdateCustomField(cf.id, { key: e.target.value })
                        }
                        className="w-1/3 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type={cf.isSecret ? "password" : "text"}
                        placeholder="Value"
                        value={cf.value}
                        onChange={(e) =>
                          handleUpdateCustomField(cf.id, { value: e.target.value })
                        }
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateCustomField(cf.id, { isSecret: !cf.isSecret })
                        }
                        className="px-2 py-1 text-[10px] font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Toggle secret masking"
                      >
                        {cf.isSecret ? "Secret" : "Plain"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(cf.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end">
          <Button type="submit" size="sm" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-1.5" />
            Save {platform.name}
          </Button>
        </div>
      </form>
    </Card>
  );
}
