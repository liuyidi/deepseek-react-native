import { DEEPSEEK_API_URL } from "@/lib/deepseekConfig";
import {
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
  }[];
  usage?: TokenUsageDelta;
};

function buildRequestBody(
  model: DeepSeekModelId,
  messages: ChatCompletionMessage[],
  thinkingEnabled: boolean
) {
  const useThinking = shouldUseThinking(model, thinkingEnabled);
  return {
    model,
    messages,
    stream: true,
    stream_options: { include_usage: true },
    ...(useThinking
      ? {
          thinking: { type: "enabled" as const },
          reasoning_effort: "high" as const,
        }
      : {
          thinking: { type: "disabled" as const },
        }),
  };
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
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) {
        continue;
      }
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") {
        return;
      }
      if (payload) {
        onPayload(payload);
      }
    }
  }
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
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(buildRequestBody(model, messages, thinkingEnabled)),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Streaming response body is empty.");
    }

    let usage: TokenUsageDelta | undefined;

    await consumeSseStream(response.body, (payload) => {
      const parsed = JSON.parse(payload) as StreamChunkPayload;
      const delta = parsed.choices?.[0]?.delta;
      if (delta?.content) {
        onDelta({ content: delta.content });
      }
      if (delta?.reasoning_content) {
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
    onError(error instanceof Error ? error : new Error("Unknown streaming error"));
  }
}

export function buildChatApiMessages(
  messages: { system?: boolean; text?: string; user: { _id: string | number } }[]
): ChatCompletionMessage[] {
  return [...messages]
    .filter(
      (message) =>
        !message.system &&
        typeof message.text === "string" &&
        message.text.trim().length > 0
    )
    .reverse()
    .map((message) => ({
      role: message.user._id === 1 ? "user" : "assistant",
      content: message.text?.trim() ?? "",
    }));
}
