export type PlatformType = "slack" | "groq" | "custom" | string;

export interface IntegrationConfig {
  id: string;
  platform: string;
  is_enabled: boolean;
  credentials: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface SaveIntegrationPayload {
  is_enabled: boolean;
  credentials: Record<string, unknown>;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: "text" | "password" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  description?: string;
  required?: boolean;
}

export interface PlatformMetadata {
  id: string;
  name: string;
  description: string;
  icon: "slack" | "groq" | "custom";
  defaultFields: FieldDefinition[];
  webhookPaths?: { label: string; path: string; description: string }[];
}

export const SUPPORTED_PLATFORMS: PlatformMetadata[] = [
  {
    id: "slack",
    name: "Slack Integration",
    description: "Employee self-service leave drafting, balance checks, and timesheet logging via Slack DMs & @mentions.",
    icon: "slack",
    defaultFields: [
      {
        key: "bot_token",
        label: "Bot User OAuth Token",
        type: "text",
        placeholder: "xoxb-your-slack-bot-token",
        required: true,
      },
      {
        key: "signing_secret",
        label: "Signing Secret",
        type: "password",
        placeholder: "Slack App Signing Secret",
        required: true,
      },
    ],
    webhookPaths: [
      {
        label: "Event Subscriptions Request URL",
        path: "/api/v1/integrations/slack/events",
        description: "Direct Messages & @mentions",
      },
      {
        label: "Interactivity & Shortcuts Request URL",
        path: "/api/v1/integrations/slack/interactions",
        description: "Interactive button confirmations",
      },
    ],
  },
  {
    id: "groq",
    name: "Groq AI Reasoning Engine",
    description: "Ultra-fast LLM tool-calling engine for natural language parsing and action dispatch.",
    icon: "groq",
    defaultFields: [
      {
        key: "api_key",
        label: "Groq API Key",
        type: "password",
        placeholder: "gsk_your_groq_api_key",
        required: true,
      },
      {
        key: "model",
        label: "AI Model Name / ID",
        type: "text",
        placeholder: "e.g. openai/gpt-oss-120b, qwen/qwen3.8-27b, llama-3.3-70b-versatile",
        description: "Specify any Groq model accessible to your account (e.g. openai/gpt-oss-120b, qwen/qwen3.8-27b, or any custom model).",
        required: true,
      },
    ],
  },
  {
    id: "custom",
    name: "Custom / Future Platform",
    description: "Configure dynamic tokens, API keys, and custom credentials for any future messaging or automation platform.",
    icon: "custom",
    defaultFields: [
      {
        key: "platform_name",
        label: "Platform Identifier / Code",
        type: "text",
        placeholder: "e.g., msteams, discord, custom_bot",
        required: true,
      },
    ],
  },
];
