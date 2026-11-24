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
        label: "AI Model Selection",
        type: "select",
        options: [
          { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile (Recommended)" },
          { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B (32k Context)" },
          { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant (Ultra Fast)" },
        ],
        description: "Llama 3.3 70B supports native tool calling with strict schema adherence.",
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
