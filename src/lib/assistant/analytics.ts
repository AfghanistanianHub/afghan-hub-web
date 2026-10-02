"use client";

export type AssistantAnalyticsLanguage = "en" | "fa" | "ps";
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
    };

const SESSION_KEY = "afghan-hub-assistant-session";

function getSessionId() {
  try {
    const current = window.sessionStorage.getItem(SESSION_KEY);
    if (current) return current;

    const created = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return null;
  }
}

export function trackAssistantEvent(event: AssistantAnalyticsEvent) {
  const payload = {
    ...event,
    sessionId: getSessionId(),
  };

  void fetch("/api/assistant/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Analytics must never block or break the product experience.
  });
}
