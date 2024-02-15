export class OutputConversationDto {
  constructor(
    private answer: Record<string, unknown>,
    private conversationId: string,
  ) {}
}
