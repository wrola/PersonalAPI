import { MessageContent } from '@langchain/core/messages';
export type Content =
  | MessageContent
  | {
      name: string;
      args: Record<string, unknown>;
    };