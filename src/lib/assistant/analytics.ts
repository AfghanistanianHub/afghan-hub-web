"use client";

import type { NavigatorLanguage } from "./navigator-language";

export type AssistantAnalyticsLanguage = NavigatorLanguage;
export type AssistantAnalyticsEntityType =
  | "profile"
  | "business"
  | "organization"
  | "opportunity"
  | "event";

export type AssistantAnalyticsEvent =
  | {
      event: "assistant_open";
      language: AssistantAnalyticsLanguage;
    }
  | {
      event: "assistant_language_change";
      language: AssistantAnalyticsLanguage;
    }
  | {
      event: "assistant_search";
      language: AssistantAnalyticsLanguage;
      intent: string;
      entityType: AssistantAnalyticsEntityType | null;
      resultCount: number;
      hadResults: boolean;
    }
  | {
      event: "assistant_result_click";
      language: AssistantAnalyticsLanguage;
      entityType: AssistantAnalyticsEntityType;
    }
  | {
      event: "assistant_recovery_click";
      language: AssistantAnalyticsLanguage;
      destination: "network" | "organizations" | "opportunities" | "events";
    };

export function trackAssistantEvent(event: AssistantAnalyticsEvent) {
  void fetch("/api/assistant/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => {
    // Analytics must never block or break the product experience.
  });
}
