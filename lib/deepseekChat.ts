import axios from "axios";
import { fetch } from "expo/fetch";

import { DEEPSEEK_API_URL } from "@/lib/deepseekConfig";
import {
  isV4Model,
  shouldUseThinking,
  type DeepSeekModelId,
} from "@/lib/chatPreferencesConfig";
import type { TokenUsageDelta } from "@/lib/tokenUsageConfig";

export type ChatCompletionMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type StreamDelta = {
  content?: string;
  reasoningContent?: string;
};

type StreamDeepSeekChatOptions = {
  apiKey: string;
  model: DeepSeekModelId;
  messages: ChatCompletionMessage[];
  thinkingEnabled: boolean;
  onDelta: (delta: StreamDelta) => void;
  onComplete: (usage?: TokenUsageDelta) => void;
  onError: (error: Error) => void;
  signal?: AbortSignal;
};

type StreamChunkPayload = {
  choices?: {
    delta?: {
      content?: string;
      reasoning_content?: string;
    };
    message?: {
      content?: string;
      reasoning_content?: string;
    };
  }[];
  usage?: TokenUsageDelta;
  error?: {
    message?: string;
  };
};

type CompletionResponse = {
  choices?: {
    message?: {
      content?: string;
      reasoning_content?: string;
    };
  }[];
  usage?: TokenUsageDelta;
  error?: {
    message?: string;
  };
};

function buildRequestBody(
  model: DeepSeekModelId,
  messages: ChatCompletionMessage[],
  thinkingEnabled: boolean,
  stream: boolean
) {
  const useThinking = shouldUseThinking(model, thinkingEnabled);
  const body: Record<string, unknown> = {
    model,
    messages,
    stream,
  };

  if (stream) {
    body.stream_options = { include_usage: true };
  }

  if (useThinking) {
    body.thinking = { type: "enabled" };
    body.reasoning_effort = "high";
  } else if (isV4Model(model)) {
    // V4 默认开启思考；关闭时必须显式 disabled，否则仍会返回 reasoning_content
    body.thinking = { type: "disabled" };
  }

  return body;
}

function parseApiErrorMessage(raw: string, status?: number): string {
  if (!raw.trim()) {
    return status ? `HTTP ${status}` : "Unknown API error";
  }

  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string } };
    if (parsed.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // keep raw text below
  }

  return raw.slice(0, 200);
}

async function consumeSseStream(
  body: ReadableStream<Uint8Array>,
  onPayload: (payload: string) => void
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(":")) {
        continue;
      }
      if (!trimmed.startsWith("data:")) {
        continue;
      }
      const payload = trimmed.slice(5).trimStart();
      if (payload === "[DONE]") {
        return;
      }
      if (payload) {
        onPayload(payload);
      }
    }
  }
}

async function completeWithAxios(
  apiKey: string,
  model: DeepSeekModelId,
  messages: ChatCompletionMessage[],
  thinkingEnabled: boolean,
  signal?: AbortSignal
): Promise<{ content: string; reasoningContent?: string; usage?: TokenUsageDelta }> {
  const response = await axios.post<CompletionResponse>(
    DEEPSEEK_API_URL,
    buildRequestBody(model, messages, thinkingEnabled, false),
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal,
    }
  );

  const message = response.data.choices?.[0]?.message;
  if (!message?.content && !message?.reasoning_content) {
    const apiMessage = response.data.error?.message;
    if (apiMessage) {
      throw new Error(apiMessage);
    }
    throw new Error("API returned empty response.");
  }

  return {
    content: message.content ?? "",
    reasoningContent: message.reasoning_content,
    usage: response.data.usage,
  };
}

export async function streamDeepSeekChat({
  apiKey,
  model,
  messages,
  thinkingEnabled,
  onDelta,
  onComplete,
  onError,
  signal,
}: StreamDeepSeekChatOptions): Promise<void> {
  const useThinking = shouldUseThinking(model, thinkingEnabled);

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(
        buildRequestBody(model, messages, thinkingEnabled, true)
      ),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(parseApiErrorMessage(errorText, response.status));
    }

    if (!response.body) {
      const fallback = await completeWithAxios(
        apiKey,
        model,
        messages,
        thinkingEnabled,
        signal
      );
      if (fallback.reasoningContent && useThinking) {
        onDelta({ reasoningContent: fallback.reasoningContent });
      }
      if (fallback.content) {
        onDelta({ content: fallback.content });
      }
      onComplete(fallback.usage);
      return;
    }

    let usage: TokenUsageDelta | undefined;

    await consumeSseStream(response.body, (payload) => {
      const parsed = JSON.parse(payload) as StreamChunkPayload;
      if (parsed.error?.message) {
        throw new Error(parsed.error.message);
      }
      const delta = parsed.choices?.[0]?.delta;
      if (delta?.content) {
        onDelta({ content: delta.content });
      }
      if (delta?.reasoning_content && useThinking) {
        onDelta({ reasoningContent: delta.reasoning_content });
      }
      if (parsed.usage) {
        usage = parsed.usage;
      }
    });

    onComplete(usage);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }

    const streamError = error instanceof Error ? error : new Error("Unknown streaming error");

    try {
      const fallback = await completeWithAxios(
        apiKey,
        model,
        messages,
        thinkingEnabled,
        signal
      );
      if (fallback.reasoningContent && useThinking) {
        onDelta({ reasoningContent: fallback.reasoningContent });
      }
      if (fallback.content) {
        onDelta({ content: fallback.content });
      }
      onComplete(fallback.usage);
      return;
    } catch (fallbackError) {
      if (fallbackError instanceof Error && fallbackError.name === "AbortError") {
        return;
      }
      if (axios.isAxiosError(fallbackError)) {
        const status = fallbackError.response?.status;
        const data = fallbackError.response?.data as { error?: { message?: string } } | string | undefined;
        const apiMessage =
          typeof data === "object" && data?.error?.message
            ? data.error.message
            : typeof data === "string"
              ? parseApiErrorMessage(data, status)
              : fallbackError.message;
        onError(new Error(apiMessage));
        return;
      }
      onError(
        fallbackError instanceof Error ? fallbackError : streamError
      );
    }
  }
}

export function buildChatApiMessages(
  messages: {
    system?: boolean;
    text?: string;
    isPending?: boolean;
    user: { _id: string | number };
  }[]
): ChatCompletionMessage[] {
  return [...messages]
    .filter(
      (message) =>
        !message.system &&
        !message.isPending &&
        typeof message.text === "string" &&
        message.text.trim().length > 0
    )
    .reverse()
    .map((message) => ({
      role: message.user._id === 1 ? "user" : "assistant",
      content: message.text?.trim() ?? "",
    }));
}

export function formatChatErrorMessage(error: Error): string {
  return `请求失败：${error.message}`;
}
