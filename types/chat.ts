import type { IMessage } from "react-native-gifted-chat";

export type AppChatMessage = IMessage & {
  reasoningContent?: string;
  isPending?: boolean;
};
